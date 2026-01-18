// Converted from C# Build.cs
import type { Character } from './Base/Data_Classes/Character';
import type { IPower } from './IPower';
import { PowerEntry } from './PowerEntry';
import type { LevelMap } from './LevelMap';
import type { EnhancementSet } from './EnhancementSet';
import { DatabaseAPI } from './DatabaseAPI';
import { SlotEntry } from './SlotEntry';
import { PowerSubEntry } from './PowerSubEntry';
import { eEnhGrade, eEnhRelative, eType, ePowerSetType, ePvX, eEnhMutex, eMutex, eEffectType, eMez, eDamage, eEntity, eFXGroup, eFXSubGroup, dmModes, eGridType, ePowerType } from './Enums';
import type { IPowerset } from './IPowerset';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { Power } from './Base/Data_Classes/Power';
import type { IEffect } from './IEffect';
import { Enhancement } from './Enhancement';
import { HistoryMap } from './Schema';
import { I9SetData } from './I9SetData';
import { I9Slot } from './I9Slot';
import type { IEnhancement } from './IEnhancement';

export class Build {
  private readonly _character: Character;
  readonly Powers: PowerEntry[] = [];
  readonly SetBonuses: I9SetData[] = [];
  private _setBonusVirtualPower: IPower | null = null;
  private _isInitializingSetBonusPowers: boolean = false;
  LastPower: number = 0;
  MySet: EnhancementSet | null = null;

  constructor(owner: Character, iLevels: LevelMap[]) {
    this._character = owner;
    this.Powers = [new PowerEntry(undefined, 0, true)];
    this.SetBonuses = [];
    this.LastPower = 0;

    for (let iLevel = 0; iLevel < iLevels.length; iLevel++) {
      for (let index = 0; index < iLevels[iLevel].Powers; index++) {
        this.Powers.push(new PowerEntry(undefined, iLevel, true));
        this.LastPower++;
      }
    }
  }

  get SetBonusVirtualPower(): IPower | null {
    if (this._setBonusVirtualPower === null) {
      this._setBonusVirtualPower = this.GetSetBonusVirtualPower();
    }
    return this._setBonusVirtualPower;
  }

  get PowersPlaced(): number {
    let pplaced = 0;
    for (const power of this.Powers) {
      if (power && power.Chosen && power.Power !== null) {
        pplaced++;
      }
    }
    return pplaced;
  }

  get SlotsPlaced(): number {
    let placed = 0;
    for (const power of this.Powers) {
      if (power && power.Slots.length > 1) {
        placed += power.Slots.length - 1;
      }
    }
    return placed;
  }

  static get TotalSlotsAvailable(): number {
    return DatabaseAPI.ServerData.EnableInherentSlotting
      ? DatabaseAPI.ServerData.MaxSlots +
          DatabaseAPI.ServerData.HealthSlots +
          DatabaseAPI.ServerData.StaminaSlots
      : DatabaseAPI.ServerData.MaxSlots;
  }

  AddPower(power: IPower | null, specialLevel: number = -1): PowerEntry {
    let powerEntry = this.GetPowerEntry(power);
    if (powerEntry === null) {
      powerEntry = new PowerEntry(power ?? undefined, specialLevel);
      this.Powers.push(powerEntry);
    }

    powerEntry.ValidateSlots();
    return powerEntry;
  }

  RemovePower(powerToRemove: IPower): void {
    for (const powerEntry of this.Powers) {
      if (
        powerEntry?.Power?.PowerIndex === powerToRemove.PowerIndex
      ) {
        powerEntry.Reset();
        break;
      }
    }
  }

  private GetPowerEntry(power: IPower | null): PowerEntry | null {
    return (
      this.Powers.find(
        powerEntry =>
          power !== null &&
          powerEntry !== null &&
          powerEntry.Power !== null &&
          powerEntry.Power.PowerIndex === power.PowerIndex
      ) ?? null
    );
  }

  private GetSetBonusVirtualPower(): IPower | null {
    const power1 = new Power();
    if (MidsContext.Config.I9.IgnoreSetBonusFX) {
      return power1;
    }

    const nidPowers = DatabaseAPI.NidPowersFromUid("set_bonus", "");
    // Initialize setCount with 0's
    const setCount = new Array(nidPowers.length).fill(0);

    const effectList: IEffect[] = [];

    for (const setBonus of this.SetBonuses) {
      for (const setInfo of setBonus.SetInfo) {
        for (const power of setInfo.Powers) {
          if (power <= -1) continue;
          if (power >= setCount.length) {
            throw new Error("Power index exceeds setCount bounds.");
          }

          ++setCount[power];

          const powerInfo = DatabaseAPI.Database.Power[power];
          if (powerInfo != null && this.ShouldSkipEffects(powerInfo)) {
            continue;
          }

          if (setCount[power] < 6) {
            if (powerInfo != null) {
              for (const effect of powerInfo.Effects) {
                effectList.push(effect.Clone());
              }
            }
          }
        }
      }
    }

    power1.Effects = effectList;
    return power1;
  }

  private ShouldSkipEffects(power: IPower): boolean {
    // Check if Target and EntitiesAffected both have MyPet flag
    // In TypeScript, we use bitwise AND to check flags
    const myPet = eEntity.MyPet;
    return (power.Target & myPet) !== 0 && (power.EntitiesAffected & myPet) !== 0;
  }

  GetCumulativeSetBonuses(): IEffect[] {
    const bonusVirtualPower = this.SetBonusVirtualPower;
    const fxList: IEffect[] = [];
    if (bonusVirtualPower == null) return fxList;
    for (const effIdx of bonusVirtualPower.Effects) {
      if (effIdx.EffectType === eEffectType.None && (!effIdx.Special || effIdx.Special.length === 0)) {
        continue;
      }

      const index2 = this.FindMatchingEffectIndex(fxList, effIdx);
      if (index2 < 0) {
        const fx = effIdx.Clone();
        fx.Math_Mag = effIdx.Mag;
        fxList.push(fx);
      } else {
        fxList[index2].Math_Mag += effIdx.Mag;
      }
    }

    return fxList;
  }

  private FindMatchingEffectIndex(fxList: IEffect[], testFx: IEffect): number {
    for (let idx = 0; idx < fxList.length; idx++) {
      const effect = fxList[idx];
      if ((this.IsEffectMatch(effect, testFx) && this.IsSpecialMatch(effect, testFx)) ||
        this.IsFallbackMatch(effect, testFx)) {
        return idx;
      }
    }
    return -1;
  }

  private IsEffectMatch(effect: IEffect, testFx: IEffect): boolean {
    const isSameType = effect.EffectType === testFx.EffectType;
    const hasValidMagnitude = (effect.Mag > 0) === (testFx.Mag > 0) || (effect.Mag < 0) === (testFx.Mag < 0);
    const isWithinThreshold = Math.abs(effect.Mag - (testFx.Mag > 0 ? 1 : 0)) < 0.001;

    return isSameType && (hasValidMagnitude || isWithinThreshold);
  }

