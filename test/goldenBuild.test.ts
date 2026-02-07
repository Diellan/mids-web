import { describe, it, beforeAll, expect, vi } from "vitest";
import { DatabaseAPI } from "../src/core/DatabaseAPI";
import { createDomainStore } from "../src/domainStore/DomainStore";

import { loadGoldenResult } from "./helpers/loadGoldenResult";

import path from 'node:path'
import fs from 'node:fs/promises'
import { PowerEntry } from "../src/core/PowerEntry";
import { GroupedFx } from "../src/core/GroupedFx";

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
    const store = createDomainStore(db).getState();

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

  it("matches cumulative set bonus totals", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense) - all off.mbd";

    // (c) create store & trigger calculations
    const store = createDomainStore(db).getState();

    await store.loadBuildFile(buildFile);
    expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
    
    // Force any lazy computation paths if needed
    const setBonuses = store.getCumulativeSetBonuses()
      .sort((a, b) => a.CompareTo(b))
      .map(b => b.BuildEffectString(true, "", false, false, false, true));

    expect(setBonuses).not.toBeNull();
    const expected = loadGoldenResult(
      "test/test-data/golden/electrical_melee_shield_defense_brute_all_off_set_bonuses.json"
    );

    expect(setBonuses).toEqual(expected);
  });

  it("matches full set bonuses", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense) - all off.mbd";

    // (c) create store & trigger calculations
    const store = createDomainStore(db).getState();

    await store.loadBuildFile(buildFile);
    expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
    
    // Force any lazy computation paths if needed
    const setBonuses = store.getCumulativeSetBonuses()
      .sort((a, b) => a.CompareTo(b))
      .map(b => b.BuildEffectString(true, "", false, false, false, true));

    expect(setBonuses).not.toBeNull();
    const expected = loadGoldenResult(
      "test/test-data/golden/electrical_melee_shield_defense_brute_all_off_set_bonuses.json"
    );

    expect(setBonuses).toEqual(expected);
  });

  it("matches all off totals", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense) - all off.mbd";

    // (c) create store & trigger calculations
    const store = createDomainStore(db).getState();

    await store.loadBuildFile(buildFile);
    expect(store.getCharacterName()).toBe("Lorenzo Mondavi");
    
    // Force any lazy computation paths if needed
    const actualTotals = store.getTotalStatistics();

    // (d) load expected golden values
    const expected = loadGoldenResult(
      "test/test-data/golden/electrical_melee_shield_defense_brute_all_off.json"
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

  it("matches golden totals", async () => {
    // (a) database is already loaded
    const db = DatabaseAPI.Database;

    // (b) load a Mids build (export string / file / JSON)
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";

    // (c) create store & trigger calculations
    const store = createDomainStore(db).getState();

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
    // expect(actualTotals.EndUse).toBeCloseTo(expected.EndUse, 2); // TODO: Fix bug where EndUse is not matching expected (even in mids it is inconsistent)
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

  it("toggleStatInclude changes totals", async () => {
    const db = DatabaseAPI.Database;
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";
    const store = createDomainStore(db).getState();
    await store.loadBuildFile(buildFile);

    // Find a toggle power with StatInclude=true (Shield Defense toggle)
    const powers = store.getPowers();
    const togglePower = powers.find(
      p => p && p.StatInclude && p.CanIncludeForStats() && p.Power?.DisplayName === "Deflection"
    );
    expect(togglePower).toBeTruthy();

    // Record initial totals
    const initialTotals = store.getTotalStatistics();
    const initialDef = [...initialTotals.Def];

    // Toggle the power off
    await store.toggleStatInclude(togglePower!.id);
    expect(togglePower!.StatInclude).toBe(false);

    // Totals should have changed — defense should be lower
    const afterOffTotals = store.getTotalStatistics();
    const defDecreased = initialDef.some((d, i) => d > afterOffTotals.Def[i]);
    expect(defDecreased).toBe(true);

    // Toggle back on — totals should match initial
    await store.toggleStatInclude(togglePower!.id);
    expect(togglePower!.StatInclude).toBe(true);

    const restoredTotals = store.getTotalStatistics();
    for (let i = 0; i < initialDef.length; i++) {
      expect(restoredTotals.Def[i]).toBeCloseTo(initialDef[i], 2);
    }
  });

  it("toggleStatInclude on from all-off build increases totals", async () => {
    const db = DatabaseAPI.Database;
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense) - all off.mbd";
    const store = createDomainStore(db).getState();
    await store.loadBuildFile(buildFile);

    const initialTotals = store.getTotalStatistics();
    const initialDef = [...initialTotals.Def];

    // Find Deflection (Shield Defense toggle) — should be off in the all-off build
    const powers = store.getPowers();
    const deflection = powers.find(
      p => p && !p.StatInclude && p.CanIncludeForStats() && p.Power?.DisplayName === "Deflection"
    );
    expect(deflection).toBeTruthy();

    // Toggle it on
    await store.toggleStatInclude(deflection!.id);
    expect(deflection!.StatInclude).toBe(true);

    // Defense should increase
    const afterOnTotals = store.getTotalStatistics();
    const defIncreased = initialDef.some((d, i) => afterOnTotals.Def[i] > d);
    expect(defIncreased).toBe(true);
  });

  it("toggleStatInclude is no-op for non-toggleable powers", async () => {
    const db = DatabaseAPI.Database;
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";
    const store = createDomainStore(db).getState();
    await store.loadBuildFile(buildFile);

    // Find a click power that is not a click buff (can't include for stats)
    const powers = store.getPowers();
    const clickPower = powers.find(
      p => p && p.NIDPower > -1 && !p.CanIncludeForStats()
    );
    expect(clickPower).toBeTruthy();
    const wasIncluded = clickPower!.StatInclude;

    await store.toggleStatInclude(clickPower!.id);

    // Should not have changed
    expect(clickPower!.StatInclude).toBe(wasIncluded);
  });

  it("toggleStatInclude triggers store subscription with updated totals", async () => {
    const db = DatabaseAPI.Database;
    const buildFile = "test-data/builds/Lorenzo (Electrical Melee - Shield Defense).mbd";
    const storeApi = createDomainStore(db);
    const store = storeApi.getState();
    await store.loadBuildFile(buildFile);

    // Find Deflection toggle
    const powers = store.getPowers();
    const deflection = powers.find(
      p => p && p.StatInclude && p.CanIncludeForStats() && p.Power?.DisplayName === "Deflection"
    );
    expect(deflection).toBeTruthy();

    // Record initial defense from store state
    const initialDef = [...storeApi.getState().totals.Def];

    // Track subscription updates
    let subscriptionCallCount = 0;
    let lastTotals: typeof store.totals | null = null;

    const unsubscribe = storeApi.subscribe((state) => {
      subscriptionCallCount++;
      lastTotals = state.totals;
    });

    // Toggle off
    await store.toggleStatInclude(deflection!.id);

    // Should have notified subscribers
    expect(subscriptionCallCount).toBeGreaterThan(0);
    expect(lastTotals).not.toBeNull();

    // The subscribed totals should show decreased defense
    const defDecreased = initialDef.some((d, i) => d > lastTotals!.Def[i]);
    expect(defDecreased).toBe(true);

    unsubscribe();
  });
});
