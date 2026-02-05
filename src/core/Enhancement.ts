// Converted from C# Enhancement.cs
import type { IEnhancement } from './IEnhancement';
import type { IPower } from './IPower';
import { eType, eEnhMutex, eBuffDebuff, eEffMode, ePowerType, eSchedule, eEnhance } from './Enums';
import type { sEffect } from './IEnhancement';
import type { EnhancementSet } from './EnhancementSet';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { Effect } from './Base/Data_Classes/Effect';
import { DatabaseAPI } from './DatabaseAPI';

export class Enhancement implements IEnhancement {
  private _power: IPower | null = null;

  IsModified: boolean = false;
  IsNew: boolean = false;
  StaticIndex: number = 0;
  Name: string = '';
  ShortName: string = '';
  Desc: string = '';
  TypeID: eType = eType.Normal;
  SubTypeID: number = 0;
  ClassID: number[] = [];
  Image: string = '';
  ImageIdx: number = 0;
  nIDSet: number = -1;
  UIDSet: string = '';
  Effect: sEffect[] = [];
  EffectChance: number = 1;
  LevelMin: number = 0;
  LevelMax: number = 52;
  Unique: boolean = false;
  MutExID: eEnhMutex = eEnhMutex.None;
  BuffMode: eBuffDebuff = eBuffDebuff.Any;
  RecipeName: string = '';
  RecipeIDX: number = -1;
  UID: string = '';
  IsProc: boolean = false;
  IsScalable: boolean = false;
  Superior: boolean = false;

  constructor(iEnhOrReader?: IEnhancement | BinaryReader) {
    if (iEnhOrReader instanceof BinaryReader) {
      const reader = iEnhOrReader;
      this.RecipeIDX = -1;
      this.IsModified = false;
      this.IsNew = false;
      this.StaticIndex = reader.readInt();
      this.Name = reader.readString();
      this.ShortName = reader.readString();
      this.Desc = reader.readString();
      this.TypeID = reader.readInt() as eType;
      this.SubTypeID = reader.readInt();
      const classIdCount = reader.readInt() + 1;
      this.ClassID = new Array(classIdCount);
      for (let index = 0; index < classIdCount; index++) {
        this.ClassID[index] = reader.readInt();
      }
      this.Image = reader.readString();
      this.nIDSet = reader.readInt();
      this.UIDSet = reader.readString();
      this.EffectChance = reader.readFloat();
      this.LevelMin = reader.readInt();
      this.LevelMax = reader.readInt();
      this.Unique = reader.readBoolean();
      this.MutExID = reader.readInt() as eEnhMutex;
      this.BuffMode = reader.readInt() as eBuffDebuff;
      if (this.MutExID < eEnhMutex.None) {
        this.MutExID = eEnhMutex.None;
      }
      const effectCount = reader.readInt() + 1;
      this.Effect = new Array(effectCount);
      for (let index = 0; index < effectCount; index++) {
        this.Effect[index] = {
          Mode: reader.readInt() as eEffMode,
          BuffMode: reader.readInt() as eBuffDebuff,
          Enhance: {
            ID: reader.readInt(),
            SubID: reader.readInt()
          },
          Schedule: reader.readInt() as eSchedule,
          Multiplier: reader.readFloat(),
          FX: null
        };
        const hasEffect = reader.readBoolean();
        if (hasEffect) {
          this.Effect[index].FX = new Effect(reader);
          this.Effect[index].FX!.isEnhancementEffect = true;
        }
      }
      this.UID = reader.readString();
      this.RecipeName = reader.readString();
      this.Superior = reader.readBoolean();
      this.IsProc = reader.readBoolean();
      this.IsScalable = reader.readBoolean();
    } else if (iEnhOrReader) {
      const iEnh = iEnhOrReader;
      this.StaticIndex = iEnh.StaticIndex;
      this.Name = iEnh.Name;
      this.ShortName = iEnh.ShortName;
      this.Desc = iEnh.Desc;
      this.TypeID = iEnh.TypeID;
      this.SubTypeID = iEnh.SubTypeID;
      this.Image = iEnh.Image;
      this.ImageIdx = iEnh.ImageIdx;
      this.nIDSet = iEnh.nIDSet;
      this.UIDSet = iEnh.UIDSet;
      this.EffectChance = iEnh.EffectChance;
      this.LevelMin = iEnh.LevelMin;
      this.LevelMax = iEnh.LevelMax;
      this.Unique = iEnh.Unique;
      this.MutExID = iEnh.MutExID;
      this.BuffMode = iEnh.BuffMode;
      this._power = iEnh.GetPower();
      this.ClassID = [...iEnh.ClassID];
      this.Effect = iEnh.Effect.map(e => ({ ...e })); // Shallow copy
      this.UID = iEnh.UID;
      this.IsProc = iEnh.IsProc;
      this.IsScalable = iEnh.IsScalable;
      this.RecipeName = iEnh.RecipeName;
      this.RecipeIDX = iEnh.RecipeIDX;
      this.Superior = iEnh.Superior;
    } else {
      this.UID = '';
      this.Name = 'New Enhancement';
      this.ShortName = 'NewEnh';
      this.Desc = '';
      this.TypeID = eType.Normal;
      this.SubTypeID = 0;
      this.Image = '';
      this.nIDSet = -1;
      this.EffectChance = 1;
      this.LevelMax = 52;
      this.UIDSet = '';
      this.BuffMode = eBuffDebuff.Any;
      this.ClassID = [];
      this.Effect = [];
      this.RecipeName = '';
      this.RecipeIDX = -1;
      this.UID = '';
      this.IsProc = false;
      this.IsScalable = false;
    }
  }

