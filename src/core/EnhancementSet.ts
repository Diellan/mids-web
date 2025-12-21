// Converted from C# EnhancementSet.cs
import { ePvX, eEffectType } from './Enums';
import type { IEnhancement } from './IEnhancement';
import type { IEffect } from './IEffect';
import type { IPower } from './IPower';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { DatabaseAPI } from './DatabaseAPI';
import { Utilities } from './Base/Master_Classes/Utilities';

export interface BonusItem {
  Special: number;
  Name: string[];
  Index: number[];
  AltString: string;
  PvMode: ePvX;
  Slotted: number;
  Assign(iBi: BonusItem): void;
}

export class BonusItemImpl implements BonusItem {
  Special: number = -1;
  Name: string[] = [];
  Index: number[] = [];
  AltString: string = '';
  PvMode: ePvX = ePvX.Any;
  Slotted: number = 0;

  Assign(iBi: BonusItem): void {
    this.Special = iBi.Special;
    this.AltString = iBi.AltString;
    this.Name = [...iBi.Name];
    this.Index = [...iBi.Index];
    this.PvMode = iBi.PvMode;
    this.Slotted = iBi.Slotted;
  }
}

export class EnhancementSet {
  Bonus: BonusItem[] = [];
  Desc: string = '';
  DisplayName: string = '';
  Enhancements: number[] = [];
  Image: string = '';
  ImageIdx: number = 0;
  LevelMax: number = 52;
  LevelMin: number = 0;
  SetType: number = 0; // Enums.eSetType converted to number
  ShortName: string = '';
  SpecialBonus: BonusItem[] = [];
  Uid: string = '';

  constructor(iIOSetOrReader?: EnhancementSet | BinaryReader) {
    if (iIOSetOrReader instanceof BinaryReader) {
      const reader = iIOSetOrReader;
      this.DisplayName = reader.readString();
      this.ShortName = reader.readString();
      this.Uid = reader.readString();
      this.Desc = reader.readString();
      this.SetType = reader.readInt();
      this.Image = reader.readString();
      this.LevelMin = reader.readInt();
      this.LevelMax = reader.readInt();
      const enhancementsCount = reader.readInt() + 1;
      this.Enhancements = new Array(enhancementsCount);
      for (let index = 0; index < enhancementsCount; index++) {
        this.Enhancements[index] = reader.readInt();
      }
      this.InitBonus();
      this.InitBonusPvP();
      const bonusCount = reader.readInt() + 1;
      this.Bonus = new Array(bonusCount);
      for (let index1 = 0; index1 < bonusCount; index1++) {
        const bonusItem = new BonusItemImpl();
        bonusItem.Special = reader.readInt();
        bonusItem.AltString = reader.readString();
        bonusItem.PvMode = reader.readInt() as ePvX;
        bonusItem.Slotted = reader.readInt();
        const nameCount = reader.readInt() + 1;
        bonusItem.Name = new Array(nameCount);
        bonusItem.Index = new Array(nameCount);
        for (let index2 = 0; index2 < nameCount; index2++) {
          bonusItem.Name[index2] = reader.readString();
          bonusItem.Index[index2] = reader.readInt();
        }
        this.Bonus[index1] = bonusItem;
      }
      const specialBonusCount = reader.readInt() + 1;
      this.SpecialBonus = new Array(specialBonusCount);
      for (let index1 = 0; index1 < specialBonusCount; index1++) {
        const bonusItem = new BonusItemImpl();
        bonusItem.Special = reader.readInt();
        bonusItem.AltString = reader.readString();
        const nameCount = reader.readInt() + 1;
        bonusItem.Name = new Array(nameCount);
        bonusItem.Index = new Array(nameCount);
        for (let index2 = 0; index2 < nameCount; index2++) {
          bonusItem.Name[index2] = reader.readString();
          bonusItem.Index[index2] = reader.readInt();
        }
        this.SpecialBonus[index1] = bonusItem;
      }
    } else if (iIOSetOrReader) {
      const iIOSet = iIOSetOrReader;
      this.DisplayName = iIOSet.DisplayName;
      this.ShortName = iIOSet.ShortName;
      this.Desc = iIOSet.Desc;
      this.SetType = iIOSet.SetType;
      this.Image = iIOSet.Image;
      this.LevelMin = iIOSet.LevelMin;
      this.LevelMax = iIOSet.LevelMax;
      this.Enhancements = [...iIOSet.Enhancements];
      this.Bonus = iIOSet.Bonus.map(b => {
        const newBonus = new BonusItemImpl();
        newBonus.Assign(b);
        return newBonus;
      });
      this.SpecialBonus = iIOSet.SpecialBonus.map(b => {
        const newBonus = new BonusItemImpl();
        newBonus.Assign(b);
        return newBonus;
      });
      this.Uid = iIOSet.Uid;
    } else {
      this.DisplayName = '';
      this.ShortName = '';
      this.Desc = '';
      this.SetType = 0;
      this.Enhancements = [];
      this.Image = '';
      this.InitBonus();
      this.InitBonusPvP();
      this.LevelMin = 0;
      this.LevelMax = 52;
    }
  }