  private IsSpecialMatch(effect: IEffect, testFx: IEffect): boolean {
    switch (effect.EffectType) {
      case eEffectType.Mez:
      case eEffectType.MezResist:
        return effect.MezType === testFx.MezType;
      case eEffectType.Damage:
      case eEffectType.Defense:
      case eEffectType.Resistance:
      case eEffectType.DamageBuff:
        return effect.DamageType === testFx.DamageType;
      case eEffectType.Enhancement:
        return effect.ETModifies === testFx.ETModifies &&
          effect.DamageType === testFx.DamageType &&
          effect.MezType === testFx.MezType;
      case eEffectType.ResEffect:
        return effect.ETModifies === testFx.ETModifies;
      case eEffectType.None:
        return testFx.Special === effect.Special &&
          testFx.Special?.toUpperCase().includes("DEBT") === true;
      default:
        return false;
    }
  }

  private IsFallbackMatch(effect: IEffect, testFx: IEffect): boolean {
    if (effect.EffectType !== testFx.EffectType) return false;
    const excludedTypes = [
      eEffectType.Mez,
      eEffectType.MezResist,
      eEffectType.Damage,
      eEffectType.Defense,
      eEffectType.Resistance,
      eEffectType.DamageBuff,
      eEffectType.Enhancement,
      eEffectType.ResEffect
    ];
    return !excludedTypes.includes(testFx.EffectType);
  }

  GetMaxLevel(): number {
    let maxLevel = 0;
    for (const power of this.Powers) {
      if (power) {
        if (power.Level > maxLevel) {
          maxLevel = power.Level;
        }
        // Also check slot levels
        for (const slot of power.Slots) {
          if (slot.Level > maxLevel) {
            maxLevel = slot.Level;
          }
        }
      }
    }
    return maxLevel;
  }

  PowerUsed(power: IPower | null): boolean {
    if (power === null) {
      return false;
    }
    return this.FindInToonHistory(power.PowerIndex) > -1;
  }


  PowerActive(power: IPower): boolean {
    for (const powerEntry of this.Powers) {
      if (powerEntry && powerEntry.Power && powerEntry.Power.PowerIndex === power.PowerIndex) {
        return powerEntry.StatInclude;
      }
    }
    return false;
  }

  private FillMissingSubPowers(): void {
    for (const power of this.Powers) {
      if (power == null || power.Power == null || power.Power.NIDSubPower.length <= 0) {
        continue;
      }
      if (power.SubPowers.length !== power.Power.NIDSubPower.length) {
        power.SubPowers = new Array(power.Power.NIDSubPower.length);
        for (let i = 0; i < power.SubPowers.length; i++) {
          power.SubPowers[i] = new PowerSubEntry();
        }
      }
      for (let index = 0; index <= power.Power.NIDSubPower.length - 1; ++index) {
        if (power.SubPowers[index]?.nIDPower === power.Power.NIDSubPower[index]) {
          continue;
        }
        power.SubPowers[index] = new PowerSubEntry();
        power.SubPowers[index].nIDPower = power.Power.NIDSubPower[index];
        if (power.Power.NIDSubPower[index] > -1) {
          power.SubPowers[index].Powerset =
            DatabaseAPI.Database.Power[power.Power.NIDSubPower[index]].PowerSetID;
          power.SubPowers[index].Power =
            DatabaseAPI.Database.Power[power.Power.NIDSubPower[index]].PowerSetIndex;
        } else {
          power.SubPowers[index].Powerset = -1;
          power.SubPowers[index].Power = -1;
        }
      }
    }
  }

