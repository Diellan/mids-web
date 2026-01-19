// Converted from C# DatabaseAPI.cs
// This is a large static utility class with many helper methods
import type { IDatabase } from './IDatabase';
import type { IPower } from './IPower';
import type { IPowerset } from './IPowerset';
import type { IEnhancement } from './IEnhancement';
import { PowersetGroup } from './PowersetGroup';
import { dmModes, ePowerSetType, eType } from './Enums';
import { Database } from './Base/Data_Classes/Database';
import { ServerData } from './ServerData';
import { AppDataPaths } from './AppDataPaths';
import type { TypeGrade } from './Utils/StructAndEnums';
import { RecipeRarity } from './Recipe';
import { EnhancementSet } from './EnhancementSet';
import { EnhancementSetCollection } from './EnhancementSetCollection';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { Archetype } from './Base/Data_Classes/Archetype';
import { Power } from './Base/Data_Classes/Power';
import { Powerset } from './Powerset';
import { Recipe } from './Recipe';
import { Salvage } from './Salvage';
import { Enhancement } from './Enhancement';
import { Origin } from './Base/Data_Classes/Origin';
import { LevelMap } from './LevelMap';
import { SummonedEntity } from './SummonedEntity';
import { Modifiers } from './Modifiers';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { PowersReplTable } from './PowersReplTable';
import { CrypticReplTable } from './Base/CrypticReplTable';
import { ConfigData } from './ConfigData';
import { parseVersion, Version } from './Utils/Helpers';

export class DatabaseAPI {
  private static AttribMod: Map<string, number> = new Map();
  private static Classes: Map<string, number> = new Map();
  private static WinterEventEnhancements: string[] = [];
  private static MovieEnhUIDList: string[] = [];
  private static PurpleSetsEnhUIDList: string[] = [];
  private static _archetypeEnhancements: string[] = [];

  static get Database(): IDatabase {
    return Database.Instance;
  }

  static get ServerData(): ServerData {
    return ServerData.Instance;
  }

  private static EnhTranslationTable: Map<string, string> = new Map([
    ['Artillery', 'Shrapnel'],
    ['Crafted_Cupids_Crush', 'Attuned_Cupids_Crush']
  ]);

  private static ClearLookups(): void {
    this.AttribMod.clear();
    this.Classes.clear();
  }

  static ExportAttribMods(): void {
    // try {
    //   // Note: Would need Application.StartupPath equivalent or configurable export path
    //   // For now, using a relative path or configurable location
    //   const exportPath = path.join(process.cwd(), 'Data', 'Export');
    //   if (!fs.existsSync(exportPath)) {
    //     fs.mkdirSync(exportPath, { recursive: true });
    //   }

    //   const path1 = path.join(exportPath, 'attribModTables.json');
    //   const path2 = path.join(exportPath, 'attribMod.json');
    //   const path3 = path.join(exportPath, 'attribModOrdered.json');

    //   // Export Database.AttribMods
    //   fs.writeFileSync(
    //     path1,
    //     JSON.stringify(this.Database.AttribMods, null, 2),
    //     'utf8'
    //   );

    //   // Export AttribMod dictionary
    //   const attribModObj = Object.fromEntries(this.AttribMod);
    //   fs.writeFileSync(path2, JSON.stringify(attribModObj, null, 2), 'utf8');

    //   // Export ordered AttribMod (sorted by value)
    //   const orderedEntries = Array.from(this.AttribMod.entries()).sort(
    //     (a, b) => a[1] - b[1]
    //   );
    //   const orderedObj = Object.fromEntries(orderedEntries);
    //   fs.writeFileSync(path3, JSON.stringify(orderedObj, null, 2), 'utf8');
    // } catch (e: any) {
    //   console.error('Error exporting AttribMods:', e);
    // }
  }

  static SaveJsonDatabase(serializer: any, msgOnCompletion: boolean = true): void {
    // try {
    //   // Note: This implementation requires a zip library (e.g., 'adm-zip' or 'jszip')
    //   // For now, creating JSON files without zip compression
    //   // To enable zip compression, install: npm install adm-zip
    //   // Then uncomment the zip-related code below

    //   const exportPath = path.join(process.cwd(), 'Databases');
    //   if (!fs.existsSync(exportPath)) {
    //     fs.mkdirSync(exportPath, { recursive: true });
    //   }

    //   const zipPath = path.join(exportPath, 'Mids.zip');

    //   // Serialize all database components
    //   const databaseJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database)
    //     : JSON.stringify(this.Database, null, 2);
    //   const archetypesJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Classes)
    //     : JSON.stringify(this.Database.Classes, null, 2);
    //   const attribModsJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.AttribMods)
    //     : JSON.stringify(this.Database.AttribMods, null, 2);
    //   const enhancementsJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Enhancements)
    //     : JSON.stringify(this.Database.Enhancements, null, 2);
    //   const enhancementClassesJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.EnhancementClasses)
    //     : JSON.stringify(this.Database.EnhancementClasses, null, 2);
    //   const entitiesJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Entities)
    //     : JSON.stringify(this.Database.Entities, null, 2);
    //   const levelsJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Levels)
    //     : JSON.stringify(this.Database.Levels, null, 2);
    //   const powersJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Power)
    //     : JSON.stringify(this.Database.Power, null, 2);
    //   const powersetsJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Powersets)
    //     : JSON.stringify(this.Database.Powersets, null, 2);
    //   const powersetGroupsJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.PowersetGroups)
    //     : JSON.stringify(Array.from(this.Database.PowersetGroups.entries()), null, 2);
    //   const recipesJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Recipes)
    //     : JSON.stringify(this.Database.Recipes, null, 2);
    //   const salvageJson = serializer.Serialize
    //     ? serializer.Serialize(this.Database.Salvage)
    //     : JSON.stringify(this.Database.Salvage, null, 2);

    //   // Try to use zip library if available, otherwise save as individual JSON files
    //   try {
    //     // Dynamic import for optional zip library
    //     const AdmZip = require('adm-zip');
    //     const zip = new AdmZip();

    //     zip.addFile('Database.json', Buffer.from(databaseJson, 'utf8'));
    //     zip.addFile('Archetypes.json', Buffer.from(archetypesJson, 'utf8'));
    //     zip.addFile('AttribMods.json', Buffer.from(attribModsJson, 'utf8'));
    //     zip.addFile('Enhancement.json', Buffer.from(enhancementsJson, 'utf8'));
    //     zip.addFile('EnhancementClasses.json', Buffer.from(enhancementClassesJson, 'utf8'));
    //     zip.addFile('Entities.json', Buffer.from(entitiesJson, 'utf8'));
    //     zip.addFile('Levels.json', Buffer.from(levelsJson, 'utf8'));
    //     zip.addFile('Powers.json', Buffer.from(powersJson, 'utf8'));
    //     zip.addFile('PowerSets.json', Buffer.from(powersetsJson, 'utf8'));
    //     zip.addFile('PowerSetGroups.json', Buffer.from(powersetGroupsJson, 'utf8'));
    //     zip.addFile('Recipes.json', Buffer.from(recipesJson, 'utf8'));
    //     zip.addFile('Salvage.json', Buffer.from(salvageJson, 'utf8'));

    //     zip.writeZip(zipPath);
    //   } catch (zipError) {
    //     // Fallback: save as individual JSON files if zip library is not available
    //     console.warn(
    //       'Zip library not available. Saving as individual JSON files instead.'
    //     );
    //     const jsonPath = path.join(exportPath, 'Mids_JSON');
    //     if (!fs.existsSync(jsonPath)) {
    //       fs.mkdirSync(jsonPath, { recursive: true });
    //     }

    //     fs.writeFileSync(path.join(jsonPath, 'Database.json'), databaseJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'Archetypes.json'), archetypesJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'AttribMods.json'), attribModsJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'Enhancement.json'), enhancementsJson, 'utf8');
    //     fs.writeFileSync(
    //       path.join(jsonPath, 'EnhancementClasses.json'),
    //       enhancementClassesJson,
    //       'utf8'
    //     );
    //     fs.writeFileSync(path.join(jsonPath, 'Entities.json'), entitiesJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'Levels.json'), levelsJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'Powers.json'), powersJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'PowerSets.json'), powersetsJson, 'utf8');
    //     fs.writeFileSync(
    //       path.join(jsonPath, 'PowerSetGroups.json'),
    //       powersetGroupsJson,
    //       'utf8'
    //     );
    //     fs.writeFileSync(path.join(jsonPath, 'Recipes.json'), recipesJson, 'utf8');
    //     fs.writeFileSync(path.join(jsonPath, 'Salvage.json'), salvageJson, 'utf8');
    //   }

    //   if (msgOnCompletion) {
    //     console.log('Export completed.');
    //   }
    // } catch (ex: any) {
    //   console.error(`Error saving JSON database: ${ex.message}\n${ex.stack}`);
    // }
  }

  static SaveJsonDatabaseProgress(
    serializer: any,
    frmProgressHandle: any,
    parent: any,
    msgOnCompletion: boolean = false
  ): void {
    // Note: Progress form handling would need UI framework integration
    // For now, falling back to regular SaveJsonDatabase
    // In a UI framework, you would update progress messages like:
    // prg.Text = "|0|Creating Zip archive...";
    // prg.Text = "|8|Exporting Main database...";
    // etc.

    if (!frmProgressHandle) {
      this.SaveJsonDatabase(serializer, msgOnCompletion);
      return;
    }

    // If progress form is available, you could update it here
    // For now, just call the regular save method
    this.SaveJsonDatabase(serializer, msgOnCompletion);
  }

  // Modifier Table
  static NidFromUidAttribMod(uID: string): number {
    if (!uID) {
      return -1;
    }

    if (this.AttribMod.has(uID)) {
      return this.AttribMod.get(uID)!;
    }

    for (let index = 0; index < this.Database.AttribMods.Modifier.length; index++) {
      if (uID.toLowerCase() === this.Database.AttribMods.Modifier[index].ID.toLowerCase()) {
        this.AttribMod.set(uID, index);
        return index;
      }
    }

    return -1;
  }

  // Class/Archetype
  static NidFromUidClass(uidClass: string): number {
    if (!uidClass) {
      return -1;
    }

    if (this.Classes.has(uidClass)) {
      return this.Classes.get(uidClass)!;
    }

    const index = this.Database.Classes.findIndex(
      cls => cls && cls.ClassName.toLowerCase() === uidClass.toLowerCase()
    );

    if (index >= 0) {
      this.Classes.set(uidClass, index);
    }

    return index;
  }

  static UidFromNidClass(nIDClass: number): string {
    if (nIDClass < 0 || nIDClass >= this.Database.Classes.length) {
      return '';
    }
    return this.Database.Classes[nIDClass]?.ClassName ?? '';
  }

  static NidFromUidOrigin(uidOrigin: string, nIDClass: number): number {
    if (nIDClass < 0) {
      return -1;
    }
    const archetype = this.Database.Classes[nIDClass];
    if (!archetype) {
      return -1;
    }
    return archetype.Origin.findIndex(o => o.toLowerCase() === uidOrigin.toLowerCase());
  }

  // Powerset Groups
  static FillGroupArray(): void {
    var powersetGroups: Map<string, PowersetGroup> = new Map<string, PowersetGroup>();
    for (const powerset of this.Database.Powersets) {
      if (!powerset || !powerset.GroupName) {
        continue;
      }

      let powersetGroup = powersetGroups.get(powerset.GroupName.toLowerCase());
      if (!powersetGroup) {
        powersetGroup = new PowersetGroup(powerset.GroupName);
        powersetGroups.set(powerset.GroupName.toLowerCase(), powersetGroup);
      }

      powersetGroup.Powersets.set(powerset.FullName.toLowerCase(), powerset);
      powerset.SetGroup(powersetGroup);
    }
    this.Database.PowersetGroups = powersetGroups;
  }

  // Powersets
  static NidFromUidPowerset(uidPowerset: string): number {
    const powerset = this.GetPowersetByName(uidPowerset);
    return powerset?.nID ?? -1;
  }

  static NidFromStaticIndexPower(sidPower: number): number {
    if (sidPower < 0) {
      return -1;
    }
    return this.Database.Power.findIndex(p => p && p.StaticIndex === sidPower);
  }

  static NidFromUidPower(name: string): number {
    const power = this.GetPowerByFullName(name);
    return power?.PowerIndex ?? -1;
  }

  static PiDFromUidPower(name: string): number {
    const power = this.Database.Power.find(p => p && p.FullName === name);
    return power?.PowerIndex ?? -1;
  }

  static NidFromUidEntity(uidEntity: string): number {
    return this.Database.Entities.findIndex(
      se => se.UID.toLowerCase() === uidEntity.toLowerCase()
    );
  }

  static NidSets(uidGroup: string, uidClass: string, nType: ePowerSetType): number[] {
    const group = this.Database.PowersetGroups.get(uidGroup.toLowerCase()) ?? null;
    return this.NidSets2(group, this.NidFromUidClass(uidClass), nType);
  }