  get Probability(): number {
    for (const effect of this.Effect) {
      if (effect.Mode === eEffMode.FX) {
        return effect.FX?.Probability ?? 0;
      }
    }
    return 0;
  }

  get HasEnhEffect(): boolean {
    return this.Effect.some(e => e.Mode === eEffMode.Enhancement);
  }

  get HasPowerEffect(): boolean {
    return this.Effect.some(e => e.Mode === eEffMode.FX);
  }

  get LongName(): string {
    switch (this.TypeID) {
      case eType.Normal:
      case eType.SpecialO:
        return this.Name;
      case eType.InventO:
        return `Invention: ${this.Name}`;
      case eType.SetO:
        if (this.nIDSet >= 0 && DatabaseAPI.Database.EnhancementSets[this.nIDSet]) {
          return `${DatabaseAPI.Database.EnhancementSets[this.nIDSet].DisplayName}: ${this.Name}`;
        }
        return this.Name;
      default:
        return '';
    }
  }

  get Schedule(): eSchedule {
    switch (this.Effect.length) {
      case 1:
        return this.Effect[0].Schedule;
      case 0:
        return eSchedule.None;
      default:
        const schedule = this.Effect[0].Schedule;
        let flag = false;
        for (let index = 0; index < this.Effect.length; index++) {
          if (this.Effect[index].Schedule !== schedule) {
            flag = true;
            break;
          }
        }
        return !flag ? schedule : eSchedule.Multiple;
    }
  }

  GetPower(): IPower | null {
    if (!this._power) {
      this._power = DatabaseAPI.GetPowerByFullName(`Boosts.${this.UID}.${this.UID}`);
    }
    return this._power;
  }

  SetPower(power: IPower): void {
    this._power = power;
  }

  CheckAndFixIOLevel(level: number): number {
    if (this.TypeID !== eType.InventO && this.TypeID !== eType.SetO) {
      return level - 1;
    }

    let iMax = 52;
    let iMin = 9;
    switch (this.TypeID) {
      case eType.InventO:
        iMax = this.LevelMax;
        iMin = this.LevelMin;
        break;
      case eType.SetO:
        if (this.nIDSet > -1 && DatabaseAPI.Database.EnhancementSets[this.nIDSet]) {
          iMax = DatabaseAPI.Database.EnhancementSets[this.nIDSet].LevelMax;
          iMin = DatabaseAPI.Database.EnhancementSets[this.nIDSet].LevelMin;
        }
        break;
    }

    if (level > iMax) {
      level = iMax;
    }

    if (level < iMin) {
      level = iMin;
    }

    if (this.TypeID !== eType.InventO) {
      return level;
    }

    if (iMax > 49) {
      iMax = 49;
    }

    level = Enhancement.GranularLevelZb(level, iMin, iMax);
    return level;
  }

  GetSpecialName(): string {
    const specialEnh = DatabaseAPI.GetSpecialEnhByIndex(this.SubTypeID);
    return specialEnh?.ShortName ?? this.Name;
  }