  private ValidateEnhancements(): void {
    for (const power of this.Powers) {
      if (power == null) continue;
      for (const slot of power.Slots) {
        if (slot.Enhancement.Enh > -1) {
          const enhancement = DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh];
          if (enhancement.TypeID === eType.Normal &&
            ((slot.Enhancement.Grade <= eEnhGrade.None) ||
              (slot.Enhancement.Grade > eEnhGrade.SingleO))) {
            slot.Enhancement.Grade = eEnhGrade.SingleO;
          }
          if ((enhancement.TypeID === eType.Normal || enhancement.TypeID === eType.SpecialO) &&
            ((slot.Enhancement.RelativeLevel < eEnhRelative.None) ||
              (slot.Enhancement.RelativeLevel > eEnhRelative.PlusFive))) {
            slot.Enhancement.RelativeLevel = MidsContext.Config.CalcEnhLevel;
          }
        }

        if (slot.FlippedEnhancement.Enh <= -1) {
          continue;
        }
        const flippedEnh = DatabaseAPI.Database.Enhancements[slot.FlippedEnhancement.Enh];
        if (flippedEnh.TypeID === eType.Normal &&
          ((slot.FlippedEnhancement.Grade <= eEnhGrade.None) ||
            (slot.FlippedEnhancement.Grade > eEnhGrade.SingleO))) {
          slot.FlippedEnhancement.Grade = eEnhGrade.SingleO;
        }
        if ((flippedEnh.TypeID === eType.Normal || flippedEnh.TypeID === eType.SpecialO) &&
          ((slot.FlippedEnhancement.RelativeLevel < eEnhRelative.None) ||
            (slot.FlippedEnhancement.RelativeLevel > eEnhRelative.PlusFive))) {
          slot.FlippedEnhancement.RelativeLevel = MidsContext.Config.CalcEnhLevel;
        }
      }
    }
  }

  SlotsPlacedAtLevel(level: number): number {
    let slotsPlacedAtLevel = 0;
    for (const powerIdx of this.Powers) {
      if (powerIdx == null) continue;
      for (let slotIdx = 0; slotIdx < powerIdx.Slots.length; ++slotIdx) {
        if (powerIdx.Slots[slotIdx].Level === level) {
          ++slotsPlacedAtLevel;
        }
      }
    }
    return slotsPlacedAtLevel;
  }

  private ClearInvisibleSlots(): void {
    for (const power of this.Powers) {
      power?.ClearInvisibleSlots();
    }
  }

  private CheckAndFixAllEnhancements(): void {
    for (const power of this.Powers) {
      if (power == null) continue;
      for (const slot of power.Slots) {
        if (power.Power != null) {
          if (slot.Enhancement.Enh > -1) {
            if (!power.Power.IsEnhancementValid(slot.Enhancement.Enh)) {
              slot.Enhancement.Enh = -1;
            } else {
              const enhancement = DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh];
              slot.Enhancement.IOLevel = enhancement.CheckAndFixIOLevel(slot.Enhancement.IOLevel);
            }
          }

          if (slot.FlippedEnhancement.Enh <= -1) {
            continue;
          }

          if (!power.Power.IsEnhancementValid(slot.FlippedEnhancement.Enh)) {
            slot.FlippedEnhancement.Enh = -1;
          } else {
            const enhancement = DatabaseAPI.Database.Enhancements[slot.FlippedEnhancement.Enh];
            slot.FlippedEnhancement.IOLevel = enhancement.CheckAndFixIOLevel(slot.FlippedEnhancement.IOLevel);
          }
        } else {
          slot.Enhancement.Enh = -1;
          slot.Enhancement.IOLevel = 0;
          slot.FlippedEnhancement.Enh = -1;
          slot.FlippedEnhancement.IOLevel = 0;
        }
      }
    }

    this.ValidateEnhancements();
  }

  private CheckAllVariableBounds(): void {
    for (let index = 0; index <= this.Powers.length - 1; ++index) {
      this.Powers[index]?.CheckVariableBounds();
    }
  }

  private ScanAndCleanAutomaticallyGrantedPowers(): void {
    let flag = false;
    const maxLevel = this.GetMaxLevel();
    for (const power of this.Powers) {
      if (power?.Power == null) {
        continue;
      }

      if (power.Chosen || 
        (power.PowerSet?.SetType !== ePowerSetType.Inherent && 
         power.PowerSet?.SetType !== ePowerSetType.Primary && 
         power.PowerSet?.SetType !== ePowerSetType.Secondary && 
         power.PowerSet?.SetType !== ePowerSetType.Pool)) {
        continue;
      }

      if (power.Power.Level > maxLevel + 1 || 
        !this.MeetsRequirement(power.Power, maxLevel) || 
        !power.Power.IncludeFlag) {
        power.Tag = true;
        flag = true;
      }

      if (power.Power.Level > power.Level + 1) {
        power.Level = power.Power.Level - 1;
      }
    }

    if (!flag) {
      return;
    }

    for (let powerIdx = 0; powerIdx < this.Powers.length; powerIdx++) {
      if (this.Powers[powerIdx] == null) {
        continue;
      }

      if (this.Powers[powerIdx]!.Tag) {
        this.Powers[powerIdx]!.Reset();
        if (this.Powers[powerIdx]!.Chosen) {
          continue;
        }

        this.Powers[powerIdx]!.Level = -1;
        this.Powers[powerIdx]!.Slots = [];
      }
    }
  }

  MeetsRequirement(power: IPower | null, nLevel: number, skipIdx: number = -1): boolean {
    if (nLevel < 0 || power == null) {
      return false;
    }

    let nIdSkip = -1;
    if (skipIdx > -1 && skipIdx < this.Powers.length) {
      nIdSkip = this.Powers[skipIdx]?.Power == null ? -1 : this.Powers[skipIdx]!.Power!.PowerIndex;
    }

    if (nLevel + 1 < power.Level) {
      return false;
    }

    if (power.Requires.NClassName.length === 0 && 
        power.Requires.NClassNameNot.length === 0 && 
        power.Requires.NPowerID.length === 0 && 
        power.Requires.NPowerIDNot.length === 0) {
      return true;
    }

    let valid = power.Requires.NClassName.length === 0;

    for (const clsNameIdx of power.Requires.NClassName) {
      if (this._character.Archetype?.Idx === clsNameIdx) {
        valid = true;
      }
    }

    if (power.Requires.NClassNameNot.some(nClsNameNot => this._character.Archetype?.Idx === nClsNameNot)) {
      return false;
    }

    if (!valid) {
      return false;
    }

    if (power.Requires.NPowerID.length > 0) {
      valid = false;
    }

    for (const numArray of power.Requires.NPowerID) {
      let doubleValid = true;
      let powerIndex = -1;
      for (const nIdPower of numArray) {
        if (nIdPower <= -1) continue;
        if (nIdPower !== nIdSkip) {
          powerIndex = this.FindInToonHistory(nIdPower);
        }

        if (powerIndex < 0 || (this.Powers[powerIndex]?.Level ?? -1) > nLevel) {
          doubleValid = false;
        }
      }

      if (!doubleValid) {
        continue;
      }

      valid = true;
      break;
    }

    if (!valid) {
      return false;
    }

    for (const numArray of power.Requires.NPowerIDNot) {
      for (const nIdPower of numArray) {
        if (nIdPower <= -1) {
          continue;
        }

        let histIdx = -1;
        if (nIdPower !== nIdSkip) {
          histIdx = this.FindInToonHistory(nIdPower);
        }

        if (histIdx > -1) {
          return false;
        }
      }
    }

    return true;
  }

  FindInToonHistory(nIDPower: number): number {
    for (let powerIdx = 0; powerIdx < this.Powers.length; powerIdx++) {
      if (this.Powers[powerIdx]?.Power != null && 
          this.Powers[powerIdx]!.Power!.PowerIndex === nIDPower) {
        return powerIdx;
      }
    }
    return -1;
  }

  private AddAutomaticGrantedPowers(): void {
    const maxLevel = this.GetMaxLevel();
    const powersetList: (IPowerset | null)[] = [];
    if (this._character.Powersets) {
      powersetList.push(...this._character.Powersets);
    }
    for (const powerset of DatabaseAPI.Database.Powersets) {
      if (powerset.SetType === ePowerSetType.Inherent && !powersetList.includes(powerset)) {
        powersetList.push(powerset);
      }
    }

    for (const powerset of powersetList) {
      if (powerset == null) {
        continue;
      }

      for (const power of powerset.Powers) {
        if (power == null) continue;
        let val2 = 0;
        if (!power.IncludeFlag || 
            power.Level > maxLevel + 1 || 
            this.PowerUsed(power) || 
            !this.MeetsRequirement(power, maxLevel + 1) || 
            power.InherentType === eGridType.Prestige) {
          continue;
        }

        if (power.Requires.NPowerID.length > 0) {
          const inToonHistory = this.FindInToonHistory(power.Requires.NPowerID[0][0]);
          if (inToonHistory > -1) {
            val2 = this.Powers[inToonHistory]?.Level ?? 0;
          }
        }

        this.AddPower(power, Math.max(power.Level - 1, val2));
      }
    }
  }

  Validate(): void {
    this.ClearInvisibleSlots();
    this.ScanAndCleanAutomaticallyGrantedPowers();
    this.AddAutomaticGrantedPowers();
    this.FillMissingSubPowers();
    this.CheckAndFixAllEnhancements();
    this.CheckAllVariableBounds();
    if (DatabaseAPI.ServerData.EnableInherentSlotting) {
      this.CheckInherentSlotting();
    }
  }

  SetEnhGrades(newVal: eEnhGrade): boolean {
    const str = newVal === eEnhGrade.TrainingO ? "Training" :
                newVal === eEnhGrade.DualO ? "Dual" :
                newVal === eEnhGrade.SingleO ? "Single" : "";

    // Note: In C# this shows a MessageBox, here we'll use console.warn
    console.warn(
      `Really set all placed Regular enhancements to ${str} Origin?\r\n\r\nThis will not affect any Invention or Special enhancements.`
    );
    // For now, we'll return true. In a real UI, this would be a user confirmation.
    // const confirmed = confirm(...);
    // if (!confirmed) return false;

    for (const power of this.Powers) {
      if (power == null) continue;
      for (const slot of power.Slots) {
        if (slot.Enhancement.Enh > -1 &&
          DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh].TypeID === eType.Normal) {
          slot.Enhancement.Grade = newVal;
        }
      }
    }

    return true;
  }

  SetIOLevels(newVal: number, iSetMin: boolean, iSetMax: boolean): boolean {
    let text = "Really set all placed Invention and Set enhancements to ";
    if (!iSetMin && !iSetMax) {
      text += `level ${newVal + 1}?\r\n\r\nNote: Enhancements which are not available at the default level will be set to the closest one.`;
    } else if (iSetMin) {
      newVal = 0;
      text += "their minimum possible level?";
    } else {
      newVal = 52;
      text += "their maximum possible level?";
    }

    // Note: In C# this shows a MessageBox, here we'll use console.warn
    console.warn(text);
    // For now, we'll return true. In a real UI, this would be a user confirmation.

    for (const power of this.Powers) {
      if (power == null) continue;
      for (const slot of power.Slots) {
        if (slot.Enhancement.Enh <= -1) {
          continue;
        }
        const enhancement = DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh];
        switch (enhancement.TypeID) {
          case eType.InventO:
            const levelMin1 = enhancement.LevelMin;
            const levelMax = enhancement.LevelMax;
            if ((newVal >= levelMin1) && (newVal <= levelMax)) {
              slot.Enhancement.IOLevel = Enhancement.GranularLevelZb(newVal, levelMin1, levelMax);
              break;
            }

            if (newVal > levelMax) {
              slot.Enhancement.IOLevel = Enhancement.GranularLevelZb(levelMax, levelMin1, levelMax);
              break;
            }

            if (newVal < levelMin1) {
              slot.Enhancement.IOLevel = Enhancement.GranularLevelZb(levelMin1, levelMin1, levelMax);
            }
            break;
          case eType.SetO:
            const levelMin2 = DatabaseAPI.Database
              .EnhancementSets[enhancement.nIDSet].LevelMin;
            let num = DatabaseAPI.Database
              .EnhancementSets[enhancement.nIDSet].LevelMax;
            if (num > 49) {
              num = 49;
            }
            if ((newVal >= levelMin2) && (newVal <= num)) {
              slot.Enhancement.IOLevel = newVal;
              break;
            }

            if (newVal > num) {
              slot.Enhancement.IOLevel = num;
              break;
            }

            if (newVal < levelMin2) {
              slot.Enhancement.IOLevel = levelMin2;
            }
            break;
        }
      }
    }

    return true;
  }

  SetEnhRelativeLevels(newVal: eEnhRelative): boolean {
    const display = newVal === eEnhRelative.None ? "None (Enhancements will have no effect)" :
                    newVal === eEnhRelative.MinusThree ? "-3" :
                    newVal === eEnhRelative.MinusTwo ? "-2" :
                    newVal === eEnhRelative.MinusOne ? "-1" :
                    newVal === eEnhRelative.Even ? "Even (+/- 0)" :
                    newVal === eEnhRelative.PlusOne ? "+1" :
                    newVal === eEnhRelative.PlusTwo ? "+2" :
                    newVal === eEnhRelative.PlusThree ? "+3" :
                    newVal === eEnhRelative.PlusFour ? "+4" :
                    newVal === eEnhRelative.PlusFive ? "+5" : "";

    // Note: In C# this shows a MessageBox, here we'll use console.warn
    console.warn(
      `Really set all placed enhancements to a relative level of ${display}?\r\n\r\nNote: Normal and special enhancements cannot go above +3,\r\nInventions cannot go below +0.`
    );
    // For now, we'll return true. In a real UI, this would be a user confirmation.

    for (const power of this.Powers) {
      if (power == null) {
        continue;
      }

      for (const slot of power.Slots) {
        if (slot.Enhancement.Enh <= -1) {
          continue;
        }

        const enhancement = DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh];
        let relVal: eEnhRelative;
        switch (enhancement.TypeID) {
          case eType.SpecialO:
            relVal = newVal > eEnhRelative.PlusThree ? eEnhRelative.PlusThree : newVal;
            break;
          case eType.Normal:
            relVal = newVal > eEnhRelative.PlusThree ? eEnhRelative.PlusThree : newVal;
            break;
          case eType.InventO:
            relVal = (newVal < eEnhRelative.Even && newVal !== eEnhRelative.None) 
              ? eEnhRelative.Even : newVal;
            break;
          case eType.SetO:
            relVal = (newVal < eEnhRelative.Even && newVal !== eEnhRelative.None) 
              ? eEnhRelative.Even : newVal;
            break;
          default:
            relVal = newVal;
            break;
        }

        slot.Enhancement.RelativeLevel = relVal;
      }
    }

    return true;
  }

  BuildHistoryMap(enhNames: boolean, ioLevel: boolean = true): HistoryMap[] {
    const historyMapList: HistoryMap[] = [];
    for (let lvlIdx = 0; lvlIdx < DatabaseAPI.Database.Levels.length; lvlIdx++) {
      for (let powerIdx = 0; powerIdx < this.Powers.length; powerIdx++) {
        const power = this.Powers[powerIdx];
        if (power == null) continue;
        if ((!power.Chosen && power.SubPowers.length !== 0 && power.SlotCount !== 0) ||
          power.Level !== lvlIdx ||
          power.Power == null) {
          continue;
        }

        const historyMap = new HistoryMap();
        historyMap.Level = lvlIdx;
        historyMap.HID = powerIdx;

        let appendText = '';
        const choiceText = power.Chosen ? "Added" : "Received";
        if (power.Slots.length > 0) {
          historyMap.SID = 0;
          if (power.Slots[0].Enhancement.Enh > -1) {
            if (enhNames) {
              appendText = ` [${DatabaseAPI.GetEnhancementNameShortWSet(power.Slots[0].Enhancement.Enh)}`;
            }

            if (ioLevel && 
              (DatabaseAPI.Database.Enhancements[power.Slots[0].Enhancement.Enh].TypeID === eType.InventO ||
               DatabaseAPI.Database.Enhancements[power.Slots[0].Enhancement.Enh].TypeID === eType.SetO)) {
              appendText = `${appendText}-${power.Slots[0].Enhancement.IOLevel + 1}`;
            }

            appendText += "]";
          } else if (enhNames) {
            appendText = " [Empty]";
          }
        }

        const powerset = DatabaseAPI.Database.Powersets[power.NIDPowerset];
        // Get enum name as string
        const setTypeName = powerset ? Object.keys(ePowerSetType).find(key => ePowerSetType[key as keyof typeof ePowerSetType] === powerset.SetType) || String(powerset.SetType) : '';
        historyMap.Text = `Level ${lvlIdx + 1}: ${choiceText} ${power.Power.DisplayName} (${setTypeName})${appendText}`;
        historyMapList.push(historyMap);
      }

      for (let powerIdx = 0; powerIdx < this.Powers.length; powerIdx++) {
        const power = this.Powers[powerIdx];
        if (power == null) continue;
        for (let slotIdx = 1; slotIdx < power.Slots.length; slotIdx++) {
          if (power.Slots[slotIdx].Level !== lvlIdx) {
            continue;
          }

          const historyMap = new HistoryMap();
          historyMap.Level = lvlIdx;
          historyMap.HID = powerIdx;
          historyMap.SID = slotIdx;

          let str = '';
          if (power.Slots[slotIdx].Enhancement.Enh > -1) {
            if (enhNames) {
              str = ` [${DatabaseAPI.GetEnhancementNameShortWSet(power.Slots[slotIdx].Enhancement.Enh)}`;
            }

            if (ioLevel &&
              (DatabaseAPI.Database.Enhancements[power.Slots[slotIdx].Enhancement.Enh].TypeID === eType.InventO ||
               DatabaseAPI.Database.Enhancements[power.Slots[slotIdx].Enhancement.Enh].TypeID === eType.SetO)) {
              str = `${str}-${power.Slots[slotIdx].Enhancement.IOLevel + 1}`;
            }

            str += "]";
          } else if (enhNames) {
            str = " [Empty]";
          }

          historyMap.Text = `Level ${lvlIdx + 1}: Added Slot to ${power.Power?.DisplayName ?? '[Empty]'}${str}`;
          historyMapList.push(historyMap);
        }
      }
    }

    return historyMapList;
  }

  GetRespecHelper2(longFormat: boolean, iLevel: number = 49): any {
    // Note: In C# this returns PopUp.PopupData which is a UI class
    // For TypeScript, we'll return a simplified structure
    const popupData: any = {
      Sections: [] as any[]
    };
    const historyMapArray = this.BuildHistoryMap(true);
    let index = this.addSection(popupData);
    popupData.Sections[index].push({
      text: `Respec to level: ${iLevel + 1}`,
      type: 'effect',
      size: 1.25
    });
    let histLvl = 0;
    for (const historyMap of historyMapArray) {
      if (histLvl !== historyMap.Level) {
        index = this.addSection(popupData);
      }

      histLvl = historyMap.Level;
      if (historyMap.HID < 0) {
        continue;
      }

      const power = this.Powers[historyMap.HID];
      if (power == null) continue;
      if ((DatabaseAPI.Database.Levels[historyMap.Level].Powers > 0) && (historyMap.Level <= iLevel)) {
        if (power.Slots.length <= 0) {
          continue;
        }

        const iText1 = power.Power != null
          ? `Level ${historyMap.Level + 1}: ${power.Power.DisplayName}`
          : `Level ${historyMap.Level + 1}: [Empty]`;
        popupData.Sections[index].push({
          text: iText1,
          type: 'text'
        });
        if (!longFormat) {
          continue;
        }

        let iText2 = "[Empty]";
        if (power.Slots[historyMap.SID]?.Enhancement.Enh > -1) {
          iText2 = DatabaseAPI.GetEnhancementNameShortWSet(power.Slots[historyMap.SID].Enhancement.Enh);
          const enh = DatabaseAPI.Database.Enhancements[power.Slots[historyMap.SID].Enhancement.Enh];
          if (enh.TypeID === eType.InventO || enh.TypeID === eType.SetO) {
            iText2 += `-${power.Slots[historyMap.SID].Enhancement.IOLevel + 1}`;
          }
        }

        popupData.Sections[index].push({
          text: iText2,
          type: 'invention',
          size: 1.0,
          style: 'regular',
          indent: 1
        });
      } else if ((DatabaseAPI.Database.Levels[historyMap.Level].Slots > 0) && (historyMap.Level <= iLevel) && historyMap.SID > -1) {
        const str = historyMap.SID !== 0
          ? `Level ${historyMap.Level + 1}: Added Slot To `
          : `Level ${historyMap.Level + 1}: Received Slot - `;
        const iText1 = power.Power == null
          ? `${str}[Empty]`
          : `${str}${power.Power.DisplayName}`;
        popupData.Sections[index].push({
          text: iText1,
          type: 'effect'
        });
        if (!longFormat) {
          continue;
        }

        let iText2 = "[Empty]";
        if (power.Slots[historyMap.SID]?.Enhancement.Enh > -1) {
          iText2 = DatabaseAPI.GetEnhancementNameShortWSet(power.Slots[historyMap.SID].Enhancement.Enh);
          const enh = DatabaseAPI.Database.Enhancements[power.Slots[historyMap.SID].Enhancement.Enh];
          if (enh.TypeID === eType.InventO || enh.TypeID === eType.SetO) {
            iText2 += `-${power.Slots[historyMap.SID].Enhancement.IOLevel + 1}`;
          }
        }

        popupData.Sections[index].push({
          text: iText2,
          type: 'invention',
          size: 1.0,
          style: 'regular',
          indent: 1
        });
      }
    }

    return popupData;
  }

  private addSection(popupData: any): number {
    const index = popupData.Sections.length;
    popupData.Sections.push([]);
    return index;
  }

  EnhancementTest(iSlotID: number, powerEntryId: string, iEnh: number, silent: boolean = false): boolean {
    if (iEnh < 0 || iSlotID < 0) return false;

    const enhancement = DatabaseAPI.Database.Enhancements[iEnh];
    let foundMutex = false;
    let foundInPower = false;
    let foundEnh = '';
    let mutexType = -1;
    const powerEntry = this.Powers.find(p => p?.id === powerEntryId);
    if (enhancement.TypeID === eType.SetO && enhancement.nIDSet > -1 && powerEntry?.Power != null) {
      const setType = DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet].SetType;
      const power = powerEntry.Power;
      const allowedSet = power.SetTypes?.some(t => t === setType) ?? false;

      if (!allowedSet) {
        return false;
      }
    }

    for (let powerIdx = 0; powerIdx < this.Powers.length; powerIdx++) {
      if (this.Powers[powerIdx] == null) {
        continue;
      }

      const power = this.Powers[powerIdx]!;
      for (let slotIndex = 0; slotIndex < power.Slots.length; slotIndex++) {
        if ((slotIndex === iSlotID && power.id === powerEntryId) || power.Slots[slotIndex].Enhancement.Enh <= -1) {
          continue;
        }

        if (enhancement.Unique && power.Slots[slotIndex].Enhancement.Enh === iEnh) {
          if (!silent) {
            console.warn(`${enhancement.LongName} is a unique enhancement. You can only slot one of these across your entire build.`);
          }
          return false;
        }

        if (enhancement.Superior && enhancement.MutExID !== eEnhMutex.None) {
          const nVersion = enhancement.UID.replace(/(Attuned_|Superior_)/g, '');
          if (this._character.PEnhancementsList) {
            for (const item of this._character.PEnhancementsList) {
              if (!item.includes(nVersion)) {
                continue;
              }

              foundEnh = DatabaseAPI.Database.Enhancements[DatabaseAPI.GetEnhancementByUIDName(item)].LongName;
              mutexType = 0;
              foundMutex = true;
            }
          }
        } else if (!enhancement.Superior && enhancement.MutExID !== eEnhMutex.None && enhancement.MutExID !== eEnhMutex.Stealth) {
          const nVersion = enhancement.UID.replace(/(Attuned_|Superior_)/g, '');
          if (this._character.PEnhancementsList) {
            for (const item of this._character.PEnhancementsList) {
              if (item.includes(`Superior_Attuned_${nVersion}`) || item.includes(`Superior_Attuned_Superior_${nVersion}`)) {
                foundEnh = DatabaseAPI.Database.Enhancements[DatabaseAPI.GetEnhancementByUIDName(item)].LongName;
                mutexType = 0;
                foundMutex = true;
              }
            }
          }
        } else if (enhancement.MutExID === eEnhMutex.Stealth) {
          if (this._character.PEnhancementsList) {
            for (const item of this._character.PEnhancementsList) {
              const itemEnh = DatabaseAPI.Database.Enhancements[DatabaseAPI.GetEnhancementByUIDName(item)];
              if (itemEnh.MutExID === eEnhMutex.Stealth) {
                foundEnh = itemEnh.LongName;
                mutexType = 1;
                foundMutex = true;
              }
            }
          }
        }

        if (enhancement.nIDSet <= -1 || power.id !== powerEntryId || power.Slots[slotIndex].Enhancement.Enh !== iEnh) continue;
        foundInPower = true;
        break;
      }
    }

    if (foundMutex) {
      if (!silent) {
        switch (mutexType) {
          case 0:
            console.warn(`${enhancement.LongName} is mutually exclusive with ${foundEnh}. You can only slot one type of this enhancement across your entire build.`);
            break;
          case 1:
            console.warn(`${enhancement.LongName} is mutually exclusive with ${foundEnh}. You can only slot one stealth proc across your entire build.`);
            break;
        }
      }
      return false;
    }
    if (!foundInPower) {
      return true;
    }

    if (!silent) {
      console.warn(`${enhancement.LongName} is already slotted in this power. You can only slot one of each enhancement from the set in a given power.`);
    }
    return false;
  }

  GenerateSetBonusData(): void {
    this.SetBonuses.length = 0; // Clear array
    for (let index1 = 0; index1 < this.Powers.length; ++index1) {
      const i9SetData = new I9SetData();
      i9SetData.PowerIndex = index1;
      if (this.Powers[index1] != null && this.Powers[index1]!.Level <= MidsContext.Config.ForceLevel) {
        for (let index2 = 0; index2 < this.Powers[index1]!.SlotCount; ++index2) {
          i9SetData.Add(this.Powers[index1]!.Slots[index2].Enhancement);
        }
      }

      i9SetData.BuildEffects(!MidsContext.Config.Inc.DisablePvE ? ePvX.PvE : ePvX.PvP);
      if (!i9SetData.Empty) {
        this.SetBonuses.push(i9SetData);
      }
    }

    this._setBonusVirtualPower = null;
  }

  private CheckInherentSlotting(): void {
    for (const power of this.Powers) {
      if (power?.Power == null) continue;

      switch (power.Power.FullName) {
        case "Inherent.Fitness.Health":
          switch (MidsContext.Config.BuildMode) {
            case dmModes.LevelUp:
              if (this._character.Level === DatabaseAPI.ServerData.HealthSlot1Level) {
                if (power.InherentSlotsUsed < 1) {
                  power.AddSlot(DatabaseAPI.ServerData.HealthSlot1Level, true);
                  power.InherentSlotsUsed += 1;
                }
              }

              if (this._character.Level === DatabaseAPI.ServerData.HealthSlot2Level) {
                if (power.InherentSlotsUsed > 0 && power.InherentSlotsUsed < 2) {
                  power.AddSlot(DatabaseAPI.ServerData.HealthSlot2Level, true);
                  power.InherentSlotsUsed += 1;
                }
              }
              break;
            case dmModes.Normal:
              const chosenCount = this.Powers.filter(x => 
                x != null && x.Power != null && x.Chosen
              ).length;
              if (chosenCount > 0) {
                if (power.SlotCount < 2 && power.InherentSlotsUsed < 2) {
                  power.AddSlot(DatabaseAPI.ServerData.HealthSlot1Level, true);
                  power.AddSlot(DatabaseAPI.ServerData.HealthSlot2Level, true);
                  power.InherentSlotsUsed = 2;
                }
              }
              break;
          }
          break;
        case "Inherent.Fitness.Stamina":
          switch (MidsContext.Config.BuildMode) {
            case dmModes.LevelUp:
              if (this._character.Level === DatabaseAPI.ServerData.StaminaSlot1Level) {
                if (power.InherentSlotsUsed < 1) {
                  power.AddSlot(DatabaseAPI.ServerData.StaminaSlot1Level, true);
                  power.InherentSlotsUsed += 1;
                }
              }

              if (this._character.Level === DatabaseAPI.ServerData.StaminaSlot2Level) {
                if (power.InherentSlotsUsed > 0 && power.InherentSlotsUsed < 2) {
                  power.AddSlot(DatabaseAPI.ServerData.StaminaSlot2Level, true);
                  power.InherentSlotsUsed += 1;
                }
              }
              break;
            case dmModes.Normal:
              const chosenCount2 = this.Powers.filter(x => 
                x != null && x.Power != null && x.Chosen
              ).length;
              if (chosenCount2 > 0) {
                if (power.SlotCount < 2 && power.InherentSlotsUsed < 2) {
                  power.AddSlot(DatabaseAPI.ServerData.StaminaSlot1Level, true);
                  power.AddSlot(DatabaseAPI.ServerData.StaminaSlot2Level, true);
                  power.InherentSlotsUsed = 2;
                }
              }
              break;
          }
          break;
      }
    }
  }

  MutexV2(hIdx: number, silent: boolean = false, doDetoggle: boolean = false): eMutex {
    let result: eMutex;
    if (hIdx < 0 || hIdx > this.Powers.length || this.Powers[hIdx] == null || this.Powers[hIdx]!.Power == null) {
      result = eMutex.NoGroup;
    } else {
      const power1 = this.Powers[hIdx]!.Power!;
      if (power1.MutexIgnore) {
        result = eMutex.NoGroup;
      } else {
        const powerEntryList: PowerEntry[] = [];
        let mutexAuto = false;
        let index1 = -1;
        for (let index2 = 0; index2 < DatabaseAPI.Database.MutexList.length; index2++) {
          if (DatabaseAPI.Database.MutexList[index2].toLowerCase() !== "kheldian_group") {
            continue;
          }
          index1 = index2;
          break;
        }

        const flag2 = power1.HasMutexID(index1);
        const isKheldianShapeshift = [
          "Peacebringer_Offensive.Luminous_Blast.Bright_Nova",
          "Peacebringer_Defensive.Luminous_Aura.White_Dwarf",
          "Warshade_Offensive.Umbral_Blast.Dark_Nova",
          "Warshade_Defensive.Umbral_Aura.Black_Dwarf"
        ].includes(power1.FullName);
        
        for (const power2 of this.Powers) {
          if (power2?.Power == null || power2.Power.PowerIndex === power1.PowerIndex) {
            continue;
          }

          if (!power2.StatInclude || power2.Power.MutexIgnore) continue;

          if (isKheldianShapeshift && 
              (power2.Power.FullName.startsWith("Temporary_Powers.Accolades.") ||
               power2.Power.FullName.startsWith("Incarnate."))) {
            continue;
          }

          if (flag2 || 
              ((power2.Power.PowerType !== ePowerType.Click || power2.Power.PowerName === "Light_Form") &&
               power2.Power.HasMutexID(index1))) {
            powerEntryList.push(power2);
            if (power2.Power.MutexAuto) {
              mutexAuto = true;
            }
          } else {
            for (const num1 of power1.NGroupMembership) {
              for (const num2 of power2.Power.NGroupMembership) {
                if (num1 !== num2) {
                  continue;
                }

                powerEntryList.push(power2);
                if (power2.Power.MutexAuto) {
                  mutexAuto = true;
                }
              }
            }
          }
        }

        if (power1.MutexAuto) {
          doDetoggle = true;
          silent = true;
        }

        if (doDetoggle && power1.MutexAuto) {
          for (const powerEntry of powerEntryList) {
            if (powerEntry == null) {
              continue;
            }

            powerEntry.StatInclude = false;
          }

          result = eMutex.NoConflict;
        } else {
          if (doDetoggle && mutexAuto && this.Powers[hIdx]?.StatInclude === true) {
            this.Powers[hIdx]!.StatInclude = false;
          }

          if (!silent && powerEntryList.length > 0) {
            const powerNames = powerEntryList.map(e => e.Power?.DisplayName ?? '').join(", ");
            const str1 = `${power1.DisplayName} is mutually exclusive and can't be used at the same time as the following powers:\n${powerNames}`;
            const message = (!doDetoggle || !power1.MutexAuto || !this.Powers[hIdx]!.StatInclude)
              ? `${str1}\n\nYou should turn off the powers listed before turning this one on.`
              : `${str1}\n\nThe listed powers have been turned off.`;
            console.warn(message);
          }

          result = powerEntryList.length > 0
            ? !power1.MutexAuto
              ? !mutexAuto ? eMutex.MutexFound : eMutex.DetoggleSlave
              : eMutex.DetoggleMaster
            : eMutex.NoConflict;
        }
      }
    }

    return result;
  }

  FullMutexCheck(): void {
    for (let hIdx = this.Powers.length - 1; hIdx >= 0; hIdx--) {
      this.MutexV2(hIdx, true, true);
    }
  }

  GetEffectSources(): Map<string, { key: FXIdentifierKey; data: FXSourceData[] }> {
    const ret = new Map<string, { key: FXIdentifierKey; data: FXSourceData[] }>();

    for (const s of this.SetBonuses) {
      for (let i = 0; i < s.SetInfo.length; i++) {
        if (s.SetInfo[i].Powers.length <= 0) continue;

        const enhancementSet = DatabaseAPI.Database.EnhancementSets[s.SetInfo[i].SetIDX];
        const sourcePower = DatabaseAPI.Database
          .Powersets[this.Powers[s.PowerIndex]!.NIDPowerset]
          .Powers[this.Powers[s.PowerIndex]!.IDXPower];
        const powerName = sourcePower?.DisplayName ?? '';

        for (let j = 0; j < enhancementSet.Bonus.length; j++) {
          const pvMode = enhancementSet.Bonus[j].PvMode;
          if (!((s.SetInfo[i].SlottedCount >= enhancementSet.Bonus[j].Slotted) &&
            ((pvMode === ePvX.Any) ||
              ((pvMode === ePvX.PvE) && !MidsContext.Config.Inc.DisablePvE) ||
              ((pvMode === ePvX.PvP) && MidsContext.Config.Inc.DisablePvE)))) {
            continue;
          }

          const setEffectsData = enhancementSet.GetEffectDetailedData2(j, false);
          const setLinkedPowers = enhancementSet.GetEnhancementSetLinkedPowers(j, false);

          for (const [key, effects] of setEffectsData) {
            const p = setLinkedPowers.find(pw => pw.FullName === key);
            if (!p) continue;
            for (const fx of effects) {
              const identKey = new FXIdentifierKey(
                fx.EffectType,
                fx.MezType,
                fx.DamageType,
                fx.ETModifies
              );
              const keyStr = identKey.hashCode();

              if (!ret.has(keyStr)) {
                ret.set(keyStr, { key: identKey, data: [] });
              }

              ret.get(keyStr)!.data.push(new FXSourceData(
                fx,
                fx.Mag,
                enhancementSet.DisplayName,
                powerName,
                pvMode,
                false,
                p.EntitiesAffected,
                p.EntitiesAutoHit
              ));
            }
          }
        }

        for (const si of s.SetInfo[i].EnhIndexes) {
          const specialEnhIdx = DatabaseAPI.IsSpecialEnh(si);
          if (specialEnhIdx <= -1) continue;

          const enhEffectsData = enhancementSet.GetEffectDetailedData2(specialEnhIdx, true);
          const setLinkedPowers = enhancementSet.GetEnhancementSetLinkedPowers(specialEnhIdx, true);
          for (const [key, effects] of enhEffectsData) {
            const p = setLinkedPowers.find(pw => pw.FullName === key);
            if (!p) continue;
            for (const fx of effects) {
              const identKey = new FXIdentifierKey(
                fx.EffectType,
                fx.MezType,
                fx.DamageType,
                fx.ETModifies
              );
              const keyStr = identKey.hashCode();

              if (!ret.has(keyStr)) {
                ret.set(keyStr, { key: identKey, data: [] });
              }

              const enhancement = DatabaseAPI.Database.Enhancements[si];
              ret.get(keyStr)!.data.push(new FXSourceData(
                fx,
                fx.Mag,
                enhancementSet.DisplayName,
                powerName,
                ePvX.Any,
                true,
                p.EntitiesAffected,
                p.EntitiesAutoHit,
                enhancement
              ));
            }
          }
        }
      }
    }

    // Sort each type of buff, biggest one first
    for (const [, value] of ret) {
      value.data.sort((a, b) => b.Mag - a.Mag);
    }

    // Sort groups by effect type, mez type, damage type and target effect type
    const sortedEntries = Array.from(ret.entries()).sort(([, a], [, b]) => {
      const keyA = a.key;
      const keyB = b.key;
      const aStr = `${keyA.EffectType}${String(keyA.MezType).padStart(3, '0')}${String(keyA.DamageType).padStart(3, '0')}${String(keyA.TargetEffectType).padStart(3, '0')}`;
      const bStr = `${keyB.EffectType}${String(keyB.MezType).padStart(3, '0')}${String(keyB.DamageType).padStart(3, '0')}${String(keyB.TargetEffectType).padStart(3, '0')}`;
      return aStr.localeCompare(bStr);
    });

    return new Map(sortedEntries);
  }
}

