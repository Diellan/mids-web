import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DatabaseAPI } from '../src/core/DatabaseAPI'
import { ServerData } from '../src/core/ServerData'
import path from 'node:path'
import fs from 'node:fs/promises'
import { ConfigData } from '../src/core/ConfigData'

global.fetch = vi.fn(async (url: string) => {
  const filePath = path.resolve(__dirname, "../public", url.replace(/^\//, ""));
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

describe('DatabaseAPI.LoadServerData() Integration Tests', () => {
  const mockServerDataJson = {
    ManifestUri: 'https://midsreborn.com/mids_updates/db/update_manifest.xml',
    BaseToHit: 0.75,
    BaseFlySpeed: 31.5,
    BaseJumpSpeed: 21,
    BaseJumpHeight: 4,
    BasePerception: 500,
    BaseRunSpeed: 21,
    MaxFlySpeed: 86,
    MaxJumpSpeed: 114.4,
    MaxJumpHeight: 200,
    MaxRunSpeed: 135.67,
    MaxMaxFlySpeed: 258.285,
    MaxMaxJumpSpeed: 166.257,
    MaxMaxRunSpeed: 176.358,
    MaxSlots: 67,
    EnableInherentSlotting: false,
    HealthSlots: 2,
    HealthSlot1Level: 8,
    HealthSlot2Level: 16,
    StaminaSlots: 2,
    StaminaSlot1Level: 12,
    StaminaSlot2Level: 22,
    EnabledIncarnates: {
      Alpha: true,
      Destiny: true,
      Genesis: false,
      Hybrid: true,
      Interface: true,
      Judgement: true,
      Lore: true,
      Omega: false,
      Stance: false,
      Vitae: false,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset ServerData instance
    ;(ServerData as any)._instance = null
    // Reset require cache to ensure fresh mocks
    vi.resetModules()
  })

  it('should load ServerData from JSON file when it exists', async () => {
    // Act
    const result = await DatabaseAPI.LoadAllData('Databases/Homecoming');

    // Assert
    expect(result).toBeUndefined()
    expect(DatabaseAPI.Database.AttribMods).toBeDefined()
    expect(DatabaseAPI.Database.Classes).toBeDefined()
    expect(DatabaseAPI.Database.Classes.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.CrypticReplTable).toBeDefined()
    expect(DatabaseAPI.Database.Date).toBeDefined()
    expect(DatabaseAPI.Database.EffectIds).toBeDefined()
    expect(DatabaseAPI.Database.EffectIds.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.EnhGradeStringLong).toBeDefined()
    expect(DatabaseAPI.Database.EnhGradeStringLong.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.EnhGradeStringShort).toBeDefined()
    expect(DatabaseAPI.Database.EnhGradeStringShort.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.EnhancementClasses).toBeDefined()
    expect(DatabaseAPI.Database.EnhancementClasses.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.EnhancementGrades).toBeDefined()
    expect(DatabaseAPI.Database.EnhancementGrades.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.EnhancementSets).toBeDefined()
    expect(DatabaseAPI.Database.EnhancementSets.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Enhancements).toBeDefined()
    expect(DatabaseAPI.Database.Enhancements.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Entities).toBeDefined()
    expect(DatabaseAPI.Database.Entities.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.I9).toBeDefined()
    expect(DatabaseAPI.Database.Issue).toBeDefined()
    expect(DatabaseAPI.Database.Levels).toBeDefined()
    expect(DatabaseAPI.Database.Levels.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Levels_MainPowers).toBeDefined()
    expect(DatabaseAPI.Database.Levels_MainPowers.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.MultDO).toBeDefined()
    expect(DatabaseAPI.Database.MultED).toBeDefined()
    expect(DatabaseAPI.Database.MultHO).toBeDefined()
    expect(DatabaseAPI.Database.MultIO).toBeDefined()
    expect(DatabaseAPI.Database.MultSO).toBeDefined()
    expect(DatabaseAPI.Database.MultTO).toBeDefined()
    expect(DatabaseAPI.Database.MutexList).toBeDefined()
    expect(DatabaseAPI.Database.MutexList.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Origins).toBeDefined()
    expect(DatabaseAPI.Database.Origins.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.PageVol).toBeDefined()
    expect(DatabaseAPI.Database.PageVolText).toBeDefined()
    expect(DatabaseAPI.Database.PageVolText.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Powersets).toBeDefined()
    expect(DatabaseAPI.Database.Powersets.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.PowersetGroups).toBeDefined()
    expect(DatabaseAPI.Database.PowersetGroups.size).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Power).toBeDefined()
    expect(DatabaseAPI.Database.Power.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.RecipeRevisionDate).toBeDefined()
    expect(DatabaseAPI.Database.Recipes).toBeDefined()
    expect(DatabaseAPI.Database.Recipes.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.RecipeSource1).toBeDefined()
    expect(DatabaseAPI.Database.RecipeSource2).toBeDefined()
    expect(DatabaseAPI.Database.ReplTable).toBeDefined()
    expect(DatabaseAPI.Database.Salvage).toBeDefined()
    expect(DatabaseAPI.Database.Salvage.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.SetTypes).toBeDefined()
    expect(DatabaseAPI.Database.SetTypes.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.SpecialEnhancements).toBeDefined()
    expect(DatabaseAPI.Database.SpecialEnhancements.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.VersionEnhDb).toBeDefined()
    expect(DatabaseAPI.Database.Version).toBeDefined()
    expect(DatabaseAPI.Database.Version.length).toBeGreaterThan(0)
    expect(DatabaseAPI.Database.Loading).toBeDefined()
  })

})

