// Converted from C# IDatabase.cs
import type { IPower } from './IPower';
import type { IPowerset } from './IPowerset';
import type { Archetype } from './Base/Data_Classes/Archetype';
import type { PowersetGroup } from './PowersetGroup';
import type { Modifiers } from './Modifiers';
import type { SummonedEntity } from './SummonedEntity';
import type { LevelMap } from './LevelMap';
import type { IEnhancement } from './IEnhancement';
import type { EnhancementSetCollection } from './EnhancementSetCollection';
import type { Recipe } from './Recipe';
import type { Salvage } from './Salvage';
import type { PowersReplTable } from './PowersReplTable';
import type { CrypticReplTable } from './Base/CrypticReplTable';
import type { Origin } from './Base/Data_Classes/Origin';
import type { TypeGrade } from './Utils/StructAndEnums';
import { sEnhClass } from './Enums';
import { Version } from './Utils/Helpers';

export interface IDatabase {
  Version: Version;

  Name: string;

  Issue: number;

  PageVol: number;

  PageVolText: string;

  Date: Date; // DateTime

  Power: IPower[];

  Powersets: IPowerset[];

  Classes: Archetype[];

  PowersetGroups: Map<string, PowersetGroup>; // IDictionary<string, PowersetGroup>

  Loading: boolean;

  I9: any; // object

  AttribMods: Modifiers;

  Entities: SummonedEntity[];

  Levels: LevelMap[];

  Levels_MainPowers: number[];

  EffectIds: string[];

  Enhancements: IEnhancement[];

  EnhancementSets: EnhancementSetCollection;

  EnhancementClasses: sEnhClass[];

  Recipes: Recipe[];

  RecipeRevisionDate: Date; // DateTime

  RecipeSource1: string;

  RecipeSource2: string;

  Salvage: Salvage[];

  ReplTable: PowersReplTable | null;

  CrypticReplTable: CrypticReplTable | null;

  Origins: Origin[];

  VersionEnhDb: number;

  MultED: number[][];

  MultTO: number[][];

  MultDO: number[][];

  MultSO: number[][];

  MultHO: number[][];

  MultIO: number[][];

  SetTypes: TypeGrade[];

  EnhancementGrades: TypeGrade[];

  SpecialEnhancements: TypeGrade[];

  EnhGradeStringLong: string[];

  EnhGradeStringShort: string[];

  MutexList: string[];

  LoadEntities(reader: import('csharp-binary-stream').BinaryReader): void;
  StoreEntities(writer: import('csharp-binary-stream').BinaryWriter): void;
}

