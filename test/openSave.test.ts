import { describe, it, beforeAll, expect, vi } from "vitest";
import { DatabaseAPI } from "../src/core/DatabaseAPI";
import { BuildManager } from "../src/core/BuildFile/BuildManager";

import { createDomainStore } from "../src/domainStore/DomainStore";

import path from "node:path";
import fs from "node:fs/promises";

global.fetch = vi.fn(async (url: URL | RequestInfo) => {
  if (typeof url !== "string") {
    throw new Error("Only string URLs are supported in this mock fetch");
  }

  const filePath = path.resolve(__dirname, url.replace(/^\//, ""));
  let buffer: Buffer;
  try {
    buffer = await fs.readFile(filePath);
  } catch (error) {
    return {
      ok: false,
      status: 404,
      statusText: "Not Found",
    };
  }

  return {
    ok: true,
    arrayBuffer: async () => buffer,
    text: async () => buffer.toString(),
    json: async () => JSON.parse(buffer.toString()),
  } as any;
});

const BUILD_FILE =
  "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";
const OLD_MBD_FILE = "test-data/builds/old mbd format.mbd";
const MXD_FILE =
  "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mxd";

describe("Open and Save", () => {
  beforeAll(async () => {
    await DatabaseAPI.LoadAllData("../public/Databases/Homecoming");
  });

  describe("BuildManager.LoadFromContent", () => {
    it("loads a build from raw JSON content", async () => {
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(content);

      expect(toon).not.toBeNull();
      expect(toon.Name).toBe("Lorenzo Mondavi");
      expect(toon.Archetype?.DisplayName).toBe("Brute");
    });

    it("produces the same result as LoadFromFile", async () => {
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toonFromContent =
        await BuildManager.Instance.LoadFromContent(content);
      const toonFromFile =
        await BuildManager.Instance.LoadFromFile(BUILD_FILE);

      expect(toonFromContent.Name).toBe(toonFromFile.Name);
      expect(toonFromContent.Archetype?.DisplayName).toBe(
        toonFromFile.Archetype?.DisplayName
      );
      expect(toonFromContent.CurrentBuild?.Powers.length).toBe(
        toonFromFile.CurrentBuild?.Powers.length
      );
    });

    it("throws on invalid JSON", async () => {
      await expect(
        BuildManager.Instance.LoadFromContent("not valid json")
      ).rejects.toThrow("Failed to parse build data");
    });

    it("throws on empty content", async () => {
      await expect(
        BuildManager.Instance.LoadFromContent("")
      ).rejects.toThrow();
    });
  });

  describe("BuildManager.SerializeBuild", () => {
    it("serializes a loaded build to JSON", async () => {
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(content);
      const serialized = BuildManager.Instance.SerializeBuild(toon);

      expect(serialized).toBeTruthy();
      const parsed = JSON.parse(serialized);
      expect(parsed.Name).toBe("Lorenzo Mondavi");
      expect(parsed.Class).toBeTruthy();
      expect(parsed.PowerSets).toBeDefined();
      expect(parsed.PowerEntries).toBeDefined();
    });

    it("round-trips: load then save then load produces same character", async () => {
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon1 = await BuildManager.Instance.LoadFromContent(content);
      const serialized = BuildManager.Instance.SerializeBuild(toon1);
      const toon2 = await BuildManager.Instance.LoadFromContent(serialized);

      expect(toon2.Name).toBe(toon1.Name);
      expect(toon2.Archetype?.DisplayName).toBe(toon1.Archetype?.DisplayName);
      expect(toon2.CurrentBuild?.Powers.length).toBe(
        toon1.CurrentBuild?.Powers.length
      );
    });
  });

  describe("DomainStore.loadBuildFromContent", () => {
    it("loads a build into the store from content", async () => {
      const db = DatabaseAPI.Database;
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const store = createDomainStore(db).getState();
      await store.loadBuildFromContent(content);

      expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
      expect(store.getCharacterArchetype()?.DisplayName).toBe("Brute");
      expect(store.getPowersetByIndex(0)?.DisplayName).toBe(
        "Electrical Melee"
      );
      expect(store.getPowersetByIndex(1)?.DisplayName).toBe("Shield Defense");
      expect(store.getPowers().length).toBe(41);
    });

    it("matches loadBuildFile results", async () => {
      const db = DatabaseAPI.Database;
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const storeFromContent = createDomainStore(db).getState();
      await storeFromContent.loadBuildFromContent(content);

      const storeFromFile = createDomainStore(db).getState();
      await storeFromFile.loadBuildFile(BUILD_FILE);

      expect(storeFromContent.getCharacterName()).toBe(
        storeFromFile.getCharacterName()
      );
      expect(
        storeFromContent.getCharacterArchetype()?.DisplayName
      ).toBe(storeFromFile.getCharacterArchetype()?.DisplayName);
      expect(storeFromContent.getPowers().length).toBe(
        storeFromFile.getPowers().length
      );
    });
  });

  describe("Old MBD format (Enhancement name instead of Uid)", () => {
    it("loads a build using the old Enhancement name format", async () => {
      const filePath = path.resolve(__dirname, OLD_MBD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(content);

      expect(toon).not.toBeNull();
      expect(toon.Name).toBe("Angra");
      expect(toon.Archetype?.DisplayName).toBe("Corruptor");
    });

    it("resolves Enhancement names to valid Uids via EnhancementDataConverter", async () => {
      const filePath = path.resolve(__dirname, OLD_MBD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(content);
      const powers = toon.CurrentBuild!.Powers;
      const slottedPower = powers.find(
        (p) => p?.Power?.FullName === "Corruptor_Ranged.Fire_Blast.Fire_Blast"
      );

      expect(slottedPower).toBeDefined();
      expect(slottedPower!.Slots.length).toBeGreaterThan(0);
      expect(slottedPower!.Slots[0].Enhancement.Enh).toBeGreaterThanOrEqual(0);
    });

    it("round-trips: old format load then save then load preserves character", async () => {
      const filePath = path.resolve(__dirname, OLD_MBD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const toon1 = await BuildManager.Instance.LoadFromContent(content);
      const serialized = BuildManager.Instance.SerializeBuild(toon1);
      const toon2 = await BuildManager.Instance.LoadFromContent(serialized);

      expect(toon2.Name).toBe(toon1.Name);
      expect(toon2.Archetype?.DisplayName).toBe(toon1.Archetype?.DisplayName);
      expect(toon2.CurrentBuild?.Powers.length).toBe(
        toon1.CurrentBuild?.Powers.length
      );
    });
  });

  describe("MXD format import via LoadFromContent", () => {
    it("loads a build from raw MXD file content", async () => {
      const filePath = path.resolve(__dirname, MXD_FILE);
      const fileContent = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(fileContent);

      expect(toon).not.toBeNull();
      expect(toon.Name).toBe("Lorenzo Mondavi");
      expect(toon.Archetype?.DisplayName).toBe("Brute");
    });

    it("has slotted enhancements after MXD import", async () => {
      const filePath = path.resolve(__dirname, MXD_FILE);
      const fileContent = await fs.readFile(filePath, "utf-8");

      const toon = await BuildManager.Instance.LoadFromContent(fileContent);

      const powers = toon.CurrentBuild!.Powers;
      const slottedPower = powers.find(
        (p) =>
          p?.Power?.FullName ===
          "Brute_Melee.Electrical_Melee.Charged_Brawl"
      );

      expect(slottedPower).toBeDefined();
      expect(slottedPower!.Slots.length).toBeGreaterThan(0);
      expect(slottedPower!.Slots[0].Enhancement.Enh).toBeGreaterThanOrEqual(0);
    });

    it("loads MXD into DomainStore via loadBuildFromContent", async () => {
      const db = DatabaseAPI.Database;
      const filePath = path.resolve(__dirname, MXD_FILE);
      const fileContent = await fs.readFile(filePath, "utf-8");

      const store = createDomainStore(db).getState();
      await store.loadBuildFromContent(fileContent);

      expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
      expect(store.getCharacterArchetype()?.DisplayName).toBe("Brute");
    });
  });

  describe("DomainStore.saveBuildFile", () => {
    it("invokes ipcRenderer with serialized content", async () => {
      const db = DatabaseAPI.Database;
      const filePath = path.resolve(__dirname, BUILD_FILE);
      const content = await fs.readFile(filePath, "utf-8");

      const mockInvoke = vi.fn().mockResolvedValue({ filePath: "test.mbd" });
      (globalThis as any).window = {
        ipcRenderer: { invoke: mockInvoke },
      };

      const store = createDomainStore(db).getState();
      await store.loadBuildFromContent(content);
      await store.saveBuildFile();

      expect(mockInvoke).toHaveBeenCalledOnce();
      expect(mockInvoke).toHaveBeenCalledWith(
        "dialog:save-file",
        expect.objectContaining({
          content: expect.any(String),
          defaultName: "Lorenzo Mondavi.mbd",
        })
      );

      const savedContent = mockInvoke.mock.calls[0][1].content;
      const parsed = JSON.parse(savedContent);
      expect(parsed.Name).toBe("Lorenzo Mondavi");

      delete (globalThis as any).window;
    });
  });
});