// FXIdentifierKey class
export class FXIdentifierKey {
  EffectType: eEffectType;
  MezType: eMez;
  DamageType: eDamage;
  TargetEffectType: eEffectType;

  constructor(effectType: eEffectType, mezType: eMez, damageType: eDamage, targetEffectType: eEffectType) {
    this.EffectType = effectType;
    this.MezType = mezType;
    this.DamageType = damageType;
    this.TargetEffectType = targetEffectType;
  }

  get L1Group(): eFXGroup {
    if ((this.EffectType === eEffectType.Damage ||
      this.EffectType === eEffectType.DamageBuff ||
      this.EffectType === eEffectType.Accuracy ||
      this.EffectType === eEffectType.ToHit ||
      this.EffectType === eEffectType.RechargeTime ||
      this.EffectType === eEffectType.Range ||
      (this.EffectType === eEffectType.Enhancement &&
        (this.TargetEffectType === eEffectType.RechargeTime ||
          this.TargetEffectType === eEffectType.Accuracy)))) {
      return eFXGroup.Offense;
    }

    if (this.EffectType === eEffectType.Regeneration ||
      this.EffectType === eEffectType.HitPoints ||
      this.EffectType === eEffectType.Absorb ||
      this.EffectType === eEffectType.Recovery ||
      this.EffectType === eEffectType.Endurance ||
      this.EffectType === eEffectType.EnduranceDiscount) {
      return eFXGroup.Survival;
    }

    if (this.EffectType === eEffectType.Mez ||
      this.EffectType === eEffectType.MezResist ||
      this.EffectType === eEffectType.Slow ||
      this.EffectType === eEffectType.ResEffect ||
      (this.EffectType === eEffectType.Enhancement && this.TargetEffectType === eEffectType.None && this.MezType !== eMez.None)) {
      return eFXGroup.StatusEffects;
    }

    if (this.EffectType === eEffectType.SpeedRunning ||
      this.EffectType === eEffectType.MaxRunSpeed ||
      this.EffectType === eEffectType.SpeedJumping ||
      this.EffectType === eEffectType.JumpHeight ||
      this.EffectType === eEffectType.MaxJumpSpeed ||
      this.EffectType === eEffectType.SpeedFlying ||
      this.EffectType === eEffectType.MaxFlySpeed) {
      return eFXGroup.Movement;
    }

    if (this.EffectType === eEffectType.StealthRadius ||
      this.EffectType === eEffectType.StealthRadiusPlayer ||
      this.EffectType === eEffectType.PerceptionRadius) {
      return eFXGroup.Perception;
    }

    if (this.EffectType === eEffectType.Resistance ||
      this.EffectType === eEffectType.Defense ||
      this.EffectType === eEffectType.Elusivity) {
      return eFXGroup.Defense;
    }

    return eFXGroup.Misc;
  }