  InitBonus(): void {
    for (let index = 0; index < this.Bonus.length; index++) {
      this.Bonus[index] = new BonusItemImpl();
      this.Bonus[index].Special = -1;
      this.Bonus[index].AltString = '';
      this.Bonus[index].Name = [];
      this.Bonus[index].Index = [];
    }

    for (let index = 0; index < this.SpecialBonus.length; index++) {
      this.SpecialBonus[index] = new BonusItemImpl();
      this.SpecialBonus[index].Special = -1;
      this.SpecialBonus[index].AltString = '';
      this.SpecialBonus[index].Name = [];
      this.SpecialBonus[index].Index = [];
    }
  }

  InitBonusPvP(): void {
    // Resize Bonus array to 11
    const oldBonus = this.Bonus;
    this.Bonus = new Array(11);
    for (let i = 0; i < oldBonus.length && i < 11; i++) {
      this.Bonus[i] = oldBonus[i];
    }
    for (let index = 0; index < this.Bonus.length; index++) {
      if (!this.Bonus[index]) {
        this.Bonus[index] = new BonusItemImpl();
      }
      this.Bonus[index].Special = -1;
      this.Bonus[index].AltString = '';
      this.Bonus[index].Name = [];
      this.Bonus[index].Index = [];
    }

    // SpecialBonus stays at 6
    for (let index = 0; index < this.SpecialBonus.length; index++) {
      this.SpecialBonus[index].Special = -1;
      this.SpecialBonus[index].AltString = '';
      this.SpecialBonus[index].Name = [];
      this.SpecialBonus[index].Index = [];
    }
  }

  GetEnhancementSetRarity(): string {
    if (this.Enhancements.length === 0) {
      return '';
    }
    const enhIdx = this.Enhancements[0];
    if (enhIdx < 0 || enhIdx >= DatabaseAPI.Database.Enhancements.length) {
      return '';
    }
    const recipeIdx = DatabaseAPI.Database.Enhancements[enhIdx].RecipeIDX;
    if (recipeIdx < 0 || recipeIdx >= DatabaseAPI.Database.Recipes.length) {
      return '';
    }
    return DatabaseAPI.Database.Recipes[recipeIdx].Rarity.toString();
  }

  GetEffectDetailedData2(index: number, special: boolean): Map<string, IEffect[]> {
    const ret = new Map<string, IEffect[]>();
    const bonusItemArray = special ? this.SpecialBonus : this.Bonus;
    if (index < 0 || index > bonusItemArray.length - 1) {
      return ret;
    }

    for (let i = 0; i < bonusItemArray[index].Name.length; i++) {
      if (bonusItemArray[index].Index[i] < 0) continue;
      if (bonusItemArray[index].Index[i] > DatabaseAPI.Database.Power.length - 1) continue;

      const linkedPower = DatabaseAPI.Database.Power[bonusItemArray[index].Index[i]];
      if (!linkedPower) continue;

      const fullName = linkedPower.FullName;
      if (!ret.has(fullName)) {
        ret.set(fullName, []);
      }
      const effects = ret.get(fullName)!;
      // Clone effects from the linked power
      if (linkedPower.Effects) {
        for (const fx of linkedPower.Effects) {
          effects.push(fx);
        }
      }
    }

    return ret;
  }

  GetEnhancementSetLinkedPowers(index: number, special: boolean): IPower[] {
    const ret: IPower[] = [];
    const bonusItemArray = special ? this.SpecialBonus : this.Bonus;
    if (index < 0 || index > bonusItemArray.length - 1) {
      return ret;
    }

    for (let i = 0; i < bonusItemArray[index].Name.length; i++) {
      if (bonusItemArray[index].Index[i] < 0) continue;
      if (bonusItemArray[index].Index[i] > DatabaseAPI.Database.Power.length - 1) continue;

      const linkedPower = DatabaseAPI.Database.Power[bonusItemArray[index].Index[i]];
      if (linkedPower) {
        // Clone the power - in C# it uses Clone(), but we'll just add the reference
        // If IPower has a Clone method, use it here
        ret.push(linkedPower);
      }
    }

    return ret;
  }

  GetLinkedPower(index: number, special: boolean): IPower | null {
    const bonusItemArray = special ? this.SpecialBonus : this.Bonus;
    if (index < 0 || index > bonusItemArray.length - 1) {
      return null;
    }

    let power: IPower | null = null;
    for (let i = 0; i < bonusItemArray[index].Name.length; i++) {
      if (bonusItemArray[index].Index[i] < 0) continue;
      if (bonusItemArray[index].Index[i] > DatabaseAPI.Database.Power.length - 1) continue;

      power = DatabaseAPI.Database.Power[bonusItemArray[index].Index[i]];
    }

    return power;
  }