  private static NidSets2(
    group: PowersetGroup | null,
    nIDClass: number,
    nType: ePowerSetType
  ): number[] {
    if (
      (nType === ePowerSetType.Inherent || nType === ePowerSetType.Pool) &&
      nIDClass > -1 &&
      this.Database.Classes[nIDClass] &&
      !this.Database.Classes[nIDClass]!.Playable
    ) {
      return [];
    }

    let powersetArray: (IPowerset | null)[] = this.Database.Powersets;
    if (group !== null) {
      powersetArray = Array.from(group.Powersets.values());
    }

    const intList: number[] = [];
    const checkType = nType !== ePowerSetType.None;
    const checkClass = nIDClass > -1;

    for (const powerset of powersetArray) {
      if (!powerset) continue;

      let isOk = !checkType || powerset.SetType === nType;

      if (checkClass && isOk) {
        if (
          (powerset.SetType === ePowerSetType.Primary ||
            powerset.SetType === ePowerSetType.Secondary) &&
          powerset.nArchetype !== nIDClass &&
          powerset.nArchetype > -1
        ) {
          isOk = false;
        }

      if (
        powerset.Powers.length > 0 &&
        isOk &&
        powerset.SetType !== ePowerSetType.Inherent &&
        powerset.SetType !== ePowerSetType.Accolade &&
        powerset.SetType !== ePowerSetType.Temp &&
        powerset.Powers[0] &&
        !powerset.Powers[0].Requires.ClassOk(nIDClass as any)
      ) {
        isOk = false;
      }
      }

      if (isOk) {
        intList.push(powerset.nID);
      }
    }

    return intList;
  }

  static NidPowers(nIDPowerset: number, nIDClass: number = -1): number[] {
    // Returns indexes from the POWER array, Not the index within the powerset
    if (nIDPowerset < 0 || nIDPowerset > this.Database.Powersets.length - 1) {
      const array: number[] = [];
      for (let index = 0; index < this.Database.Power.length; index++) {
        array.push(index);
      }
      return array;
    }

    const powerset = this.Database.Powersets[nIDPowerset];
    if (!powerset) {
      return [];
    }

    const result: number[] = [];
    for (let idx = 0; idx < powerset.Powers.length; idx++) {
      const pow = powerset.Powers[idx];
      if (pow && pow.Requires.ClassOk(nIDClass as any)) {
        if (idx < powerset.Power.length) {
          result.push(powerset.Power[idx]);
        }
      }
    }

    return result;
  }

  static NidPowersFromUid(uidPowerset: string, uidClass: string = ''): number[] {
    return this.NidPowers(
      this.NidFromUidPowerset(uidPowerset),
      this.NidFromUidClass(uidClass)
    );
  }

  static UidPowers(uidPowerset: string, uidClass: string = ''): string[] {
    if (uidPowerset) {
      const result: string[] = [];
      for (const pow of this.Database.Power) {
        if (
          pow &&
          pow.FullSetName.toLowerCase() === uidPowerset.toLowerCase() &&
          pow.Requires.ClassOk(uidClass)
        ) {
          result.push(pow.FullName);
        }
      }
      return result;
    }

    const array: string[] = [];
    for (let index = 0; index < this.Database.Power.length; index++) {
      const pow = this.Database.Power[index];
      if (pow) {
        array.push(pow.FullName);
      }
    }
    return array;
  }

  private static NidPowersAtLevel(iLevel: number, nIDPowerset: number): number[] {
    // Accepts a zero-based level and a powerset PowerIndex, and returns an array of indexes
    // with the powerset's power array
    if (nIDPowerset < 0) {
      return [];
    }

    const powerset = this.Database.Powersets[nIDPowerset];
    if (!powerset) {
      return [];
    }

    const result: number[] = [];
    for (const pow of powerset.Powers) {
      if (pow && pow.Level - 1 === iLevel) {
        result.push(pow.PowerIndex);
      }
    }
    return result;
  }

  static NidPowersAtLevelBranch(iLevel: number, nIDPowerset: number): number[] {
    // ZERO-based level
    if (nIDPowerset < 0) {
      return [];
    }

    const powerset = this.Database.Powersets[nIDPowerset];
    if (!powerset) {
      return [];
    }

    if (powerset.nIDTrunkSet < 0) {
      // Regular set
      return this.NidPowersAtLevel(iLevel, nIDPowerset);
    }

    // Branching powerset
    const powerset1 = this.NidPowersAtLevel(iLevel, nIDPowerset);
    const powerset2 = this.NidPowersAtLevel(iLevel, powerset.nIDTrunkSet);
    return [...powerset2, ...powerset1];
  }

  static GetPowersetByName(iName: string): IPowerset | null;
  static GetPowersetByName(iName: string, iArchetype: string): IPowerset | null;
  static GetPowersetByName(
    iName: string,
    iArchetype: string,
    restrictGroups: boolean
  ): IPowerset | null;
  static GetPowersetByName(iName: string, iSet: ePowerSetType): IPowerset | null;
  static GetPowersetByName(
    iName: string,
    iArchetypeOrSet?: string | ePowerSetType,
    restrictGroups?: boolean
  ): IPowerset | null {
    // Overload 1: GetPowersetByName(iName: string)
    if (iArchetypeOrSet === undefined) {
      // Returns the index of the named set belonging to a named archetype (IE. Invulnerability, Tanker, or Invulnerability, Scrapper)
      const strArray = iName.split('.');
      if (strArray.length < 2) {
        return null;
      }
      if (strArray.length > 2) {
        iName = `${strArray[0]}.${strArray[1]}`;
      }

      const key = strArray[0];
      const powersetGroup = this.Database.PowersetGroups.get(key.toLowerCase());
      if (!powersetGroup) {
        return null;
      }
      return powersetGroup.Powersets.get(iName.toLowerCase()) ?? null;
    }

    // Overload 2 & 3: GetPowersetByName(iName: string, iArchetype: string, restrictGroups?: boolean)
    if (typeof iArchetypeOrSet === 'string') {
      const iArchetype = iArchetypeOrSet;
      const archetype = this.GetArchetypeByName(iArchetype);
      if (!archetype) {
        return null;
      }
      const idx = archetype.Idx;

      for (const powerset1 of this.Database.Powersets) {
        if (
          !powerset1 ||
          (idx !== powerset1.nArchetype && powerset1.nArchetype !== -1) ||
          powerset1.DisplayName.toLowerCase() !== iName.toLowerCase()
        ) {
          continue;
        }

        if (
          restrictGroups &&
          powerset1.SetType !== ePowerSetType.Primary &&
          powerset1.SetType !== ePowerSetType.Secondary &&
          powerset1.SetType !== ePowerSetType.Pool &&
          powerset1.SetType !== ePowerSetType.Ancillary
        ) {
          continue;
        }

        if (powerset1.SetType !== ePowerSetType.Ancillary) {
          return powerset1;
        }

        if (
          powerset1.Power.length > 0 &&
          powerset1.Powers[0] &&
          powerset1.Powers[0].Requires.ClassOk(idx as any)
        ) {
          return powerset1;
        }
      }

      return null;
    }

    // Overload 4: GetPowersetByName(iName: string, iSet: ePowerSetType)
    const iSet = iArchetypeOrSet as ePowerSetType;
    // Returns the index of the named set of a given type
    // (IE, you can request Invulnerability from Primary (type 0), which is a tank set
    // or you can request Secondary (Type 1) which is the scrapper version)
    return (
      this.Database.Powersets.find(
        powerset =>
          powerset &&
          powerset.SetType === iSet &&
          powerset.DisplayName.toLowerCase() === iName.toLowerCase()
      ) ?? null
    );
  }

  static GetPowersetByIndex(idx: number): IPowerset | null {
    try {
      if (idx >= 0 && idx < this.Database.Powersets.length) {
        return this.Database.Powersets[idx];
      }
      return null;
    } catch {
      return null;
    }
  }

  static GetPowersetByID(iName: string, iSet: ePowerSetType): IPowerset | null {
    // Returns a powerset by its SetName property, not the DisplayName property.
    // (IE, you can request Invulnerability from Primary (type 0), which is a tank set
    // or you can request Secondary (Type 1) which is the scrapper version)
    return (
      this.Database.Powersets.find(
        ps =>
          ps &&
          ps.SetType === iSet &&
          ps.SetName.toLowerCase() === iName.toLowerCase()
      ) ?? null
    );
  }

  static GetPowersetByFullname(name: string): IPowerset | null {
    return (
      this.Database.Powersets.find(
        x => x && x.FullName.toLowerCase() === name.toLowerCase()
      ) ?? null
    );
  }

  static GetInherentPowerset(): IPowerset | null {
    return (
      this.Database.Powersets.find(
        ps => ps && ps.SetType === ePowerSetType.Inherent
      ) ?? null
    );
  }

  static GetArchetypeByName(iArchetype: string): import('./Base/Data_Classes/Archetype').Archetype | null {
    return (
      this.Database.Classes.find(
        cls =>
          cls &&
          cls.DisplayName.toLowerCase() === iArchetype.toLowerCase()
      ) ?? null
    );
  }

  static GetArchetypeByClassName(iArchetype: string): import('./Base/Data_Classes/Archetype').Archetype | null {
    return (
      this.Database.Classes.find(
        cls =>
          cls &&
          cls.ClassName.toLowerCase() === iArchetype.toLowerCase()
      ) ?? null
    );
  }

  static GetOriginByName(
    archetype: import('./Base/Data_Classes/Archetype').Archetype | null,
    iOrigin: string
  ): number {
    if (!archetype) {
      return 0;
    }
    for (let index = 0; index < archetype.Origin.length; index++) {
      if (archetype.Origin[index].toLowerCase() === iOrigin.toLowerCase()) {
        return index;
      }
    }
    return 0;
  }

  static GetPowerIndexByDisplayName(iName: string, iArchetype: number): number {
    const pw = this.Database.Power.find(
      p =>
        p &&
        p.DisplayName === iName &&
        (p.GetPowerSet()?.nArchetype === iArchetype ||
          p.GetPowerSet()?.nArchetype === -1)
    );
    if (!pw) {
      return -1;
    }
    return this.Database.Power.indexOf(pw);
  }

  static GetPowerByDisplayName(
    iName: string,
    iArchetype: number,
    listPowersets: string[]
  ): IPower | null {
    const found = this.Database.Power.find(
      p =>
        p &&
        p.DisplayName === iName &&
        (p.FullName.startsWith('Inherent') ||
          p.FullName.startsWith('Temporary_Powers') ||
          p.FullName.startsWith('Incarnate') ||
          (listPowersets.includes(p.GetPowerSet()?.FullName ?? '') &&
            (p.GetPowerSet()?.nArchetype === iArchetype ||
              p.GetPowerSet()?.nArchetype === -1))) &&
        !p.FullName.startsWith('Incarnate.Ion_Judgement') &&
        !p.FullName.startsWith('Incarnate.Lore_Pet_')
    );
    return (found as unknown as IPower) ?? null;
  }

  static GetPowerByFullName(name: string): IPower | null {
    if (!name) {
      return null;
    }
    const powersetByName = this.GetPowersetByName(name);

    if (!powersetByName) {
      return null;
    }

    const found = powersetByName.Powers.find(
      power2 =>
        power2 &&
        power2.FullName.toLowerCase() === name.toLowerCase()
    );
    return (found as IPower) ?? null;
  }

  static GetPowersetNames(iAT: number, iSet: ePowerSetType): string[] {
    const stringList: string[] = [];
    if (iSet !== ePowerSetType.Pool && iSet !== ePowerSetType.Inherent) {
      let numArray: number[] = [];
      const archetype = this.Database.Classes[iAT];
      if (archetype) {
        switch (iSet) {
          case ePowerSetType.Primary:
            numArray = archetype.Primary;
            break;
          case ePowerSetType.Secondary:
            numArray = archetype.Secondary;
            break;
          case ePowerSetType.Ancillary:
            numArray = archetype.Ancillary;
            break;
          default:
            numArray = [];
        }
      }

      for (const index of numArray) {
        const powerset = this.Database.Powersets[index];
        if (powerset) {
          stringList.push(powerset.DisplayName);
        }
      }
    } else {
      for (const powerset of this.Database.Powersets) {
        if (powerset && powerset.SetType === iSet) {
          stringList.push(powerset.DisplayName);
        }
      }
    }

    stringList.sort();
    return stringList;
  }

  static UidMutexAll(): string[] {
    const items = new Set<string>();
    for (const pow of this.Database.Power) {
      if (pow) {
        for (const membership of pow.GroupMembership) {
          items.add(membership);
        }
      }
    }
    return Array.from(items).sort();
  }

  static FindEnhancement(
    setName: string,
    enhName: string,
    iType: number,
    fallBack: number
  ): number {
    for (let index = 0; index < this.Database.Enhancements.length; index++) {
      const enh = this.Database.Enhancements[index];
      if (enh.TypeID !== iType || enh.ShortName.toLowerCase() !== enhName.toLowerCase()) {
        continue;
      }

      let num: number;
      if (enh.TypeID !== 0) {
        // Not SetO (eType.SetO = 0)
        num = index;
      } else {
        // SetO type - check set name
        const setIndex = enh.nIDSet;
        if (
          setIndex >= 0 &&
          setIndex < this.Database.EnhancementSets.length &&
          this.Database.EnhancementSets[setIndex].DisplayName.toLowerCase() ===
            setName.toLowerCase()
        ) {
          num = index;
        } else {
          continue;
        }
      }
      return num;
    }

    if (fallBack > -1 && fallBack < this.Database.Enhancements.length) {
      return fallBack;
    }
    return -1;
  }