  GetEnhancementSet(): EnhancementSet | null {
    if (!this.UIDSet || this.UIDSet.trim() === '') {
      return null;
    }

    return DatabaseAPI.GetEnhancementSetFromEnhUid(this.UIDSet);
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeInt(this.StaticIndex);
    writer.writeString(this.Name);
    writer.writeString(this.ShortName);
    writer.writeString(this.Desc);
    writer.writeInt(this.TypeID);
    writer.writeInt(this.SubTypeID);
    writer.writeInt(this.ClassID.length - 1);
    for (const c of this.ClassID) {
      writer.writeInt(c);
    }
    writer.writeString(this.Image);
    writer.writeInt(this.nIDSet);
    writer.writeString(this.UIDSet);
    writer.writeFloat(this.EffectChance);
    writer.writeInt(this.LevelMin);
    writer.writeInt(this.LevelMax);
    writer.writeBoolean(this.Unique);
    writer.writeInt(this.MutExID);
    writer.writeInt(this.BuffMode);
    writer.writeInt(this.Effect.length - 1);
    for (let index = 0; index < this.Effect.length; index++) {
      writer.writeInt(this.Effect[index].Mode);
      writer.writeInt(this.Effect[index].BuffMode);
      writer.writeInt(this.Effect[index].Enhance.ID);
      writer.writeInt(this.Effect[index].Enhance.SubID);
      writer.writeInt(this.Effect[index].Schedule);
      writer.writeFloat(this.Effect[index].Multiplier);
      if (this.Effect[index].FX == null) {
        writer.writeBoolean(false);
      } else {
        writer.writeBoolean(true);
        this.Effect[index].FX!.StoreTo(writer);
      }
    }
    writer.writeString(this.UID);
    writer.writeString(this.RecipeName);
    writer.writeBoolean(this.Superior);
    writer.writeBoolean(this.IsProc);
    writer.writeBoolean(this.IsScalable);
  }

  static GranularLevelZb(iLevel: number, iMin: number, iMax: number, iStep: number = 5): number {
    let level = iLevel;
    let min = iMin;
    let max = iMax;
    ++min;
    ++max;
    ++level;
    const nStep = iStep;
    const nLevel = level;
    const midway = nStep / 2;
    const extra = level % nStep;
    if (extra > 0.0) {
      level = extra >= midway
        ? Math.floor(nLevel / nStep) * nStep + nStep
        : Math.floor(nLevel / nStep) * nStep;
    }
    if (level > max) {
      level = max;
    }
    if (level < min) {
      level = min;
    }
    return level - 1;
  }

  static GetSchedule(iEnh: eEnhance, tSub: number = -1): eSchedule {
    switch (iEnh) {
      case eEnhance.Defense:
        return eSchedule.B;
      case eEnhance.Interrupt:
        return eSchedule.C;
      case eEnhance.Mez:
        return (tSub <= -1 || !((tSub === 4) || (tSub === 5))) ? eSchedule.A : eSchedule.D;
      case eEnhance.Range:
        return eSchedule.B;
      case eEnhance.Resistance:
        return eSchedule.B;
      case eEnhance.ToHit:
        return eSchedule.B;
      default:
        return eSchedule.A;
    }
  }

  static ApplyED(iSched: eSchedule, iVal: number): number {
    switch (iSched) {
      case eSchedule.None:
        return 0.0;
      case eSchedule.Multiple:
        return 0.0;
      default:
        const ed: number[] = [];
        for (let index = 0; index <= 2; ++index) {
          ed[index] = DatabaseAPI.Database.MultED[iSched][index];
        }
        if (iVal <= ed[0]) {
          return iVal;
        }
        const edm: number[] = [
          ed[0],
          ed[0] + (ed[1] - ed[0]) * 0.899999976158142,
          ed[0] + (ed[1] - ed[0]) * 0.899999976158142 + (ed[2] - ed[1]) * 0.699999988079071
        ];
        if (iVal > ed[1]) {
          if (iVal > ed[2]) {
            return edm[2] + (iVal - ed[2]) * 0.150000005960464;
          } else {
            return edm[1] + (iVal - ed[1]) * 0.699999988079071;
          }
        } else {
          return edm[0] + (iVal - ed[0]) * 0.899999976158142;
        }
    }
  }
}