  GetPetSpecialEnhancement(): IEnhancement | null {
    const lastEnh = this.Enhancements.length - 1;
    if (lastEnh < 0) return null;
    
    const setType = DatabaseAPI.GetSetTypeByIndex(this.SetType);
    if (!setType) return null;
    
    const isPetSet = setType.Name.includes("Pet");
    // GetLinkedPower takes bonus index, not enhancement index - use lastEnh as the bonus index
    const special = this.GetLinkedPower(lastEnh, true);

    if (isPetSet && special !== null) {
      if (this.Enhancements[lastEnh] >= 0 && this.Enhancements[lastEnh] < DatabaseAPI.Database.Enhancements.length) {
        return DatabaseAPI.Database.Enhancements[this.Enhancements[lastEnh]];
      }
    }
    return null;
  }

  GetEffectString(
    index: number,
    special: boolean,
    longForm: boolean = false,
    fromPopup: boolean = false,
    bonusSection: boolean = false,
    status: boolean = false,
    effectsFilter?: eEffectType[]
  ): string {
    const bonusItemArray = special ? this.SpecialBonus : this.Bonus;
    if (index < 0 || index > bonusItemArray.length - 1) {
      return '';
    }

    if (bonusItemArray[index].AltString) {
      return `+${bonusItemArray[index].AltString}`;
    }

    const effectList: string[] = [];
    for (let index1 = 0; index1 < bonusItemArray[index].Name.length; index1++) {
      if (bonusItemArray[index].Index[index1] < 0 || 
          bonusItemArray[index].Index[index1] > DatabaseAPI.Database.Power.length - 1) {
        return '';
      }
      
      const power = DatabaseAPI.Database.Power[bonusItemArray[index].Index[index1]];
      if (!power) continue;

      const returnString: { value: string } = { value: '' };
      const returnMask: { value: number[] } = { value: [] };
      power.GetEffectStringGrouped(0, returnString, returnMask, !longForm, true, false, fromPopup, true);
      
      if (returnString.value) {
        effectList.push(returnString.value);
      }

      const fxFilter = effectsFilter ?? [eEffectType.Null, eEffectType.NullBool, eEffectType.DesignerStatus];
      for (let index2 = 0; index2 < (power.Effects?.length ?? 0); index2++) {
        const effect = power.Effects![index2];
        if (fxFilter.includes(effect.EffectType)) {
          continue;
        }

        let flag = false;
        for (const m of returnMask.value) {
          if (index2 === m) {
            flag = true;
            break;
          }
        }

        if (flag) {
          continue;
        }

        const str2 = longForm
          ? effect.BuildEffectString(true, '', false, false, false, fromPopup, false, false, true)
          : effect.BuildEffectStringShort(false, true);

        if (effectList.includes(str2)) continue;

        let processedStr = str2;
        if (processedStr.includes('EndRec')) {
          processedStr = processedStr.replace('EndRec', 'Recovery');
        }

        effectList.push(processedStr);
      }
    }

    let str1 = effectList.join(', ');
    const strRef: { value: string } = { value: str1 };
    if (bonusSection && !status) {
      Utilities.ModifiedEffectString(strRef, 1);
    } else {
      Utilities.ModifiedEffectString(strRef, 2);
    }
    return strRef.value;
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeString(this.DisplayName);
    writer.writeString(this.ShortName);
    writer.writeString(this.Uid);
    writer.writeString(this.Desc);
    writer.writeInt(this.SetType);
    writer.writeString(this.Image);
    writer.writeInt(this.LevelMin);
    writer.writeInt(this.LevelMax);
    writer.writeInt(this.Enhancements.length - 1);
    for (let index = 0; index < this.Enhancements.length; index++) {
      writer.writeInt(this.Enhancements[index]);
    }
    writer.writeInt(this.Bonus.length - 1);
    for (let index1 = 0; index1 < this.Bonus.length; index1++) {
      writer.writeInt(this.Bonus[index1].Special);
      writer.writeString(this.Bonus[index1].AltString);
      writer.writeInt(this.Bonus[index1].PvMode);
      writer.writeInt(this.Bonus[index1].Slotted);
      writer.writeInt(this.Bonus[index1].Name.length - 1);
      for (let index2 = 0; index2 < this.Bonus[index1].Name.length; index2++) {
        writer.writeString(this.Bonus[index1].Name[index2]);
        writer.writeInt(this.Bonus[index1].Index[index2]);
      }
    }
    writer.writeInt(this.SpecialBonus.length - 1);
    for (let index1 = 0; index1 < this.SpecialBonus.length; index1++) {
      writer.writeInt(this.SpecialBonus[index1].Special);
      writer.writeString(this.SpecialBonus[index1].AltString);
      writer.writeInt(this.SpecialBonus[index1].Name.length - 1);
      for (let index2 = 0; index2 < this.SpecialBonus[index1].Name.length; index2++) {
        writer.writeString(this.SpecialBonus[index1].Name[index2]);
        writer.writeInt(this.SpecialBonus[index1].Index[index2]);
      }
    }
  }
}