  static GetEnhancementByBoostName(iName: string): number {
    // Extract enhancement UID from boost name (everything after the last dot)
    const enhUid = iName.replace(/.*\./, '');

    return this.Database.Enhancements.findIndex(enh =>
      enh.UID.includes(enhUid)
    );
  }

  static GetEnhancementSetByBoostName(name: string): EnhancementSet | null {
    const enhancement = this.Database.Enhancements.find(e =>
      e.UID.includes(name)
    );
    if (!enhancement) {
      return null;
    }
    // Note: enhancement.GetEnhancementSet() would need to be implemented
    // This is a placeholder
    if (enhancement.nIDSet >= 0 && enhancement.nIDSet < this.Database.EnhancementSets.length) {
      return this.Database.EnhancementSets[enhancement.nIDSet];
    }
    return null;
  }

  private static GetPurpleSetsEnhUIDList(): string[] {
    if (this.PurpleSetsEnhUIDList.length !== 0) {
      return this.PurpleSetsEnhUIDList;
    }

    const enh = this.Database.Enhancements.filter(
      item =>
        item.nIDSet > -1 &&
        item.RecipeIDX > 1 &&
        item.RecipeIDX < this.Database.Recipes.length &&
        this.Database.Recipes[item.RecipeIDX].Rarity === RecipeRarity.UltraRare &&
        item.nIDSet < this.Database.EnhancementSets.length
    ).filter(item => {
      const setType = this.GetSetTypeByIndex(
        this.Database.EnhancementSets[item.nIDSet].SetType
      );
      return setType && !setType.Name.includes('Archetype');
    });

    this.PurpleSetsEnhUIDList = enh.map(e => e.UID);
    return this.PurpleSetsEnhUIDList;
  }

  private static GetArchetypeEnhancements(): string[] {
    if (this._archetypeEnhancements.length > 0) {
      return this._archetypeEnhancements;
    }

    this._archetypeEnhancements = this.Database.Enhancements
      .filter(
        e =>
          e.nIDSet > -1 &&
          e.nIDSet < this.Database.EnhancementSets.length
      )
      .filter(e => {
        const setType = this.GetSetTypeByIndex(
          this.Database.EnhancementSets[e.nIDSet].SetType
        );
        return setType && setType.Name.includes('Archetype');
      })
      .map(e => e.UID);

    return this._archetypeEnhancements;
  }

  private static GetWinterEventEnhUIDList(): string[] {
    if (this.WinterEventEnhancements.length !== 0) {
      return this.WinterEventEnhancements;
    }

    const enhSets = this.Database.EnhancementSets.filter(
      e =>
        e.Uid.toLowerCase().includes('avalanche') ||
        e.Uid.toLowerCase().includes('blistering_cold') ||
        e.Uid.toLowerCase().includes('entomb') ||
        e.Uid.toLowerCase().includes('frozen_blast') ||
        e.Uid.toLowerCase().includes('winters_bite')
    );

    const result: string[] = [];
    for (const set of enhSets) {
      for (const enhIdx of set.Enhancements) {
        if (enhIdx >= 0 && enhIdx < this.Database.Enhancements.length) {
          result.push(this.Database.Enhancements[enhIdx].UID);
        }
      }
    }

    this.WinterEventEnhancements = result;
    return this.WinterEventEnhancements;
  }

  private static GetMovieEnhUIDList(): string[] {
    if (this.MovieEnhUIDList.length !== 0) {
      return this.MovieEnhUIDList;
    }

    const enhSets = this.Database.EnhancementSets.filter(e =>
      e.Uid.toLowerCase().includes('overwhelming_force')
    );

    const result: string[] = [];
    for (const set of enhSets) {
      for (const enhIdx of set.Enhancements) {
        if (enhIdx >= 0 && enhIdx < this.Database.Enhancements.length) {
          result.push(this.Database.Enhancements[enhIdx].UID);
        }
      }
    }

    this.MovieEnhUIDList = result;
    return this.MovieEnhUIDList;
  }

  static GetEnhancementBaseUIDName(iName: string): string {
    const purpleSetsEnh = this.GetPurpleSetsEnhUIDList();
    const atoSetsEnh = this.GetArchetypeEnhancements();
    const winterEventEnh = this.GetWinterEventEnhUIDList();
    const movieEnh = this.GetMovieEnhUIDList();

    // Purple IOs / Superior ATOs
    const replacedName = iName.replace('Superior_Attuned_', '');
    if (purpleSetsEnh.some(e => e.includes(replacedName))) {
      return winterEventEnh.some(e => e.includes(iName)) ||
        movieEnh.some(e => e.includes(iName))
        ? iName
        : iName.replace('Superior_Attuned_', 'Crafted_');
    }

    if (
      atoSetsEnh.some(e => e.includes(iName)) ||
      winterEventEnh.some(e => e.includes(iName)) ||
      movieEnh.some(e => e.includes(iName))
    ) {
      return iName;
    }

    // IOs + SpecialOs
    return iName
      .replace(/Synthetic_/g, '')
      .replace(/Attuned_/g, 'Crafted_')
      .replace(/Science_/g, 'Magic_')
      .replace(/Mutation_/g, 'Magic_')
      .replace(/Natural__/g, 'Magic_');
  }

  static EnhHasCatalyst(uid: string): boolean {
    if (!uid) {
      return false;
    }

    const baseUidIndex = this.GetEnhancementByUIDName(
      this.GetEnhancementBaseUIDName(uid)
    );
    if (baseUidIndex < 0) {
      return false;
    }

    if (this.Database.Enhancements[baseUidIndex].TypeID === 2) {
      // InventO
      return false;
    }

    const setName = uid.replace(/(Attuned_|Superior_|Crafted_)/g, '');
    if (setName.length < 2) {
      return false;
    }

    const setNameWithoutSuffix = setName.substring(0, setName.length - 2);
    let count = 0;
    for (const set of this.Database.EnhancementSets) {
      if (set.Uid.includes(setNameWithoutSuffix)) {
        count++;
      }
    }

    return count > 1;
  }

  static GetSetTypeByIndex(index: number): TypeGrade | null {
    return this.Database.SetTypes.find(x => x.Index === index) ?? null;
  }

  static GetSpecialEnhByIndex(index: number): TypeGrade | null {
    return this.Database.SpecialEnhancements.find(x => x.Index === index) ?? null;
  }

  static async LoadAllData(path: string): Promise<void> {
    DatabaseAPI.Database.Name = path.split('/').pop() ?? '';
    ConfigData.Initialize(true);
    DatabaseAPI.Database.AttribMods = new Modifiers();

    
    if (!DatabaseAPI.Database.AttribMods.Load(path)) { 
        console.error("Unable to proceed, failed to load attribute modifiers! We suggest you re-download the application from https://github.com/LoadedCamel/MidsReborn/releases.");
        throw new Error("Unable to proceed, failed to load attribute modifiers! We suggest you re-download the application from https://github.com/LoadedCamel/MidsReborn/releases.");
    }
   
    await DatabaseAPI.LoadTypeGrades(path);
    if (!await DatabaseAPI.LoadLevelsDatabase(path))
    {
        console.error("Unable to proceed, failed to load leveling data! We suggest you re-download the application from https://github.com/LoadedCamel/MidsReborn/releases.");
        throw new Error("Unable to proceed, failed to load leveling data! We suggest you re-download the application from https://github.com/LoadedCamel/MidsReborn/releases.");
    }
   
    if (!await DatabaseAPI.LoadMainDatabase(path))
    {
        console.error("There was an error reading the database. Aborting!");
        throw new Error("There was an error reading the database. Aborting!");
    }
    
    if (!await DatabaseAPI.LoadMaths(path))
    {
        console.error("There was an error reading the database. Aborting!");
        throw new Error("There was an error reading the database. Aborting!");
    }
   
    if (!await DatabaseAPI.LoadEffectIdsDatabase(path))
    {
        console.error("There was an error reading the database. Aborting!");
        throw new Error("There was an error reading the database. Aborting!");
    }
   
    if (!await DatabaseAPI.LoadEnhancementClasses(path))
    {
        console.error("There was an error reading the database. Aborting!");
        throw new Error("There was an error reading the database. Aborting!");
    }
   
    await DatabaseAPI.LoadEnhancementDb(path);
    await DatabaseAPI.LoadOrigins(path);
   
    await DatabaseAPI.LoadSalvage(path);
    await DatabaseAPI.LoadRecipes(path);
   
    await DatabaseAPI.LoadReplacementTable(path);
   
    await DatabaseAPI.LoadCrypticReplacementTable(path);
   
    await DatabaseAPI.MatchAllIDs();
    await DatabaseAPI.AssignSetBonusIndexes();
    await DatabaseAPI.AssignRecipeIDs();
  }

  static async LoadServerData(iPath?: string): Promise<boolean> {
    return await ServerData.Load(iPath ?? '');
  }

