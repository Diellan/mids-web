import { describe, it, beforeAll, expect, vi } from "vitest";
import { DatabaseAPI } from "../src/core/DatabaseAPI";
import { DomainStore } from "../src/domainStore/DomainStore";

import { loadGoldenResult } from "./helpers/loadGoldenResult";

import path from 'node:path'
import fs from 'node:fs/promises'

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
      statusText: 'Not Found'
    };
  }

  return {
    ok: true,
    arrayBuffer: async () => buffer,
    text: async () => buffer.toString(),
    json: async () => JSON.parse(buffer.toString())
  } as any;
});

describe("Golden Mids build comparisons", async () => {
  beforeAll(async () => {
    await DatabaseAPI.LoadAllData("../public/Databases/Homecoming");
  });

  it("loads all the right data", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";

    // (c) create store & trigger calculations
    const store = new DomainStore(db);

    await store.loadBuildFile(buildFile);
    expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
    expect(store.getCharacterArchetype()?.DisplayName).toBe("Brute");
    expect(store.getCharacterOrigin()?.Name).toBe("Magic");
    expect(store.getPowersetByIndex(0)?.DisplayName).toBe("Electrical Melee");
    expect(store.getPowersetByIndex(1)?.DisplayName).toBe("Shield Defense");
    expect(store.getPowersetByIndex(2)).toBeNull();
    expect(store.getPowersetByIndex(3)?.DisplayName).toBe("Speed");
    expect(store.getPowersetByIndex(4)?.DisplayName).toBe("Leaping");
    expect(store.getPowersetByIndex(5)?.DisplayName).toBe("Fighting");
    expect(store.getPowersetByIndex(6)?.DisplayName).toBe("Concealment");
    expect(store.getPowersetByIndex(7)?.DisplayName).toBe("Soul Mastery");

    expect(store.getPowers().length).toBe(41);
    const powerNames = store.getPowers().map(p => p?.Power?.DisplayName);
    expect(powerNames).toContain("Charged Brawl");
    expect(powerNames).toContain("Shield Charge");
    expect(powerNames).toContain("Combat Jumping");
    expect(powerNames).toContain("Hasten");
    expect(powerNames).toContain("Tough");
    expect(powerNames).toContain("Dark Obliteration");
    expect(powerNames).toContain("Stamina");
    expect(powerNames).toContain("Spectral Radial Flawless Interface");
  });

  it("matches golden totals", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";

    // (c) create store & trigger calculations
    const store = new DomainStore(db);

    await store.loadBuildFile(buildFile);
    expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
    
    // Force any lazy computation paths if needed
    const actualTotals = store.getTotalStatistics();

    // (d) load expected golden values
    const expected = loadGoldenResult(
      "test/test-data/golden/electrical_melee_shield_defense_brute.json"
    );

    // Compare with tolerance
    expect(actualTotals.Absorb).toBeCloseTo(expected.Absorb, 2);
    expect(actualTotals.BuffAcc).toBeCloseTo(expected.BuffAcc, 2);
    expect(actualTotals.BuffToHit).toBeCloseTo(expected.BuffToHit, 2);
    expect(actualTotals.EndRec).toBeCloseTo(expected.EndRec, 2);
    expect(actualTotals.EndUse).toBeCloseTo(expected.EndUse, 2);
    expect(actualTotals.EndMax).toBeCloseTo(expected.EndMax, 2);
    expect(actualTotals.RunSpd).toBeCloseTo(expected.RunSpd, 2);
    expect(actualTotals.JumpSpd).toBeCloseTo(expected.JumpSpd, 2);
    expect(actualTotals.JumpHeight).toBeCloseTo(expected.JumpHeight, 2);
    expect(actualTotals.StealthPvE).toBeCloseTo(expected.StealthPvE, 2);
    expect(actualTotals.StealthPvP).toBeCloseTo(expected.StealthPvP, 2);
    expect(actualTotals.ThreatLevel).toBeCloseTo(expected.ThreatLevel, 2);
    expect(actualTotals.Perception).toBeCloseTo(expected.Perception, 2);
    expect(actualTotals.BuffHaste).toBeCloseTo(expected.BuffHaste, 2);
    expect(actualTotals.BuffDam).toBeCloseTo(expected.BuffDam, 2);
    expect(actualTotals.BuffEndRdx).toBeCloseTo(expected.BuffEndRdx, 2);
    expect(actualTotals.BuffRange).toBeCloseTo(expected.BuffRange, 2);
    expect(actualTotals.HPRegen).toBeCloseTo(expected.HPRegen, 2);
    expect(actualTotals.HPMax).toBeCloseTo(expected.HPMax, 2);
    for (let i = 0; i < actualTotals.Def.length; i++) {
      expect(actualTotals.Def[i]).toBeCloseTo(expected.Def[i], 2);
    }
    for (let i = 0; i < actualTotals.Res.length; i++) {
      expect(actualTotals.Res[i]).toBeCloseTo(expected.Res[i], 2);
    }
    for (let i = 0; i < actualTotals.MezRes.length; i++) {
      expect(actualTotals.MezRes[i]).toBeCloseTo(expected.MezRes[i], 2);
    }
    for (let i = 0; i < actualTotals.DebuffRes.length; i++) {
      expect(actualTotals.DebuffRes[i]).toBeCloseTo(expected.DebuffRes[i], 2);
    }
    for (let i = 0; i < actualTotals.Elusivity.length; i++) {
      expect(actualTotals.Elusivity[i]).toBeCloseTo(expected.Elusivity[i], 2);
    }
    expect(actualTotals.ElusivityMax).toBeCloseTo(expected.ElusivityMax, 2);
    expect(actualTotals.MaxRunSpd).toBeCloseTo(expected.MaxRunSpd, 2);
    expect(actualTotals.MaxJumpSpd).toBeCloseTo(expected.MaxJumpSpd, 2);
    expect(actualTotals.MaxFlySpd).toBeCloseTo(expected.MaxFlySpd, 2);
    expect(actualTotals.JumpHeight).toBeCloseTo(expected.JumpHeight, 2);
    expect(actualTotals.StealthPvE).toBeCloseTo(expected.StealthPvE, 2);
    expect(actualTotals.StealthPvP).toBeCloseTo(expected.StealthPvP, 2);
    expect(actualTotals.ThreatLevel).toBeCloseTo(expected.ThreatLevel, 2);
    expect(actualTotals.Perception).toBeCloseTo(expected.Perception, 2);
    expect(actualTotals.BuffHaste).toBeCloseTo(expected.BuffHaste, 2);
    expect(actualTotals.BuffAcc).toBeCloseTo(expected.BuffAcc, 2);
    expect(actualTotals.BuffToHit).toBeCloseTo(expected.BuffToHit, 2);
    expect(actualTotals.BuffDam).toBeCloseTo(expected.BuffDam, 2);
    expect(actualTotals.BuffEndRdx).toBeCloseTo(expected.BuffEndRdx, 2);
    expect(actualTotals.BuffRange).toBeCloseTo(expected.BuffRange, 2);
    expect(actualTotals.HPRegen).toBeCloseTo(expected.HPRegen, 2);
    expect(actualTotals.HPMax).toBeCloseTo(expected.HPMax, 2);
  });
});
