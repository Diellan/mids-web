// Converted from C# IEnhancement.cs
import type { IPower } from '../type/power';
import { eType, eEnhMutex, eBuffDebuff, eEffMode, eSchedule } from './Enums';
import type { sTwinID } from './Enums';
import type { IEffect } from './IEffect';
import type { EnhancementSet } from './EnhancementSet';

export interface sEffect {
  Mode: eEffMode;
  BuffMode: eBuffDebuff;
  Enhance: sTwinID;
  Schedule: eSchedule;
  Multiplier: number;
  FX: IEffect | null;
}

export interface IEnhancement {
  readonly HasEnhEffect: boolean;

  readonly HasPowerEffect: boolean;

  readonly Probability: number;

  StaticIndex: number;

  Name: string;

  ShortName: string;

  Desc: string;

  TypeID: eType;

  SubTypeID: number;

  ClassID: number[];

  Image: string;

  ImageIdx: number;

  nIDSet: number;

  UIDSet: string;

  Effect: sEffect[];

  EffectChance: number;

  LevelMin: number;

  LevelMax: number;

  Unique: boolean;

  MutExID: eEnhMutex;

  BuffMode: eBuffDebuff;

  RecipeName: string;

  RecipeIDX: number;

  UID: string;

  IsProc: boolean;

  IsScalable: boolean;

  Superior: boolean;

  readonly LongName: string;

  GetPower(): IPower | null;
  SetPower(power: IPower): void;

  CheckAndFixIOLevel(level: number): number;

  // Note: StoreTo method with BinaryWriter removed as it's C# specific
  // StoreTo(writer: BinaryWriter): void;

  GetSpecialName(): string;

  GetEnhancementSet(): EnhancementSet | null;
}