  private static async ProformaServerData(iPath?: string): Promise<boolean> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileSd, iPath);

    let reader: BinaryReader | null = null;

    try {
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();
      reader = new BinaryReader(buffer);
    } catch {
      return false;
    }

    try {
      let headerFound = true;
      const header = reader.readString();
      if (header !== AppDataPaths.Headers.ServerData.Start) {
        headerFound = false;
      }

      if (!headerFound) {
        console.error('Expected MRB header, got something else!');
        return false;
      }

      const instance = ServerData.Instance;
      instance.ManifestUri = reader.readString();
      instance.MaxSlots = reader.readInt();
      instance.BaseFlySpeed = reader.readFloat();
      instance.BaseJumpHeight = reader.readFloat();
      instance.BaseJumpSpeed = reader.readFloat();
      instance.BasePerception = reader.readFloat();
      instance.BaseRunSpeed = reader.readFloat();
      instance.BaseToHit = reader.readFloat();
      instance.MaxFlySpeed = reader.readFloat();
      instance.MaxJumpSpeed = reader.readFloat();
      instance.MaxRunSpeed = reader.readFloat();
      instance.EnableInherentSlotting = reader.readBoolean();
      instance.HealthSlots = reader.readInt();
      instance.HealthSlot1Level = reader.readInt();
      instance.HealthSlot2Level = reader.readInt();
      instance.StaminaSlots = reader.readInt();
      instance.StaminaSlot1Level = reader.readInt();
      instance.StaminaSlot2Level = reader.readInt();

      return true;
    } catch (e: any) {
      console.error(`Error loading server data: ${e.message}\n${e.stack}`);
      return false;
    }
  }

  // Enhancement checking methods
  static EnhIsATO(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    const enhData = this.Database.Enhancements[enhIdx];
    if (enhData.nIDSet === -1) return false;

    const enhSetData = this.Database.EnhancementSets[enhData.nIDSet];
    const setType = this.GetSetTypeByIndex(enhSetData.SetType);

    return setType?.Name.includes('Archetype') ?? false;
  }

  static EnhIsWinterEventE(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    const enhData = this.Database.Enhancements[enhIdx];
    if (enhData.nIDSet === -1) return false;

    const enhSetData = this.Database.EnhancementSets[enhData.nIDSet];
    const displayName = enhSetData.DisplayName.toLowerCase();

    return (
      displayName.includes('avalanche') ||
      displayName.includes('blistering cold') ||
      displayName.includes('entomb') ||
      displayName.includes('frozen blast') ||
      displayName.includes("winter's bite")
    );
  }

  static EnhIsMovieE(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    const enhData = this.Database.Enhancements[enhIdx];
    if (enhData.nIDSet === -1) return false;

    const enhSetData = this.Database.EnhancementSets[enhData.nIDSet];
    const displayName = enhSetData.DisplayName.toLowerCase();

    return (
      displayName.includes('overwhelming force') ||
      displayName.includes("cupid's crush")
    );
  }

  static EnhIsIO(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    const enhData = this.Database.Enhancements[enhIdx];

    return (
      (enhData.TypeID === 2 || enhData.TypeID === 0) && // InventO or SetO
      !this.EnhIsNaturallyAttuned(enhIdx)
    );
  }

  static EnhIsSuperior(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    const enhData = this.Database.Enhancements[enhIdx];
    if (enhData.RecipeIDX === -1) return false;

    const enhRecipe = this.Database.Recipes[enhData.RecipeIDX];
    return enhRecipe.Rarity === RecipeRarity.UltraRare;
  }

  static EnhIsNaturallyAttuned(enhIdx: number): boolean {
    if (enhIdx === -1) return false;
    if (enhIdx >= this.Database.Enhancements.length) return false;

    return (
      this.EnhIsATO(enhIdx) ||
      this.EnhIsWinterEventE(enhIdx) ||
      this.EnhIsMovieE(enhIdx)
    );
  }

  // Powerset index methods
  private static GetPowersetIndexesByGroup(group: PowersetGroup): number[] {
    return Array.from(group.Powersets.values())
      .map(powerset => powerset?.nID ?? -1)
      .filter(id => id >= 0);
  }

  static GetPowersetIndexesByGroupName(name: string): number[] {
    if (name === '') {
      return [0]; // Return array with single 0 element like C# version
    }

    const group = this.Database.PowersetGroups.get(name.toLowerCase());
    if (!group) {
      return [0]; // Return array with single 0 element like C# version
    }
    return this.GetPowersetIndexesByGroup(group);
  }

  static GetPowersetIndexes(
    at: import('./Base/Data_Classes/Archetype').Archetype | null,
    iSet: ePowerSetType
  ): (IPowerset | null)[];
  static GetPowersetIndexes(iAt: number, iSet: ePowerSetType): (IPowerset | null)[];
  static GetPowersetIndexes(
    atOrIAt: import('./Base/Data_Classes/Archetype').Archetype | null | number,
    iSet: ePowerSetType
  ): (IPowerset | null)[] {
    const iAt = typeof atOrIAt === 'number' ? atOrIAt : atOrIAt?.Idx ?? -1;
    if (iAt < 0 && typeof atOrIAt !== 'number') {
      return [];
    }
    const powersetList: (IPowerset | null)[] = [];
    if (iSet !== ePowerSetType.Pool && iSet !== ePowerSetType.Inherent) {
      for (const ps of this.Database.Powersets) {
        if (ps && ps.nArchetype === iAt && ps.SetType === iSet) {
          powersetList.push(ps);
        } else if (
          iSet === ePowerSetType.Ancillary &&
          ps &&
          ps.SetType === iSet &&
          ps.Powers.length > 0 &&
          ps.Powers[0] &&
          ps.Powers[0].Requires.ClassOk(iAt as any)
        ) {
          powersetList.push(ps);
        }
      }
    } else {
      for (let index = 0; index < this.Database.Powersets.length; index++) {
        const ps = this.Database.Powersets[index];
        if (ps && ps.SetType === iSet) {
          powersetList.push(ps);
        }
      }
    }

    powersetList.sort((a, b) => {
      if (!a || !b) return 0;
      return a.DisplayName.localeCompare(b.DisplayName);
    });
    return powersetList;
  }

  static ToDisplayIndex(
    iPowerset: IPowerset | null,
    iIndexes: (IPowerset | null)[]
  ): number {
    for (let index = 0; index < iIndexes.length; index++) {
      if (iIndexes[index]?.nID === (iPowerset?.nID ?? -1)) {
        return index;
      }
    }

    return iIndexes.length > 0 ? 0 : -1;
  }

  static GetEnhancementSetFromEnhUid(uid: string): EnhancementSet | null {
    return (
      this.Database.EnhancementSets.find(x => x.Uid.toLowerCase() === uid.toLowerCase()) ??
      null
    );
  }

  static GetEpicPowersets(atClass: string): IPowerset[] {
    if (
      !atClass ||
      atClass === 'Class_Peacebringer' ||
      atClass === 'Class_Warshade'
    ) {
      return [];
    }

    const archetype = this.GetArchetypeByClassName(atClass);
    if (!archetype) {
      return [];
    }

    const result: IPowerset[] = [];
    for (const t of archetype.Ancillary) {
      const ps = this.Database.Powersets.find(
        p =>
          p &&
          p.SetType === ePowerSetType.Ancillary &&
          p.nID === t
      );
      if (ps) {
        result.push(ps);
      }
    }
    return result;
  }

  static GetEnhancementByName(iName: string): number;
  static GetEnhancementByName(iName: string, iType: number): number;
  static GetEnhancementByName(iName: string, iSet: string): number;
  static GetEnhancementByName(
    iName: string,
    iTypeOrSet?: number | string
  ): number {
    // Overload 1: GetEnhancementByName(iName: string)
    if (iTypeOrSet === undefined) {
      // Takes the ShortName (example: ResDam) and returns the index in the enhancement array
      return this.Database.Enhancements.findIndex(
        enh =>
          enh.ShortName.toLowerCase() === iName.toLowerCase() ||
          enh.Name.toLowerCase() === iName.toLowerCase() ||
          enh.LongName.toLowerCase() === iName.toLowerCase()
      );
    }

    // Overload 2: GetEnhancementByName(iName: string, iType: number)
    if (typeof iTypeOrSet === 'number') {
      const iType = iTypeOrSet;
      return this.Database.Enhancements.findIndex(
        enh =>
          enh.TypeID === iType &&
          (enh.ShortName.toLowerCase() === iName.toLowerCase() ||
            enh.Name.toLowerCase() === iName.toLowerCase())
      );
    }

    // Overload 3: GetEnhancementByName(iName: string, iSet: string)
    const iSet = iTypeOrSet;
    // Takes the ShortName (example: ResDam) and returns the index in the enhancement array
    for (const enhancementSet of this.Database.EnhancementSets) {
      if (enhancementSet.ShortName.toLowerCase() !== iSet.toLowerCase()) {
        continue;
      }
      for (let enhancement = 0; enhancement < enhancementSet.Enhancements.length; enhancement++) {
        const enhIdx = enhancementSet.Enhancements[enhancement];
        const enh = this.Database.Enhancements[enhIdx];
        if (enh.ShortName.toLowerCase() === iName.toLowerCase()) {
          return enhIdx;
        }
      }
    }
    return -1;
  }

  static GetEnhancementUid(name: string | null): string {
    if (!name) {
      return '';
    }
    const enhResult = this.Database.Enhancements.find(e => e.LongName === name);
    return enhResult ? enhResult.UID : '';
  }

  private static EnhancementUidTranslation(uidName: string): string {
    for (const [key, value] of this.EnhTranslationTable) {
      if (uidName.includes(key)) {
        return uidName.replace(key, value);
      }
    }
    return uidName;
  }

  static GetEnhancementByUIDName(name: string): number {
    if (!name || !name.trim()) {
      return -1;
    }

    name = this.EnhancementUidTranslation(name);

    let e = this.Database.Enhancements.findIndex(enh =>
      enh.UID.toLowerCase().includes(name.toLowerCase())
    );
    if (e >= 0) {
      return e;
    }

    // CaltoArm-+Def(Pets) through build recovery
    name = name.replace('[', '(').replace(']', ')');
    e = this.Database.Enhancements.findIndex(enh =>
      enh.UID.toLowerCase().includes(name.toLowerCase())
    );

    return e >= 0 ? e : this.GetEnhancementByShortName(name);
  }

  // Note: GetEnhancementByShortName is complex and would need regex support
  // This is a simplified placeholder - full implementation would require more complex logic
  static GetEnhancementByShortName(iName: string): number {
    if (!iName || !iName.trim()) {
      return -1;
    }

    // Simplified version - full implementation would need regex matching
    // Remove level suffix like (A50)
    iName = iName.replace(/\([A0-9]+\)$/, '');
    const typeId = iName.endsWith('-I') ? 2 : 1; // InventO : Normal
    // Remove -I suffix for inventions
    iName = iName.replace(/-I$/, '');

    if (!iName.includes('-')) {
      return this.Database.Enhancements.findIndex(
        enh =>
          (typeId === 1
            ? enh.ShortName.toLowerCase().includes(iName.toLowerCase())
            : enh.ShortName.toLowerCase().includes(iName.toLowerCase()) &&
              enh.TypeID === typeId)
      );
    }

    // For names with dashes, would need more complex set matching logic
    // This is a placeholder
    return -1;
  }

  // Additional utility methods
  static NidFromStaticIndexEnh(sidEnh: number): number {
    if (sidEnh < 0) {
      return -1;
    }

    for (let index = 0; index < this.Database.Enhancements.length; index++) {
      if (this.Database.Enhancements[index].StaticIndex === sidEnh) {
        return index;
      }
    }
    return -1;
  }

  static NidFromUidioSet(uidSet: string): number {
    for (let index = 0; index < this.Database.EnhancementSets.length; index++) {
      if (
        this.Database.EnhancementSets[index].Uid.toLowerCase() ===
        uidSet.toLowerCase()
      ) {
        return index;
      }
    }
    return -1;
  }

  static NidFromUidEnh(uidEnh: string): number {
    for (let index = 0; index < this.Database.Enhancements.length; index++) {
      if (
        this.Database.Enhancements[index].UID.toLowerCase() ===
        uidEnh.toLowerCase()
      ) {
        return index;
      }
    }
    return -1;
  }

  static get DatabaseName(): string {
    return this.Database.Name;
  }

  static RealmUsesToxicDef(): boolean {
    return this.DatabaseName === 'Homecoming';
  }

  static get RealmUsesToxicDefense(): boolean {
    return this.DatabaseName === 'Homecoming';
  }

  private static CheckEhcBoosts(): void {
    for (const power of this.Database.Power) {
      if (!power) continue;
      const powerset = power.GetPowerSet();
      if (!powerset) continue;
      if (
        powerset.SetType === 0 || // Primary
        powerset.SetType === 1 || // Secondary
        powerset.SetType === 3 || // Pool
        powerset.SetType === 4 // Ancillary
      ) {
        const boosts: string[] = [];
        if (power.BoostsAllowed.length <= 0 && power.Enhancements.length > 0) {
          for (const enh of power.Enhancements) {
            // Note: Would need Enum.GetName equivalent for eBoosts
            // For now, using the numeric value as string
            boosts.push(enh.toString());
          }
          power.BoostsAllowed = boosts;
        }
      }
    }
  }

  private static async GetDatabaseVersion(fp: string): Promise<string> {
    // Note: Version class would need to be implemented
    // For now, returning a placeholder version string

    try {
      // Note: Would need BinaryReader implementation
      // This is a simplified placeholder
      const response = await fetch(fp);
      if (!response.ok) {
        throw new Error(`Failed to read database version: ${fp}`);
      }
      const buffer = await response.arrayBuffer();
      // Would read header and version string from binary file
      // For now, returning placeholder
      return '1.0.0.0';
    } catch (ex: any) {
      console.error(`Error reading database version: ${ex.message}`);
      return '0.0.0.0';
    }
  }

  static SaveServerData(iPath?: string): void {
    const path = AppDataPaths.SelectDataFileSave(AppDataPaths.ServerDataFile, iPath);
    ServerData.Save(path);
  }

  static UidReferencingPowerFix(uidPower: string, uidNew: string = ''): string[] {
    const array: string[] = [];
    for (const p of this.Database.Power) {
      if (!p) continue;

      if (p.Requires.ReferencesPower(uidPower, uidNew)) {
        array.push(p.FullName + ' (Requirement)');
      }

      for (const fx of p.Effects) {
        if (fx.Summon === uidPower) {
          fx.Summon = uidNew;
          array.push(p.FullName + ' (GrantPower)');
        }
      }
    }

    return array;
  }

  static GetOriginIDByName(iOrigin: string): number {
    for (let index = 0; index < this.Database.Origins.length; index++) {
      if (
        this.Database.Origins[index].Name.toLowerCase() ===
        iOrigin.toLowerCase()
      ) {
        return index;
      }
    }
    return 0;
  }

  static IsSpecialEnh(enhID: number): number {
    if (enhID < 0 || enhID >= this.Database.Enhancements.length) {
      return -1;
    }

    const enh = this.Database.Enhancements[enhID];
    if (enh.nIDSet < 0 || enh.nIDSet >= this.Database.EnhancementSets.length) {
      return -1;
    }

    const enhSet = this.Database.EnhancementSets[enh.nIDSet];
    for (
      let index = 0;
      index < enhSet.Enhancements.length;
      index++
    ) {
      if (
        enhID === enhSet.Enhancements[index] &&
        enhSet.SpecialBonus[index] &&
        enhSet.SpecialBonus[index].Index &&
        enhSet.SpecialBonus[index].Index.length > 0
      ) {
        return index;
      }
    }
    return -1;
  }

  static GetEnhancementNameShortWSet(iEnh: number): string {
    if (iEnh < 0 || iEnh >= this.Database.Enhancements.length) {
      return '';
    }

    const enh = this.Database.Enhancements[iEnh];
    switch (enh.TypeID) {
      case 1: // Normal
      case 3: // SpecialO
        return enh.ShortName;
      case 2: // InventO
        return 'Invention: ' + enh.ShortName;
      case 0: // SetO
        if (
          enh.nIDSet >= 0 &&
          enh.nIDSet < this.Database.EnhancementSets.length
        ) {
          return (
            this.Database.EnhancementSets[enh.nIDSet].DisplayName +
            ': ' +
            enh.ShortName
          );
        }
        return enh.ShortName;
      default:
        return '';
    }
  }

  static GetFirstValidEnhancement(iClass: number): number {
    for (
      let index1 = 0;
      index1 < this.Database.Enhancements.length;
      index1++
    ) {
      const enh = this.Database.Enhancements[index1];
      for (
        let index2 = 0;
        index2 < enh.ClassID.length;
        index2++
      ) {
        const classId = enh.ClassID[index2];
        if (
          classId >= 0 &&
          classId < this.Database.EnhancementClasses.length &&
          this.Database.EnhancementClasses[classId].ID === iClass
        ) {
          return index1;
        }
      }
    }
    return -1;
  }

  // Modifier methods
  static GetModifier(iEffect: import('./IEffect').IEffect): number;
  static GetModifier(iClass: number, iTable: number, iLevel: number): number;
  static GetModifier(
    iEffectOrClass: import('./IEffect').IEffect | number,
    iTable?: number,
    iLevel?: number
  ): number {
    // Overload 1: GetModifier(iEffect: IEffect)
    if (typeof iEffectOrClass !== 'number') {
      const iEffect = iEffectOrClass;
      // Currently expects a zero-based level.
      // This value is returned as a modifier if a value is out of bounds
      let iClass = 0;
      const iLevel = 49; // MidsContext.MathLevelBase;
      const effPower = iEffect.GetPower();
      if (!effPower) {
        return iEffect.Enhancement == null
          ? 1
          : DatabaseAPI.GetModifier(iClass, iEffect.nModifierTable, iLevel);
      }

      iClass = effPower.ForcedClass
        ? this.NidFromUidClass(effPower.ForcedClass)
        : iEffect.Absorbed_Class_nID <= -1
          ? 0 // MidsContext.Archetype.Idx
          : iEffect.Absorbed_Class_nID;

      // Everything seems to be valid, return the modifier
      return DatabaseAPI.GetModifier(iClass, iEffect.nModifierTable, iLevel);
    }

    // Overload 2: GetModifier(iClass: number, iTable: number, iLevel: number)
    const iClass = iEffectOrClass;
    const table = iTable!;
    const level = iLevel!;
    // Warning: calling this method with table == 0 can lead to super weird return values.
    if (iClass < 0) return 0;
    if (table < 0) return 0;
    if (level < 0) return 0;
    if (iClass > this.Database.Classes.length - 1) return 0;

    const archetype = this.Database.Classes[iClass];
    if (!archetype) return 0;
    const iClassColumn = archetype.Column;
    if (iClassColumn < 0) return 0;
    if (table > this.Database.AttribMods.Modifier.length - 1) return 0;
    if (level > this.Database.AttribMods.Modifier[table].Table.length - 1) return 0;
    if (iClassColumn > this.Database.AttribMods.Modifier[table].Table[level].length - 1)
      return 0;

    return this.Database.AttribMods.Modifier[table].Table[level][iClassColumn];
  }

  // ID Matching methods
  static MatchAllIDs(messenger?: any): void {
    // Note: IMessenger interface would need to be implemented
    this.UpdateMessage(messenger, 'Matching Group IDs...');
    this.FillGroupArray();
    this.UpdateMessage(messenger, 'Matching Class IDs...');
    this.MatchArchetypeIDs();
    this.UpdateMessage(messenger, 'Matching Powerset IDs...');
    this.MatchPowersetIDs();
    this.UpdateMessage(messenger, 'Matching Power IDs...');
    this.MatchPowerIDs();
    this.UpdateMessage(messenger, 'Propagating Group IDs...');
    this.SetPowersetsFromGroups();
    this.UpdateMessage(messenger, 'Matching Enhancement IDs...');
    this.MatchEnhancementIDs();
    this.UpdateMessage(messenger, 'Matching Modifier IDs...');
    this.MatchModifierIDs();
    this.UpdateMessage(messenger, 'Matching Entity IDs...');
    this.MatchSummonIDs();
  }

  private static UpdateMessage(messenger: any, iMessage: string): void {
    if (messenger && typeof messenger.SetMessage === 'function') {
      messenger.SetMessage(iMessage);
    }
  }

  static MatchArchetypeIDs(): void {
    for (let index = 0; index < this.Database.Classes.length; index++) {
      const archetype = this.Database.Classes[index];
      if (!archetype) continue;
      archetype.Idx = index;
      archetype.Origin.sort();
      archetype.Primary = [];
      archetype.Secondary = [];
      archetype.Ancillary = [];
    }
  }

  static MatchPowersetIDs(): void {
    for (let index1 = 0; index1 < this.Database.Powersets.length; index1++) {
      const powerset = this.Database.Powersets[index1];
      if (!powerset) continue;
      powerset.nID = index1;
      powerset.nArchetype = this.NidFromUidClass(powerset.ATClass);
      powerset.nIDTrunkSet = powerset.UIDTrunkSet
        ? this.NidFromUidPowerset(powerset.UIDTrunkSet)
        : -1;
      powerset.nIDLinkSecondary = powerset.UIDLinkSecondary
        ? this.NidFromUidPowerset(powerset.UIDLinkSecondary)
        : -1;
      if (powerset.UIDMutexSets.length > 0) {
        powerset.nIDMutexSets = [];
        for (let index2 = 0; index2 < powerset.UIDMutexSets.length; index2++) {
          powerset.nIDMutexSets.push(
            this.NidFromUidPowerset(powerset.UIDMutexSets[index2])
          );
        }
      }

      powerset.Power = [];
      powerset.Powers = [];
    }
  }

  static MatchPowerIDs(): void {
    this.Database.MutexList = this.UidMutexAll();
    for (let index = 0; index < this.Database.Power.length; index++) {
      const power1 = this.Database.Power[index];
      if (!power1) continue;

      if (!power1.FullName) {
        power1.FullName = `Orphan.${power1.DisplayName.replace(/ /g, '_')}`;
      }

      power1.PowerIndex = index;
      power1.PowerSetID = this.NidFromUidPowerset(power1.FullSetName);
      if (power1.PowerSetID <= -1) {
        continue;
      }

      const ps = power1.GetPowerSet();
      if (!ps) {
        continue;
      }

      const length = ps.Powers ? ps.Powers.length : 0;
      power1.PowerSetIndex = length;
      // Ensure arrays are initialized
      if (!ps.Power) {
        ps.Power = [];
      }
      if (!ps.Powers) {
        ps.Powers = [];
      }
      ps.Power.push(index);
      ps.Powers.push(power1);
    }

    for (const power of this.Database.Power) {
      if (!power) continue;

      let flag = false;
      if (power.GetPowerSet()?.SetType === ePowerSetType.SetBonus) {
        flag = power.PowerName.includes('Slow');
        if (flag) {
          power.BuffMode = 1; // Enums.eBuffMode.Debuff
          for (const effect of power.Effects) {
            effect.buffMode = 1; // Enums.eBuffMode.Debuff
          }
        }
      }

      for (const effect of power.Effects) {
        if (flag) {
          effect.buffMode = 1; // Enums.eBuffMode.Debuff
        }

        switch (effect.EffectType) {
          case 20: // Enums.eEffectType.GrantPower
            effect.nSummon = this.NidFromUidPower(effect.Summon);
            power.HasGrantPowerEffect = true;
            break;
          case 21: // Enums.eEffectType.EntCreate
            effect.nSummon = this.NidFromUidEntity(effect.Summon);
            break;
          case 22: // Enums.eEffectType.PowerRedirect
            effect.nSummon = this.NidFromUidPower(effect.Override);
            power.HasPowerOverrideEffect = true;
            break;
        }
      }

      power.NGroupMembership = new Array(power.GroupMembership.length);
      for (let index1 = 0; index1 < power.GroupMembership.length; index1++) {
        for (let index2 = 0; index2 < this.Database.MutexList.length; index2++) {
          if (
            this.Database.MutexList[index2].toLowerCase() !==
            power.GroupMembership[index1].toLowerCase()
          ) {
            continue;
          }

          power.NGroupMembership[index1] = index2;
          break;
        }
      }

      power.NIDSubPower = new Array(power.UIDSubPower.length);
      for (let index = 0; index < power.UIDSubPower.length; index++) {
        power.NIDSubPower[index] = this.NidFromUidPower(power.UIDSubPower[index]);
      }

      this.MatchRequirementId(power as unknown as IPower);
    }
  }

  private static MatchRequirementId(power: IPower): void {
    if (power.Requires.ClassName.length > 0) {
      power.Requires.NClassName = [];
      for (let index = 0; index < power.Requires.ClassName.length; index++) {
        power.Requires.NClassName.push(
          this.NidFromUidClass(power.Requires.ClassName[index])
        );
      }
    }

    if (power.Requires.ClassNameNot.length > 0) {
      power.Requires.NClassNameNot = [];
      for (let index = 0; index < power.Requires.ClassNameNot.length; index++) {
        power.Requires.NClassNameNot.push(
          this.NidFromUidClass(power.Requires.ClassNameNot[index])
        );
      }
    }

    if (power.Requires.PowerID.length > 0) {
      power.Requires.NPowerID = [];
      for (let index1 = 0; index1 < power.Requires.PowerID.length; index1++) {
        const nPowerIdRow: number[] = [];
        for (
          let index2 = 0;
          index2 < power.Requires.PowerID[index1].length;
          index2++
        ) {
          nPowerIdRow.push(
            power.Requires.PowerID[index1][index2]
              ? this.NidFromUidPower(power.Requires.PowerID[index1][index2])
              : -1
          );
        }
        power.Requires.NPowerID.push(nPowerIdRow);
      }
    }

    if (power.Requires.PowerIDNot.length <= 0) {
      return;
    }

    power.Requires.NPowerIDNot = [];
    for (let index1 = 0; index1 < power.Requires.PowerIDNot.length; index1++) {
      const nPowerIdNotRow: number[] = [];
      for (
        let index2 = 0;
        index2 < power.Requires.PowerIDNot[index1].length;
        index2++
      ) {
        nPowerIdNotRow.push(
          power.Requires.PowerIDNot[index1][index2]
            ? this.NidFromUidPower(power.Requires.PowerIDNot[index1][index2])
            : -1
        );
      }
      power.Requires.NPowerIDNot.push(nPowerIdNotRow);
    }
  }

  static SetPowersetsFromGroups(): void {
    for (let index1 = 0; index1 < this.Database.Classes.length; index1++) {
      const archetype = this.Database.Classes[index1];
      if (!archetype) continue;
      const intList1: number[] = [];
      const intList2: number[] = [];
      const intList3: number[] = [];
      for (let index2 = 0; index2 < this.Database.Powersets.length; index2++) {
        const powerset = this.Database.Powersets[index2];
        if (!powerset) continue;

        if (powerset.Powers.length > 0 && powerset.Powers[0]) {
          powerset.Powers[0].SortOverride = true;
        }

        if (
          powerset.GroupName?.toLowerCase() ===
          archetype.PrimaryGroup?.toLowerCase()
        ) {
          intList1.push(index2);
          if (powerset.nArchetype < 0) {
            powerset.nArchetype = index1;
          }
        }

        if (
          powerset.GroupName?.toLowerCase() ===
          archetype.SecondaryGroup?.toLowerCase()
        ) {
          intList2.push(index2);
          if (powerset.nArchetype < 0) {
            powerset.nArchetype = index1;
          }
        }

        if (
          powerset.GroupName?.toLowerCase() === archetype.EpicGroup?.toLowerCase() &&
          (powerset.nArchetype === index1 ||
            (powerset.Powers.length > 0 &&
              powerset.Powers[0] &&
              powerset.Powers[0].Requires.ClassOk(archetype.ClassName)))
        ) {
          intList3.push(index2);
        }
      }

      archetype.Primary = intList1;
      archetype.Secondary = intList2;
      archetype.Ancillary = intList3;
    }
  }

  static MatchEnhancementIDs(): void {
    for (let index1 = 0; index1 < this.Database.Power.length; index1++) {
      const power = this.Database.Power[index1];
      if (!power) continue;
      const intList: number[] = [];
      for (
        let index2 = 0;
        index2 < power.BoostsAllowed.length;
        index2++
      ) {
        const index3 = this.EnhancementClassIdFromName(
          power.BoostsAllowed[index2]
        );
        if (index3 > -1) {
          intList.push(this.Database.EnhancementClasses[index3].ID);
        }
      }

      if (power.Enhancements == null || power.Enhancements.length === 0) {
        power.Enhancements = intList;
      }
    }

    for (let index = 0; index < this.Database.EnhancementSets.length; index++) {
      this.Database.EnhancementSets[index].Enhancements = [];
    }

    let flag = false;
    let str = '';
    for (
      let index1 = 0;
      index1 < this.Database.Enhancements.length;
      index1++
    ) {
      const enhancement = this.Database.Enhancements[index1];
      if (enhancement.TypeID !== eType.SetO || !enhancement.UIDSet) {
        // Not SetO or no UIDSet
        continue;
      }
      const index2 = this.NidFromUidioSet(enhancement.UIDSet);
      if (index2 > -1) {
        enhancement.nIDSet = index2;
        this.Database.EnhancementSets[index2].Enhancements.push(index1);
      } else {
        str = str + enhancement.UIDSet + enhancement.Name + '\n';
        flag = true;
      }
    }

    if (flag) {
      console.warn(
        'One or more enhancements had difficulty being matched to their invention set. You should check the database for misplaced Invention Set enhancements.\n' +
          str
      );
    }

    this.AssignSetBonusIndexes();
  }

  private static EnhancementClassIdFromName(iName: string): number {
    if (!iName) {
      return -1;
    }

    for (
      let index = 0;
      index < this.Database.EnhancementClasses.length;
      index++
    ) {
      if (
        this.Database.EnhancementClasses[index].ClassID?.toLowerCase() ===
        iName.toLowerCase()
      ) {
        return index;
      }
    }
    return -1;
  }

  static AssignSetBonusIndexes(): void {
    for (const enhancementSet of this.Database.EnhancementSets) {
      for (const bonu of enhancementSet.Bonus) {
        for (let index = 0; index < bonu.Index.length; index++) {
          bonu.Index[index] = this.NidFromUidPower(bonu.Name[index]);
        }
      }

      for (const specialBonu of enhancementSet.SpecialBonus) {
        for (let index = 0; index < specialBonu.Index.length; index++) {
          specialBonu.Index[index] = this.NidFromUidPower(specialBonu.Name[index]);
        }
      }
    }
  }

  static MatchModifierIDs(): void {
    for (const power of this.Database.Power) {
      if (!power) continue;
      for (const effect of power.Effects) {
        effect.nModifierTable = this.NidFromUidAttribMod(effect.ModifierTable);
      }
    }
  }

  static MatchSummonIDs(): void {
    SummonedEntity.MatchSummonIDs(
      this.NidFromUidClass.bind(this),
      this.NidFromUidPowerset.bind(this),
      this.NidFromUidPower.bind(this),
      this.Database.Entities
    );
  }

  static AssignStaticIndexValues(serializer: any, save: boolean): void {
    let lastStaticPowerIdx = -2;
    for (const p of this.Database.Power) {
      if (p && p.StaticIndex > -1 && p.StaticIndex > lastStaticPowerIdx) {
        lastStaticPowerIdx = p.StaticIndex;
      }
    }

    if (lastStaticPowerIdx < -1) {
      lastStaticPowerIdx = -1;
    }

    for (const p of this.Database.Power) {
      if (!p || p.StaticIndex >= 0) {
        continue;
      }

      lastStaticPowerIdx++;
      p.StaticIndex = lastStaticPowerIdx;
    }

    let lastStaticEnhIdx = -2;
    for (let index = 1; index < this.Database.Enhancements.length; index++) {
      const enh = this.Database.Enhancements[index];
      if (enh.StaticIndex > -1 && enh.StaticIndex > lastStaticEnhIdx) {
        lastStaticEnhIdx = enh.StaticIndex;
      }
    }

    if (lastStaticEnhIdx < -1) {
      lastStaticEnhIdx = -1;
    }

    for (let index = 1; index < this.Database.Enhancements.length; index++) {
      const enh = this.Database.Enhancements[index];
      if (enh.StaticIndex >= 1) {
        continue;
      }

      lastStaticEnhIdx++;
      enh.StaticIndex = lastStaticEnhIdx;
    }

    if (!save) {
      return;
    }

    // Note: MidsContext.Config.SavePath would need to be implemented
    // For now, saving without path override
    this.SaveMainDatabase(serializer);
    this.SaveEnhancementDb(serializer);
  }

  static async GetInstalledDatabases(): Promise<Map<string, string>> {
    const databases = new Map<string, string>();
    // Note: Would need AppDataPaths.BaseDataPath and Directory.GetDirectories equivalent
    // This is a placeholder - would need file system access
    try {
      const basePath = AppDataPaths.FDefaultPath || '';
      if (basePath) {
        const response = await fetch(basePath);
        if (!response.ok) {
          console.error('Failed to get installed databases!');
          return databases;
        }
        // const dirs = await response.json();
        // for (const dir of dirs) {
        //   if (dir.isDirectory()) {
        //     const dbPath = path.join(basePath, dir.name);
        //     const dbFile = path.join(dbPath, AppDataPaths.MxdbFileDb);
        //     const response = await fetch(dbFile);
        //     if (response.ok) {
        //       databases.set(dir.name, dbPath);
        //     }
        //   }
        // }
      }
    } catch (e) {
      console.error('Error getting installed databases:', e);
    }

    return databases;
  }

  // File I/O methods - Many require binary file handling
  // These are placeholders with basic structure - full implementation would need BinaryReader/BinaryWriter

  static async LoadMainDatabase(iPath?: string): Promise<boolean> {
    this.ClearLookups();
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileDb, iPath);

    let reader: BinaryReader | null = null;

    try {
      const response = await fetch(filePath);
      const buffer = await response.arrayBuffer();
      reader = new BinaryReader(buffer);
    } catch {
      return false;
    }

    try {
      let headerFound = true;
      const header = reader.readString();
      if (header !== AppDataPaths.Headers.Db.Start) {
        headerFound = false;
      }

      if (!headerFound) {
        console.error('Expected MRB header, got something else!');
        return false;
      }

      // Parse version string
      const versionString = reader.readString();
      this.Database.Version = parseVersion(versionString);

      // Read date - can be year/month/day or binary
      const year = reader.readInt();
      if (year > 0) {
        const month = reader.readInt();
        const day = reader.readInt();
        this.Database.Date = new Date(year, month - 1, day); // Month is 0-indexed in JS
      } else {
        const dateBinary = reader.readLong();
        this.Database.Date = new Date(dateBinary);
      }

      this.Database.Issue = reader.readInt();
      this.Database.PageVol = reader.readInt();
      this.Database.PageVolText = reader.readString();

      if (reader.readString() !== AppDataPaths.Headers.Db.Archetypes) {
        console.error('Expected Archetype Data, got something else!');
        return false;
      }

      const archetypeCount = reader.readInt();
      const classes: Archetype[] = new Array(archetypeCount + 1);
      for (let index = 0; index < classes.length; index++) {
        const archetype = Archetype.fromDataView(reader);
        archetype.Idx = index;
        classes[index] = archetype;
      }
      this.Database.Classes = classes;

      if (reader.readString() !== AppDataPaths.Headers.Db.Powersets) {
        console.error('Expected Powerset Data, got something else!');
        return false;
      }

      let num3 = 0;
      const powersetCount = reader.readInt();
      const powersets: IPowerset[] = new Array(powersetCount + 1);
      for (let index = 0; index < powersets.length; index++) {
        const powerset = new Powerset(reader);
        powerset.nID = index;
        powersets[index] = powerset as IPowerset;
        num3++;
        if (num3 <= 10) continue;
        num3 = 0;
      }
      this.Database.Powersets = powersets;

      if (reader.readString() !== AppDataPaths.Headers.Db.Powers) {
        console.error('Expected Power Data, got something else!');
        return false;
      }

      const powerCount = reader.readInt();
      const powers: IPower[] = new Array(powerCount + 1);
      for (let index = 0; index < powers.length; index++) {
        // Note: Power constructor from BinaryReader is already implemented
        const power = new Power(reader);
        // Type assertion needed due to interface differences
        powers[index] = power as any;
        num3++;
        if (num3 <= 50) continue;
        num3 = 0;
      }
      this.Database.Power = powers;

      if (reader.readString() !== AppDataPaths.Headers.Db.Summons) {
        console.error('Expected Summon Data, got something else!');
        return false;
      }

      this.Database.LoadEntities(reader);
      return true;
    } catch (e: any) {
      console.error(`Error loading main database: ${e.message}\n${e.stack}`);
      return false;
    }
  }

  static async SaveMainDatabase(serializer: any, iPath?: string): Promise<void> {
    this.CheckEhcBoosts();
    const filePath = AppDataPaths.SelectDataFileSave(AppDataPaths.MxdbFileDb, iPath);

    try {
      const buffer = Buffer.alloc(100 * 1024 * 1024); // 100MB buffer for main database
      const writer = new BinaryWriter(buffer);

      this.UpdateDbModified();
      writer.writeString(AppDataPaths.Headers.Db.Start);
      writer.writeString(JSON.stringify(this.Database.Version));
      writer.writeInt(-1); // Indicates binary date format
      writer.writeLong(this.Database.Date.getTime()); // DateTime.ToBinary equivalent
      writer.writeInt(this.Database.Issue);
      writer.writeInt(this.Database.PageVol);
      writer.writeString(this.Database.PageVolText);
      writer.writeString(AppDataPaths.Headers.Db.Archetypes);
      writer.writeInt(this.Database.Classes.length - 1);
      for (let index = 0; index <= this.Database.Classes.length - 1; index++) {
        const archetype = this.Database.Classes[index];
        if (archetype && typeof (archetype as any).StoreTo === 'function') {
          (archetype as any).StoreTo(writer);
        } else {
          console.warn(`Archetype.StoreTo not implemented for index ${index}`);
        }
      }

      writer.writeString(AppDataPaths.Headers.Db.Powersets);
      writer.writeInt(this.Database.Powersets.length - 1);
      for (let index = 0; index <= this.Database.Powersets.length - 1; index++) {
        const powerset = this.Database.Powersets[index];
        if (powerset && typeof (powerset as any).StoreTo === 'function') {
          (powerset as any).StoreTo(writer);
        }
      }

      writer.writeString(AppDataPaths.Headers.Db.Powers);
      writer.writeInt(this.Database.Power.length - 1);
      for (let index = 0; index <= this.Database.Power.length - 1; index++) {
        try {
          const power = this.Database.Power[index];
          if (power && typeof (power as any).StoreTo === 'function') {
            (power as any).StoreTo(writer);
          } else {
            console.warn(`Power.StoreTo not implemented for index ${index}`);
          }
        } catch (ex: any) {
          console.error(`Error saving power at index ${index}: ${ex.message}`);
        }
      }

      writer.writeString(AppDataPaths.Headers.Db.Summons);
      this.Database.StoreEntities(writer);

      const arrayBuffer = (writer as any).toArrayBuffer?.() || (writer as any).buffer;
      const finalBuffer = arrayBuffer ? Buffer.from(arrayBuffer) : Buffer.alloc(0);
      await fetch(filePath, {
        method: 'PUT',
        body: finalBuffer,
      });
    } catch (ex: any) {
      console.error(`Error saving main database: ${ex.message}\n${ex.stack}`);
    }
  }

  static async LoadEnhancementDb(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileEnhDb, iPath);

    this.Database.Enhancements = [];
    let reader: BinaryReader | null = null;

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load enhancement database file!');
        return;
      }
      const buffer = await response.arrayBuffer();
      reader = new BinaryReader(buffer);
    } catch (ex: any) {
      console.error(`${ex.message}\n\nNo Enhancements have been loaded.`);
      return;
    }

    try {
      let headerFound = true;
      const header = reader.readString();

      if (header !== AppDataPaths.Headers.EnhDb.Start) {
        headerFound = false;
      }

      if (!headerFound) {
        console.error('Expected enhancement database header, got something else!');
        return;
      }

      // Read version (float)
      reader.readFloat();
      let num1 = 0;
      const enhancementCount = reader.readInt();
      this.Database.Enhancements = new Array(enhancementCount + 1);
      for (let index = 0; index < this.Database.Enhancements.length; index++) {
        // Note: Enhancement constructor from BinaryReader needs to be implemented
        // For now, creating empty enhancement
        this.Database.Enhancements[index] = new Enhancement(reader);
        num1++;
        if (num1 <= 5) continue;
        num1 = 0;
      }

      // Load EnhancementSets
      this.Database.EnhancementSets = new EnhancementSetCollection();
      const num2 = reader.readInt() + 1;
      for (let index = 0; index < num2; index++) {
        this.Database.EnhancementSets.push(new EnhancementSet(reader));
        num1++;
        if (num1 <= 5) continue;
        num1 = 0;
      }
    } catch (ex: any) {
      console.error(
        `Enhancement Database file isn't how it should be (${ex.message})\n${ex.stack}\nNo Enhancements have been loaded.`
      );
      this.Database.Enhancements = [];
    }
  }

  static async SaveEnhancementDb(serializer: any, iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileSave(AppDataPaths.MxdbFileEnhDb, iPath);

    try {
      const buffer = Buffer.alloc(50 * 1024 * 1024); // 50MB buffer for enhancements
      const writer = new BinaryWriter(buffer);

      writer.writeString(AppDataPaths.Headers.EnhDb.Start);
      // Note: VersionEnhDb would need to be added to Database interface
      writer.writeFloat((this.Database as any).VersionEnhDb || 1.0);
      writer.writeInt(this.Database.Enhancements.length - 1);

      for (let index = 0; index <= this.Database.Enhancements.length - 1; index++) {
        const enhancement = this.Database.Enhancements[index];
        if (enhancement && typeof (enhancement as any).StoreTo === 'function') {
          (enhancement as any).StoreTo(writer);
        }
      }

      writer.writeInt(this.Database.EnhancementSets.length - 1);
      for (let index = 0; index <= this.Database.EnhancementSets.length - 1; index++) {
        const set = this.Database.EnhancementSets[index];
        if (set && typeof (set as any).StoreTo === 'function') {
          (set as any).StoreTo(writer);
        }
      }

      const arrayBuffer = (writer as any).toArrayBuffer?.() || (writer as any).buffer;
      const finalBuffer = arrayBuffer ? Buffer.from(arrayBuffer) : Buffer.alloc(0);
      await fetch(filePath, {
        method: 'PUT',
        body: finalBuffer,
      });
    } catch (ex: any) {
      console.error(`Error saving enhancement database: ${ex.message}\n${ex.stack}`);
    }
  }

  static async LoadEnhancementClasses(iPath?: string): Promise<boolean> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileEClasses, iPath);

    let fileContent: string;
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load enhancement classes file!');
        return false;
      }
      fileContent = await response.text();
    } catch (ex: any) {
      console.error(`Error loading enhancement classes: ${ex.message}\n${ex.stack}`);
      return false;
    }

    const lines = fileContent.split(/\r?\n/);
    let currentLineIndex = 0;

    // Helper function to read next line and split by whitespace (mimics FileIO.IOGrab)
    const readNextLine = (): string[] | null => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex++].trim();
        if (line.length > 0) {
          // Split by whitespace (one or more spaces/tabs)
          return line.split(/\t/);
        }
      }
      return null;
    };

    // Helper function to seek to a line containing the search string (mimics FileIO.IOSeek)
    const seekToLine = (searchString: string): boolean => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.includes(searchString)) {
          currentLineIndex++; // Move past the header line
          return true;
        }
        currentLineIndex++;
      }
      return false;
    };

    // Helper function to seek and return the line (mimics FileIO.IOSeekReturn)
    const seekAndReturn = (searchString: string): string | null => {
      const savedIndex = currentLineIndex;
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.includes(searchString)) {
          return line;
        }
        currentLineIndex++;
      }
      currentLineIndex = savedIndex;
      return null;
    };

    this.Database.EnhancementClasses = [];

    try {
      // Check for version comment
      if (!seekAndReturn(AppDataPaths.Headers.VersionComment)) {
        throw new Error('Unable to load Enhancement Class data, version header not found!');
      }

      // Seek to "Index" section
      if (!seekToLine('Index')) {
        throw new Error('Unable to load Enhancement Class data, section header not found!');
      }

      const enhancementClasses: any[] = [];
      let strArray: string[] | null;

      // Read lines until we find "End" (mimics C# do-while loop)
      do {
        strArray = readNextLine();
        if (!strArray) {
          break; // End of file
        }

        if (strArray[0] !== 'End') {
          // Format: ID Name ShortName ClassID Desc (exactly 5 fields)
          if (strArray.length >= 5) {
            const enhClass: any = {
              ID: parseInt(strArray[0], 10),
              Name: strArray[1],
              ShortName: strArray[2],
              ClassID: strArray[3],
              Desc: strArray[4] // Single field, not joined
            };
            if (isFinite(enhClass.ID)) {
              enhancementClasses.push(enhClass);
            }
          }
        } else {
          break;
        }
      } while (strArray && strArray[0] !== 'End');

      this.Database.EnhancementClasses = enhancementClasses;
      return true;
    } catch (ex: any) {
      console.error(`Error loading enhancement classes: ${ex.message}\n${ex.stack}`);
      return false;
    }
  }

  static async LoadTypeGrades(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.JsonFileTypeGrades, iPath);
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load TypeGrades file!');
        return;
      }
      const jsonData = await response.json();

      const headerResult = jsonData['Name'];
      if (headerResult !== AppDataPaths.Headers.TypeGrade.Start) {
        console.error('Invalid header detected in TypeGrades file!');
        return;
      }

      // Load SetTypes
      const setTypeResults = jsonData['SetTypes'];
      var setTypes: TypeGrade[] = [];
      if (Array.isArray(setTypeResults)) {
        for (const result of setTypeResults) {
          const setType: TypeGrade = {
            Index: this.Database.SetTypes.length,
            Name: result.Name || '',
            ShortName: result.ShortName || '',
            Description: result.Description || ''
          };
          setTypes.push(setType);
        }
      }
      this.Database.SetTypes = setTypes;

      // Load EnhancementGrades
      const enhGradeResults = jsonData['EnhancementGrades'];
      var enhancementGrades: TypeGrade[] = [];
      if (Array.isArray(enhGradeResults)) {
        for (const result of enhGradeResults) {
          const enhGrade: TypeGrade = {
            Index: this.Database.EnhancementGrades.length,
            Name: result.Name || '',
            ShortName: result.ShortName || '',
            Description: result.Description || ''
          };
          enhancementGrades.push(enhGrade);
        }
      }
      this.Database.EnhancementGrades = enhancementGrades;

      // Load SpecialEnhancements
      const specEnhResults = jsonData['SpecialEnhancementTypes'];
      var specialEnhancements: TypeGrade[] = [];
      if (Array.isArray(specEnhResults)) {
        for (const result of specEnhResults) {
          const specEnh: TypeGrade = {
            Index: this.Database.SpecialEnhancements.length,
            Name: result.Name || '',
            ShortName: result.ShortName || '',
            Description: result.Description || ''
          };
          specialEnhancements.push(specEnh);
        }
      }
      this.Database.SpecialEnhancements = specialEnhancements;
    } catch (e) {
      console.error('Error loading TypeGrades:', e);
    }
  }

  static async LoadRecipes(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileRecipe, iPath);

    this.Database.Recipes = [];
    let reader: BinaryReader | null = null;

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load recipe database file!');
        return;
      }
      const buffer = await response.arrayBuffer();
      reader = new BinaryReader(buffer);
    } catch (ex: any) {
      console.error(`${ex.message}\n\nRecipe database couldn't be loaded.`);
      return;
    }

    try {
      let headerFound = true;
      const header = reader.readString();
      if (header !== AppDataPaths.Headers.Recipe.Start) {
        headerFound = false;
      }

      if (!headerFound) {
        console.error('Expected recipe header, got something else!');
        return;
      }

      this.Database.RecipeSource1 = reader.readString();
      this.Database.RecipeSource2 = reader.readString();
      // DateTime.FromBinary - convert from binary representation
      const dateBinary = reader.readLong();
      this.Database.RecipeRevisionDate = new Date(dateBinary);
      const num = 0;
      const recipeCount = reader.readInt();
      this.Database.Recipes = new Array(recipeCount + 1);
      for (let index = 0; index < this.Database.Recipes.length; index++) {
        this.Database.Recipes[index] = new Recipe(reader, false);
      }
    } catch (ex: any) {
      console.error(`Error loading recipes: ${ex.message}\n${ex.stack}`);
    }
  }

  static async SaveRecipes(serializer: any, iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileSave(AppDataPaths.MxdbFileRecipe, iPath);

    try {
      const buffer = Buffer.alloc(10 * 1024 * 1024); // 10MB buffer
      const writer = new BinaryWriter(buffer);

      writer.writeString(AppDataPaths.Headers.Recipe.Start);
      writer.writeString(this.Database.RecipeSource1);
      writer.writeString(this.Database.RecipeSource2);
      // DateTime.ToBinary - convert to binary representation
      writer.writeLong(this.Database.RecipeRevisionDate.getTime());
      writer.writeInt(this.Database.Recipes.length - 1);
      for (let index = 0; index <= this.Database.Recipes.length - 1; index++) {
        this.Database.Recipes[index].StoreTo(writer);
      }

      // Get the written buffer from BinaryWriter
      // Note: csharp-binary-stream BinaryWriter API may vary
      const arrayBuffer = (writer as any).toArrayBuffer?.() || (writer as any).buffer;
      const finalBuffer = arrayBuffer ? Buffer.from(arrayBuffer) : Buffer.alloc(0);
      await fetch(filePath, {
        method: 'PUT',
        body: finalBuffer,
      });
    } catch (ex: any) {
      console.error(`Error saving recipes: ${ex.message}\n${ex.stack}`);
    }
  }

  static async LoadSalvage(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileSalvage, iPath);

    this.Database.Salvage = [];
    let reader: BinaryReader | null = null;

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load salvage database file!');
        return;
      }
      const buffer = await response.arrayBuffer();
      reader = new BinaryReader(buffer);
    } catch (ex: any) {
      console.error(`${ex.message}\n\nSalvage database couldn't be loaded.`);
      return;
    }

    try {
      let headerFound = true;
      const header = reader.readString();

      if (header !== AppDataPaths.Headers.Salvage.Start) {
        headerFound = false;
      }

      if (!headerFound) {
        console.error('Expected salvage header, got something else!');
        return;
      }

      const salvageCount = reader.readInt();
      this.Database.Salvage = new Array(salvageCount + 1);
      for (let index = 0; index < this.Database.Salvage.length; index++) {
        this.Database.Salvage[index] = new Salvage(reader);
      }
    } catch (ex: any) {
      console.error(
        `Salvage Database file isn't how it should be (${ex.message})\nNo salvage loaded.`
      );
      this.Database.Salvage = [];
    }
  }

  static async SaveSalvage(serializer: any, iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileSave(AppDataPaths.MxdbFileSalvage, iPath);

    try {
      const buffer = Buffer.alloc(5 * 1024 * 1024); // 5MB buffer
      const writer = new BinaryWriter(buffer);

      writer.writeString(AppDataPaths.Headers.Salvage.Start);
      writer.writeInt(this.Database.Salvage.length - 1);
      for (let index = 0; index <= this.Database.Salvage.length - 1; index++) {
        this.Database.Salvage[index].StoreTo(writer);
      }

      // Get the written buffer from BinaryWriter
      // Note: csharp-binary-stream BinaryWriter API may vary
      const arrayBuffer = (writer as any).toArrayBuffer?.() || (writer as any).buffer;
      const finalBuffer = arrayBuffer ? Buffer.from(arrayBuffer) : Buffer.alloc(0);
      await fetch(filePath, {
        method: 'PUT',
        body: finalBuffer,
      });
    } catch (ex: any) {
      console.error(`Error saving salvage: ${ex.message}\n${ex.stack}`);
    }
  }

  static async LoadOrigins(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileOrigins, iPath);

    var origins: Origin[] = [];

    let fileContent: string;
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load origins database file!');
        return;
      }
      fileContent = await response.text();
    } catch (ex: any) {
      console.error(`Error loading origins: ${ex.message}\n${ex.stack}`);
      return;
    }

    const lines = fileContent.split(/\r?\n/);
    let currentLineIndex = 0;

    // Helper function to read next line and split by whitespace (mimics FileIO.IOGrab)
    const readNextLine = (): string[] | null => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex++].trim();
        if (line.length > 0) {
          // Split by whitespace (one or more spaces/tabs)
          return line.split(/\s+/);
        }
      }
      return null;
    };

    // Helper function to seek to a line containing the search string (mimics FileIO.IOSeek)
    const seekToLine = (searchString: string): boolean => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.startsWith(searchString)) {
          currentLineIndex++; // Move past the header line
          return true;
        }
        currentLineIndex++;
      }
      return false;
    };

    // Helper function to seek and return the line (mimics FileIO.IOSeekReturn)
    const seekAndReturn = (searchString: string): string | null => {
      const savedIndex = currentLineIndex;
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.includes(searchString)) {
          return line;
        }
        currentLineIndex++;
      }
      currentLineIndex = savedIndex;
      return null;
    };

    try {
      // Check for version comment
      if (!seekAndReturn('Version:')) {
        throw new Error('Unable to load Origin data, version header not found!');
      }

      // Seek to "Origin" section
      if (!seekToLine('Origin')) {
        throw new Error('Unable to load Origin data, section header not found!');
      }

      let strArray: string[] | null;

      // Read lines until we find "End" (mimics C# do-while loop)
      do {
        strArray = readNextLine();
        if (!strArray) {
          break; // End of file
        }

        if (strArray[0] !== 'End') {
          // Format: Name DualO SingleO (exactly 3 fields)
          if (strArray.length >= 3) {
            origins.push(new Origin(strArray[0], strArray[1], strArray[2]));
          }
        } else {
          break;
        }
      } while (strArray && strArray[0] !== 'End');
    } catch (ex: any) {
      console.error(`Error loading origins: ${ex.message}\n${ex.stack}`);
    }
    this.Database.Origins = origins;
  }

  static async LoadLevelsDatabase(iPath?: string): Promise<boolean> {
    let filePath = '';
    if (MidsContext.Config != null) {
      switch (MidsContext.Config.BuildMode) {
        case dmModes.LevelUp:
        case dmModes.Normal:
          filePath = iPath
            ? AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileNLevels, iPath)
            : AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileNLevels);
          break;
        case dmModes.Respec:
          filePath = iPath
            ? AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileRLevels, iPath)
            : AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileRLevels);
          break;
      }
      if (filePath === '' || filePath === null) {
        throw new Error('Unable to load levels database, file path not found!');
      }
    }

    let levels: LevelMap[] = [];
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load levels database file!');
        return false;
      }
      const fileContent = await response.text();
      const lines = fileContent.split('\n');

      // Helper for sequential line reading (mimics FileIO.IOGrab)
      let currentLineIndex = 0;
      const readNextLine = (): string[] | null => {
        while (currentLineIndex < lines.length) {
          const line = lines[currentLineIndex++].trim();
          if (line) {
            return line.split('\t').map(item => item.trim());
          }
        }
        return null;
      };

      // Read lines until we find "Level" (mimics C# while loop)
      let strArray = readNextLine();
      while (strArray && strArray[0] !== 'Level') {
        strArray = readNextLine();
      }

      if (!strArray || strArray[0] !== 'Level') {
        throw new Error('Level section not found in levels database');
      }

      // Initialize Levels array and read 50 level entries sequentially
      levels = new Array(50);
      for (let index = 0; index < 50; index++) {
        const lineData = readNextLine();
        if (lineData) {
          levels[index] = new LevelMap(lineData);
        } else {
          // Create empty level map if not enough lines
          levels[index] = new LevelMap(['Level', '0', '0']);
        }
      }

      // Build Levels_MainPowers array
      const intList: number[] = [0];
      for (let index = 0; index <= levels.length - 1; index++) {
        if (levels[index].Powers > 0) {
          intList.push(index);
        }
      }

      this.Database.Levels_MainPowers = intList;
      this.Database.Levels = levels;
      return true;
    } catch (ex: any) {
      console.error(`Error loading levels database: ${ex.message}\n${ex.stack}`);
      return false;
    }
  }

  static async LoadEffectIdsDatabase(iPath?: string): Promise<boolean> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileEffectIds, iPath);

    try {
      var effectIds: string[] = [];
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load effect ids database file!');
        return false;
      }
      const buffer = await response.arrayBuffer();
      const reader = new BinaryReader(buffer);

      try {
        const efIdCount = reader.readInt();
        for (let index = 0; index < efIdCount; index++) {
          effectIds.push(reader.readString());
        }
        this.Database.EffectIds = effectIds;
        return true;
      } catch (e) {
        console.error('Error reading EffectIds database:', e);
        return false;
      }
    } catch (e) {
      console.error('Error loading EffectIds database:', e);
      return false;
    }
  }

  static async SaveEffectIdsDatabase(iPath?: string): Promise<void> {
    const filePath = AppDataPaths.SelectDataFileSave(AppDataPaths.MxdbFileEffectIds, iPath);
    var effectIds: string[] = this.Database.EffectIds;
    try {
      const buffer = Buffer.alloc(1024 * 1024); // Allocate 1MB buffer
      const writer = new BinaryWriter(buffer);

      writer.writeInt(effectIds.length);
      for (const effectId of effectIds) {
        writer.writeString(effectId);
      }

      // Get the written buffer from BinaryWriter
      // Note: csharp-binary-stream BinaryWriter API may vary
      const arrayBuffer = (writer as any).toArrayBuffer?.() || (writer as any).buffer;
      const finalBuffer = arrayBuffer ? Buffer.from(arrayBuffer) : Buffer.alloc(0);
      await fetch(filePath, {
        method: 'PUT',
        body: finalBuffer,
      });
    } catch (ex: any) {
      console.error(`Failed to save the EffectIds DB: ${ex.message}`);
    }
  }

  private static InitializeMaths(): void {
    // Initialize MultED: 4x3 array
    var multED: number[][] = [];
    for (let index = 0; index < 4; index++) {
      multED.push(new Array(3).fill(1));
    }

    // Initialize MultTO, MultDO, MultSO, MultHO: 1x4 arrays
    var multTO: number[][] = [new Array(4).fill(1)];
    var multDO: number[][] = [new Array(4).fill(1)];
    var multSO: number[][] = [new Array(4).fill(1)];
    var multHO: number[][] = [new Array(4).fill(1)];

    // Initialize MultIO: 53x4 array
    var multIO: number[][] = [];
    for (let index1 = 0; index1 < 53; index1++) {
      multIO.push(new Array(4).fill(1));
    }
    this.Database.MultED = multED;
    this.Database.MultTO = multTO;
    this.Database.MultDO = multDO;
    this.Database.MultSO = multSO;
    this.Database.MultHO = multHO;
    this.Database.MultIO = multIO;
  }

  static async LoadMaths(iPath?: string): Promise<boolean> {
    const filePath = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileMaths, iPath);

    let fileContent: string;
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        console.error('Failed to load enhancement maths file!');
        return false;
      }
      fileContent = await response.text();
    } catch (ex: any) {
      console.error(`Error loading enhancement Maths: ${ex.message}\n${ex.stack}`);
      return false;
    }

    const lines = fileContent.split(/\r?\n/);
    let currentLineIndex = 0;

    // Helper function to read next line and split by whitespace (mimics FileIO.IOGrab)
    const readNextLine = (): string[] | null => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex++].trim();
        if (line.length > 0) {
          // Split by whitespace (one or more spaces/tabs)
          return line.split(/\s+/);
        }
      }
      return null;
    };

    // Helper function to seek to a line containing the search string (mimics FileIO.IOSeek)
    const seekToLine = (searchString: string): boolean => {
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.includes(searchString)) {
          currentLineIndex++; // Move past the header line
          return true;
        }
        currentLineIndex++;
      }
      return false;
    };

    // Helper function to seek and return the line (mimics FileIO.IOSeekReturn)
    const seekAndReturn = (searchString: string): string | null => {
      const savedIndex = currentLineIndex;
      while (currentLineIndex < lines.length) {
        const line = lines[currentLineIndex].trim();
        if (line.includes(searchString)) {
          return line;
        }
        currentLineIndex++;
      }
      currentLineIndex = savedIndex;
      return null;
    };

    let loadErrorDetectedPass = -1;

    try {
      // Check for version comment
      if (!seekAndReturn(AppDataPaths.Headers.VersionComment)) {
        console.error('Unable to load Enhancement Maths data, version header not found!');
        return false;
      }

      // Seek to "EDRT" section
      if (!seekToLine('EDRT')) {
        console.error('Unable to load Maths data, section header not found!');
        return false;
      }

      this.InitializeMaths();

      // Read EDRT section (3 lines, 4 values each)
      // Format: [label, value1, value2, value3, value4]
      for (let index1 = 0; index1 <= 2; index1++) {
        const strArray = readNextLine();
        if (!strArray || strArray.length < 5) {
          loadErrorDetectedPass = 1;
          break;
        }
        for (let index2 = 0; index2 < 4; index2++) {
          const value = parseFloat(strArray[index2 + 1]); // Skip index 0 (label), read indices 1-4
          if (!isNaN(value)) {
            this.Database.MultED[index2][index1] = value;
          } else {
            loadErrorDetectedPass = 1;
          }
        }
      }

      // Seek to "EGE" section
      if (!seekToLine('EGE')) {
        console.error('Unable to load Maths data, EGE section header not found!');
        return false;
      }

      // Read TO (first line after EGE)
      const strArray1 = readNextLine();
      if (strArray1 && strArray1.length >= 5) {
        for (let index = 0; index < 4; index++) {
          const value = parseFloat(strArray1[index + 1]);
          if (!isNaN(value)) {
            this.Database.MultTO[0][index] = value;
          } else {
            loadErrorDetectedPass = 2;
          }
        }
      } else {
        loadErrorDetectedPass = 2;
      }

      // Read DO (second line after EGE)
      const strArray2 = readNextLine();
      if (strArray2 && strArray2.length >= 5) {
        for (let index = 0; index < 4; index++) {
          const value = parseFloat(strArray2[index + 1]);
          if (!isNaN(value)) {
            this.Database.MultDO[0][index] = value;
          } else {
            loadErrorDetectedPass = 3;
          }
        }
      } else {
        loadErrorDetectedPass = 3;
      }

      // Read SO (third line after EGE)
      const strArray3 = readNextLine();
      if (strArray3 && strArray3.length >= 5) {
        for (let index = 0; index < 4; index++) {
          const value = parseFloat(strArray3[index + 1]);
          if (!isNaN(value)) {
            this.Database.MultSO[0][index] = value;
          } else {
            loadErrorDetectedPass = 4;
          }
        }
      } else {
        loadErrorDetectedPass = 4;
      }

      // Read HO (fourth line after EGE)
      const strArray4 = readNextLine();
      if (strArray4 && strArray4.length >= 5) {
        for (let index = 0; index < 4; index++) {
          const value = parseFloat(strArray4[index + 1]);
          if (!isNaN(value)) {
            this.Database.MultHO[0][index] = value;
          } else {
            loadErrorDetectedPass = 5;
          }
        }
      } else {
        loadErrorDetectedPass = 5;
      }

      // Seek to "LBIOE" section
      if (!seekToLine('LBIOE')) {
        console.error('Unable to load Maths data, LBIOE section header not found!');
        return false;
      }

      // Read IO multipliers (53 lines)
      for (let index1 = 0; index1 < 53; index1++) {
        const strArray5 = readNextLine();
        if (strArray5 && strArray5.length >= 5) {
          for (let index2 = 0; index2 < 4; index2++) {
            const value = parseFloat(strArray5[index2 + 1]);
            if (!isNaN(value)) {
              this.Database.MultIO[index1][index2] = value;
            } else {
              loadErrorDetectedPass = 6;
            }
          }
        } else {
          loadErrorDetectedPass = 6;
        }
      }
    } catch (ex: any) {
      console.error(`Error loading enhancement Maths: ${ex.message}\n${ex.stack}`);
      return false;
    }

    if (loadErrorDetectedPass === -1) {
      return true;
    }

    // Report error
    const errorType =
      loadErrorDetectedPass === 1
        ? 'ED'
        : loadErrorDetectedPass === 2
          ? 'TO'
          : loadErrorDetectedPass === 3
            ? 'DO'
            : loadErrorDetectedPass === 4
              ? 'SO'
              : loadErrorDetectedPass === 5
                ? 'HO'
                : loadErrorDetectedPass === 6
                  ? 'IO'
                  : 'Other';
    console.error(
      `Error loading ${errorType} multipliers in ${filePath}.\nFaulty multipliers have been defaulted to 1.`
    );
    return false;
  }

  static async LoadReplacementTable(path: string): Promise<void> {
    try {
      await PowersReplTable.Initialize(path);
      this.Database.ReplTable = PowersReplTable.Current;
    } catch (ex: any) {
      console.warn(
        `An error occurred loading the automatic powers replacement table.\r\nOld powers will now be converted and may appear blank\r\nwhen loading builds.\r\n\r\n${ex.message}`
      );
    }
  }

  static async LoadCrypticReplacementTable(path: string): Promise<void> {
    try {
      await CrypticReplTable.Initialize(path);
      this.Database.CrypticReplTable = CrypticReplTable.Current;
    } catch (ex: any) {
      console.warn(`Error loading CrypticReplTable: ${ex.message}`);
      this.Database.CrypticReplTable = null;
    }
  }

  private static GetRecipeIdxByName(iName: string): number {
    for (let index = 0; index < this.Database.Recipes.length; index++) {
      if (
        this.Database.Recipes[index].InternalName.toLowerCase() ===
        iName.toLowerCase()
      ) {
        return index;
      }
    }
    return -1;
  }

  static GuessRecipes(): void {
    for (const enhancement of this.Database.Enhancements) {
      if (
        enhancement.TypeID !== 2 && // InventO
        enhancement.TypeID !== 3 // SetO
      ) {
        continue;
      }
      const recipeIdxByName = this.GetRecipeIdxByName(enhancement.UID);
      if (recipeIdxByName <= -1) {
        continue;
      }
      enhancement.RecipeIDX = recipeIdxByName;
      enhancement.RecipeName = this.Database.Recipes[recipeIdxByName].InternalName;
    }
  }

  static AssignRecipeSalvageIDs(): void {
    const numArray: number[] = new Array(7).fill(-1);
    const strArray: string[] = new Array(7).fill('');
    for (const recipe of this.Database.Recipes) {
      for (const recipeEntry of recipe.Item) {
        for (let index1 = 0; index1 < recipeEntry.Salvage.length; index1++) {
          if (recipeEntry.Salvage[index1] === strArray[index1]) {
            recipeEntry.SalvageIdx[index1] = numArray[index1];
          } else {
            recipeEntry.SalvageIdx[index1] = -1;
            const a = recipeEntry.Salvage[index1];
            for (
              let index2 = 0;
              index2 < this.Database.Salvage.length;
              index2++
            ) {
              if (
                a.toLowerCase() !==
                this.Database.Salvage[index2].InternalName.toLowerCase()
              ) {
                continue;
              }
              recipeEntry.SalvageIdx[index1] = index2;
              numArray[index1] = index2;
              strArray[index1] = recipeEntry.Salvage[index1];
              break;
            }
          }
        }
      }
    }
  }

  static AssignRecipeIDs(): void {
    for (const recipe of this.Database.Recipes) {
      recipe.Enhancement = '';
      recipe.EnhIdx = -1;
    }

    for (
      let index1 = 0;
      index1 < this.Database.Enhancements.length;
      index1++
    ) {
      const enhancement = this.Database.Enhancements[index1];
      if (!enhancement.RecipeName) {
        continue;
      }
      enhancement.RecipeIDX = -1;
      const recipeName = enhancement.RecipeName;
      for (
        let index2 = 0;
        index2 < this.Database.Recipes.length;
        index2++
      ) {
        if (
          recipeName.toLowerCase() !==
          this.Database.Recipes[index2].InternalName.toLowerCase()
        ) {
          continue;
        }
        this.Database.Recipes[index2].Enhancement = enhancement.UID;
        this.Database.Recipes[index2].EnhIdx = index1;
        enhancement.RecipeIDX = index2;
        break;
      }
    }
  }

  private static UpdateDbModified(): void {
    const now = new Date();
    this.Database.Date = now;
    const year = now.getFullYear();
    const month = parseInt(String(now.getMonth() + 1).padStart(2, '0'));
    const revision = this.Database.Version.revision + 1;
    this.Database.Version = { major: year, minor: month, build: this.Database.Version.build, revision: revision };
  }

  // Note: Many more utility methods would be added here
  // This class has 3000+ lines with many helper functions
  // The core lookup, matching, and query methods are now implemented
}