  get L2Group(): eFXSubGroup {
    if (this.EffectType === eEffectType.DamageBuff) {
      return eFXSubGroup.DamageAll;
    }

    if (this.EffectType === eEffectType.MezResist &&
      (this.MezType === eMez.Sleep ||
        this.MezType === eMez.Stunned ||
        this.MezType === eMez.Held ||
        this.MezType === eMez.Immobilized ||
        this.MezType === eMez.Confused ||
        this.MezType === eMez.Terrorized)) {
      return eFXSubGroup.MezResistAll;
    }

    if (this.EffectType === eEffectType.Defense &&
      (this.DamageType === eDamage.Smashing || this.DamageType === eDamage.Lethal)) {
      return eFXSubGroup.SmashLethalDefense;
    }

    if (this.EffectType === eEffectType.Defense &&
      (this.DamageType === eDamage.Fire || this.DamageType === eDamage.Cold)) {
      return eFXSubGroup.FireColdDefense;
    }

    if (this.EffectType === eEffectType.Defense &&
      (this.DamageType === eDamage.Energy || this.DamageType === eDamage.Negative)) {
      return eFXSubGroup.EnergyNegativeDefense;
    }

    if (this.EffectType === eEffectType.Resistance &&
      (this.DamageType === eDamage.Smashing || this.DamageType === eDamage.Lethal)) {
      return eFXSubGroup.SmashLethalResistance;
    }

    if (this.EffectType === eEffectType.Resistance &&
      (this.DamageType === eDamage.Fire || this.DamageType === eDamage.Cold)) {
      return eFXSubGroup.FireColdResistance;
    }

    if (this.EffectType === eEffectType.Resistance &&
      (this.DamageType === eDamage.Energy || this.DamageType === eDamage.Negative)) {
      return eFXSubGroup.EnergyNegativeResistance;
    }

    if (this.EffectType === eEffectType.MezResist &&
      (this.TargetEffectType === eEffectType.SpeedRunning ||
        this.TargetEffectType === eEffectType.SpeedJumping ||
        this.TargetEffectType === eEffectType.SpeedFlying ||
        this.TargetEffectType === eEffectType.RechargeTime)) {
      return eFXSubGroup.SlowResistance;
    }

    if (this.EffectType === eEffectType.Enhancement && this.TargetEffectType === eEffectType.Slow) {
      return eFXSubGroup.SlowBuffs;
    }

    if (this.EffectType === eEffectType.MezResist &&
      (this.MezType === eMez.Knockback || this.MezType === eMez.Knockup)) {
      return eFXSubGroup.KnockResistance;
    }

    return eFXSubGroup.NoGroup;
  }

