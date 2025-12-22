import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DatabaseAPI } from '../src/core/DatabaseAPI'
import { ServerData } from '../src/core/ServerData'
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

describe('DatabaseAPI.LoadServerData() Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset ServerData instance
    ;(ServerData as any)._instance = null
    // Reset require cache to ensure fresh mocks
    vi.resetModules()
  })

  it('should load ServerData from JSON file when it exists', async () => {
    // Act
    const result = await DatabaseAPI.LoadAllData('../public/Databases/Homecoming');

    // Assert
    expect(result).toBeUndefined()
    const database = DatabaseAPI.Database;
    expect(database.AttribMods).toBeDefined()
    expect(database.Classes).toBeDefined()
    expect(database.Classes.length).toBeGreaterThan(0)
    expect(database.CrypticReplTable).toBeDefined()
    expect(database.Date).toBeDefined()
    expect(database.EffectIds).toBeDefined()
    expect(database.EffectIds.length).toBeGreaterThan(0)
    expect(database.EnhGradeStringLong).toBeDefined()
    expect(database.EnhGradeStringLong.length).toBeGreaterThan(0)
    expect(database.EnhGradeStringShort).toBeDefined()
    expect(database.EnhGradeStringShort.length).toBeGreaterThan(0)
    expect(database.EnhancementClasses).toBeDefined()
    expect(database.EnhancementClasses.length).toBeGreaterThan(0)
    expect(database.EnhancementGrades).toBeDefined()
    expect(database.EnhancementGrades.length).toBeGreaterThan(0)
    expect(database.EnhancementSets).toBeDefined()
    expect(database.EnhancementSets.length).toBeGreaterThan(0)
    expect(database.Enhancements).toBeDefined()
    expect(database.Enhancements.length).toBeGreaterThan(0)
    expect(database.Entities).toBeDefined()
    expect(database.Entities.length).toBeGreaterThan(0)
    expect(database.I9).toBeDefined()
    expect(database.Issue).toBeDefined()
    expect(database.Levels).toBeDefined()
    expect(database.Levels.length).toBeGreaterThan(0)
    expect(database.Levels_MainPowers).toBeDefined()
    expect(database.Levels_MainPowers.length).toBeGreaterThan(0)
    expect(database.MultDO).toBeDefined()
    expect(database.MultED).toBeDefined()
    expect(database.MultHO).toBeDefined()
    expect(database.MultIO).toBeDefined()
    expect(database.MultSO).toBeDefined()
    expect(database.MultTO).toBeDefined()
    expect(database.MutexList).toBeDefined()
    expect(database.MutexList.length).toBeGreaterThan(0)
    expect(database.Origins).toBeDefined()
    expect(database.Origins.length).toBeGreaterThan(0)
    expect(database.PageVol).toBeDefined()
    expect(database.PageVolText).toBeDefined()
    expect(database.PageVolText.length).toBeGreaterThan(0)
    expect(database.Powersets).toBeDefined()
    expect(database.Powersets.length).toBeGreaterThan(0)
    expect(database.PowersetGroups).toBeDefined()
    expect(database.PowersetGroups.size).toBeGreaterThan(0)
    expect(database.Power).toBeDefined()
    expect(database.Power.length).toBeGreaterThan(0)
    expect(database.RecipeRevisionDate).toBeDefined()
    expect(database.Recipes).toBeDefined()
    expect(database.Recipes.length).toBeGreaterThan(0)
    expect(database.RecipeSource1).toBeDefined()
    expect(database.RecipeSource2).toBeDefined()
    expect(database.ReplTable).toBeDefined()
    expect(database.Salvage).toBeDefined()
    expect(database.Salvage.length).toBeGreaterThan(0)
    expect(database.SetTypes).toBeDefined()
    expect(database.SetTypes.length).toBeGreaterThan(0)
    expect(database.SpecialEnhancements).toBeDefined()
    expect(database.SpecialEnhancements.length).toBeGreaterThan(0)
    expect(database.VersionEnhDb).toBeDefined()
    expect(database.Version).toBeDefined()
    expect(database.Loading).toBeDefined()
  })

})

