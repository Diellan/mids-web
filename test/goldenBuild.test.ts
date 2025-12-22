import { describe, it, beforeAll, expect, vi } from "vitest";
import { DatabaseAPI } from "../src/core/DatabaseAPI";
import { DomainStore } from "../src/domainStore/DomainStore";

import { loadGoldenResult } from "./helpers/loadGoldenResult";

import path from 'node:path'
import fs from 'node:fs/promises'

global.fetch = vi.fn(async (url: string) => {
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
  };
});

describe("Golden Mids build comparisons", async () => {
  beforeAll(async () => {
    await DatabaseAPI.LoadAllData("../public/Databases/Homecoming");
  });

  it("Fire/Fire Blaster matches golden totals", async () => {
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
    expect(actualTotals.BuffAcc).toBeCloseTo(expected.BuffAcc, 2);
    expect(actualTotals.BuffToHit).toBeCloseTo(expected.BuffToHit, 2);
    expect(actualTotals.BuffDam).toBeCloseTo(expected.BuffDam, 2);
    expect(actualTotals.BuffEndRdx).toBeCloseTo(expected.BuffEndRdx, 2);
    expect(actualTotals.BuffRange).toBeCloseTo(expected.BuffRange, 2);
    expect(actualTotals.HPRegen).toBeCloseTo(expected.HPRegen, 2);
    expect(actualTotals.HPMax).toBeCloseTo(expected.HPMax, 2);
    expect(actualTotals.Def).toBeCloseTo(expected.Def, 2);
    expect(actualTotals.Res).toBeCloseTo(expected.Res, 2);
    expect(actualTotals.Mez).toBeCloseTo(expected.Mez, 2);
    expect(actualTotals.MezRes).toBeCloseTo(expected.MezRes, 2);
    expect(actualTotals.DebuffRes).toBeCloseTo(expected.DebuffRes, 2);
    expect(actualTotals.Elusivity).toBeCloseTo(expected.Elusivity, 2);
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
    expect(actualTotals.Def).toBeCloseTo(expected.Def, 2);
    expect(actualTotals.Res).toBeCloseTo(expected.Res, 2);
    expect(actualTotals.Mez).toBeCloseTo(expected.Mez, 2);
    expect(actualTotals.MezRes).toBeCloseTo(expected.MezRes, 2);
    expect(actualTotals.DebuffRes).toBeCloseTo(expected.DebuffRes, 2);
    expect(actualTotals.Elusivity).toBeCloseTo(expected.Elusivity, 2);
    expect(actualTotals.ElusivityMax).toBeCloseTo(expected.ElusivityMax, 2);
    expect(actualTotals.MaxRunSpd).toBeCloseTo(expected.MaxRunSpd, 2);
    expect(actualTotals.MaxJumpSpd).toBeCloseTo(expected.MaxJumpSpd, 2);
    expect(actualTotals.MaxFlySpd).toBeCloseTo(expected.MaxFlySpd, 2);
    expect(actualTotals.JumpHeight).toBeCloseTo(expected.JumpHeight, 2);
  });
});