  L2GroupText(): string {
    switch (this.L2Group) {
      case eFXSubGroup.DamageAll:
        return "Damage(All)";
      case eFXSubGroup.MezResistAll:
        return "MezResist(All)";
      case eFXSubGroup.SmashLethalDefense:
        return "S/L Defense";
      case eFXSubGroup.FireColdDefense:
        return "Fire/Cold Defense";
      case eFXSubGroup.EnergyNegativeDefense:
        return "Energy/Negative Defense";
      case eFXSubGroup.SmashLethalResistance:
        return "S/L Resistance";
      case eFXSubGroup.FireColdResistance:
        return "Fire/Cold Resistance";
      case eFXSubGroup.EnergyNegativeResistance:
        return "Energy/Negative Resistance";
      case eFXSubGroup.SlowResistance:
        return "Slow Resistance";
      case eFXSubGroup.SlowBuffs:
        return "Slows";
      case eFXSubGroup.KnockProtection:
        return "Knock Protection";
      case eFXSubGroup.KnockResistance:
        return "Knock Resistance";
      case eFXSubGroup.Jump:
        return "Jump";
      default:
        return "No group";
    }
  }

  equals(other: FXIdentifierKey): boolean {
    return this.EffectType === other.EffectType &&
      this.MezType === other.MezType &&
      this.DamageType === other.DamageType &&
      this.TargetEffectType === other.TargetEffectType;
  }

