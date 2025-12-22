// Converted from C# Database.cs
import type { IDatabase } from '../../IDatabase';
import type { IPower } from '../../IPower';
import type { IPowerset } from '../../IPowerset';
import type { Archetype } from './Archetype';
import type { IEnhancement } from '../../IEnhancement';
import { EnhancementSetCollection } from '../../EnhancementSetCollection';
import type { Recipe } from '../../Recipe';
import type { Salvage } from '../../Salvage';
import { PowersReplTable } from '../../PowersReplTable';
import type { CrypticReplTable } from '../CrypticReplTable';
import type { Origin } from './Origin';
import type { PowersetGroup } from '../../PowersetGroup';
import { Modifiers } from '../../Modifiers';
import { SummonedEntity } from '../../SummonedEntity';
import type { LevelMap } from '../../LevelMap';
import { sEnhClass } from '../../Enums';
import type { TypeGrade } from '../../Utils/StructAndEnums';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { Version } from '@/core/BuildFile/DataModels/MetaData';

export class Database implements IDatabase {
  static readonly Instance: Database = new Database();

  Name: string = '';
  Version: Version = {
    major: 0,
    minor: 0,
    build: 0,
    revision: 0
  };
  Issue: number = 0;
  PageVol: number = 0;
  PageVolText: string = '';
  Date: Date = new Date();
  Power: IPower[] = [];
  Powersets: IPowerset[] = [];
  Classes: Archetype[] = [];
  PowersetGroups: Map<string, PowersetGroup> = new Map();
  Loading: boolean = false;
  I9: any = null;
  AttribMods: Modifiers = new Modifiers();
  Entities: SummonedEntity[] = [];
  Levels: LevelMap[] = [];
  Levels_MainPowers: number[] = [];
  EffectIds: string[] = [];
  Enhancements: IEnhancement[] = [];
  EnhancementSets: EnhancementSetCollection = new EnhancementSetCollection();
  EnhancementClasses: sEnhClass[] = [];
  Recipes: Recipe[] = [];
  RecipeRevisionDate: Date = new Date();
  RecipeSource1: string = '';
  RecipeSource2: string = '';
  Salvage: Salvage[] = [];
  ReplTable: PowersReplTable | null = null;
  CrypticReplTable: CrypticReplTable | null = null;
  Origins: Origin[] = [];
  VersionEnhDb: number = 0;
  MultED: number[][] = [];
  MultTO: number[][] = [];
  MultDO: number[][] = [];
  MultSO: number[][] = [];
  MultHO: number[][] = [];
  MultIO: number[][] = [];
  SetTypes: TypeGrade[] = [];
  EnhancementGrades: TypeGrade[] = [];
  SpecialEnhancements: TypeGrade[] = [];
  EnhGradeStringLong: string[] = [
    'None',
    'Training Origin',
    'Dual Origin',
    'Single Origin'
  ];
  EnhGradeStringShort: string[] = [
    'None',
    'TR',
    'DO',
    'SO'
  ];
  MutexList: string[] = [];

  LoadEntities(reader: BinaryReader): void {
    const count = reader.readInt() + 1;
    const entities: SummonedEntity[] = new Array(count);
    for (let index = 0; index < count; index++) {
      entities[index] = new SummonedEntity(reader);
    }
    this.Entities = entities;
  }

  StoreEntities(writer: BinaryWriter): void {
    writer.writeInt(this.Entities.length - 1);
    for (const ent of this.Entities) {
      ent.StoreTo(writer);
    }
  }
}