  hashCode(): string {
    // Use string representation for Map key comparison
    return `${this.EffectType}_${this.MezType}_${this.DamageType}_${this.TargetEffectType}`;
  }
}

// FXSourceData class
export class FXSourceData {
  private _fx: IEffect;
  Mag: number;
  EnhSet: string;
  Power: string;
  PvMode: ePvX;
  IsFromEnh: boolean;
  AffectedEntity: eEntity;
  EntitiesAutoHit: eEntity;
  Enhancement?: IEnhancement;

  get Fx(): IEffect {
    return this._fx;
  }

  set Fx(value: IEffect) {
    this._fx = value.Clone();
  }

  constructor(
    fx: IEffect,
    mag: number,
    enhSet: string,
    power: string,
    pvMode: ePvX,
    isFromEnh: boolean,
    affectedEntity: eEntity,
    entitiesAutoHit: eEntity,
    enhancement?: IEnhancement
  ) {
    this._fx = fx.Clone();
    this.Mag = mag;
    this.EnhSet = enhSet;
    this.Power = power;
    this.PvMode = pvMode;
    this.IsFromEnh = isFromEnh;
    this.AffectedEntity = affectedEntity;
    this.EntitiesAutoHit = entitiesAutoHit;
    this.Enhancement = enhancement;
  }
}

