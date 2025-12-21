// Converted from C# Toon.cs (clsToonX)
import { Character } from './Base/Data_Classes/Character';
import type { IPower } from './IPower';
import type { IPowerset } from './IPowerset';
import type { IEffect } from './IEffect';
import { DatabaseAPI } from './DatabaseAPI';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { Enhancement } from './Enhancement';
import { ePowerSetType, dmModes, eSchedule, eEffectType, eDamage, eMez, eEnhance, eGridType, ePowerType, eToWho, eAspect, eBuffMode, eEffectClass, eStatType, eSpecialCase, eEffMode, eAttribType, ShortFX, ShortFXImpl, BuffsX, BuffsXImpl } from './Enums';
import type { Archetype } from './Base/Data_Classes/Archetype';
import type { I9Slot } from './I9Slot';
import { Power } from './Base/Data_Classes/Power';
import { PowerGrantsMap } from './PowerGrantsMap';
import { Statistics } from './Statistics';

// Private structs converted to interfaces/classes
interface FxIdentifierKey {
  EffectType: eEffectType;
  DamageType: eDamage;
  MezType: eMez;
  ETModifies: eEffectType;
  Summon: string;
}

interface GrantedPowerInfo {
  GrantPowerFX: IEffect;
  TargetPower: IPower;
  SourcePower: IPower;
}

interface FxIdShort {
  EffectType: eEffectType;
  MezType: eMez;
  ETModifies: eEffectType;
}

export class Toon extends Character {
  private static readonly BuildFormatChange1 = 1.29999995231628;
  private static readonly BuildFormatChange2 = 1.39999997615814;
  private _buffedPowers: (IPower | null)[] = [];
  private _mathPowers: IPower[] = [];
  private _selfBuffs: BuffsX = new BuffsXImpl();
  private _selfEnhance: BuffsX = new BuffsXImpl();

  constructor(archetype?: Archetype | null, alignment?: number) {
    super(archetype, alignment);
  }

  private ApplyPvpDr(): void {
    if (!MidsContext.Config.Inc.DisablePvE) {
      return;
    }

    for (let index = 0; index < this.Totals.Def.length; index++) {
      this.Totals.Def[index] = Toon.CalculatePvpDr(this.Totals.Def[index], 1.2, 1.0);
    }
  }

  private static CalculatePvpDr(val: number, a: number, b: number): number {
    return val * (1.0 - Math.abs(Math.atan(a * val)) * (2.0 / Math.PI) * b);
  }

  public static FixSpelling(iString: string | null): string {
    if (!iString) return '';
    iString = iString.replace("Armour", "Armor");
    iString = iString.replace("Electric Mastery", "Electrical Mastery");
    return iString;
  }

  public PickDefaultSecondaryPowerset(): IPowerset | null {
    return (this.Powersets[1] == null || this.Powersets[1]!.nID < 0)
      ? DatabaseAPI.Database.Powersets.find(ps =>
          ps.ATClass === this.Archetype?.ClassName &&
          ps.SetType === ePowerSetType.Secondary) ?? null
      : this.Powersets[1];
  }

  public BuildPower(iSet: number, powerID: number, noPoolShuffle: boolean = false): void {
    if (iSet < 0 || powerID < 0) {
      return;
    }

    const ps1 = this.PickDefaultSecondaryPowerset();
    if (!ps1) return;
    const inToonHistory = this.CurrentBuild?.FindInToonHistory(powerID) ?? -1;
    this.ResetLevel();
    const numArray = DatabaseAPI.NidPowersAtLevelBranch(0, ps1.nID);
    const flag1 = numArray.length > 1;
    let message = "";
    
    if (inToonHistory > -1) {
      const canRemove = this.CanRemovePower(inToonHistory, true);
      if (canRemove.canRemove) {
        if (inToonHistory < (this.CurrentBuild?.Powers.length ?? 0)) {
          this.CurrentBuild!.Powers[inToonHistory]?.Reset();
        }
        this.RequestedLevel = this.CurrentBuild!.Powers[inToonHistory]?.Level ?? 0;
      } else if (canRemove.message && !MidsContext.EnhCheckMode) {
        console.warn(canRemove.message);
      }

      this.ResetLevel();
      this.Lock();
    } else {
      const powerset = DatabaseAPI.Database.Powersets[iSet];
      if (powerset.SetType !== ePowerSetType.Secondary && !flag1 && 
          this.CurrentBuild!.Powers[1] &&
          this.CurrentBuild!.Powers[1].NIDPowerset < 0 && 
          !this.CurrentBuild!.PowerUsed(ps1.Powers[0] ?? null) && 
          numArray.length > 0) {
        this.SetPower_NID(1, numArray[0]);
      }

      let i = -1;
      const power = DatabaseAPI.Database.Power[powerID];
      switch (MidsContext.Config.BuildMode) {
        case dmModes.LevelUp: {
          i = this.GetFirstAvailablePowerIndex(power.Level - 1);
          if (i < 0) {
            message = "You cannot place any additional powers unless you first remove one.";
          } else {
            if (this.CurrentBuild!.Powers[i] != null && this.CurrentBuild!.Powers[i]!.Level <= this.Level) {
              if (!this.TestPower(powerID)) {
                i = -1;
              }
            } else {
              i = -1;
            }
          }
          break;
        }
        case dmModes.Normal:
        case dmModes.Respec: {
          i = this.GetFirstAvailablePowerIndex(Math.max(this.RequestedLevel, power.Level - 1));
          break;
        }
      }

      let flag2 = false;
      switch (i) {
        case 0:
          if (powerset.SetType === ePowerSetType.Primary) {
            if (power.Level === 1) {
              flag2 = true;
              break;
            }
            message = "You must place a level 1 Primary power here.";
            break;
          }
          if (powerset.SetType === ePowerSetType.Secondary) {
            if (this.CurrentBuild!.Powers[1] != null && this.CurrentBuild!.Powers[1]!.NIDPowerset < 0) {
              i = 1;
              flag2 = true;
            } else {
              message = "You must place a level 1 Primary power here.";
            }
          }
          break;
        case 1:
          if (powerset.SetType === ePowerSetType.Secondary) {
            if (power.Level === 1) {
              flag2 = true;
              break;
            }
            message = "You must place a level 1 Secondary power here.";
            break;
          }
          if (powerset.SetType === ePowerSetType.Primary) {
            if (this.CurrentBuild!.Powers[0] != null && this.CurrentBuild!.Powers[0]!.NIDPowerset < 0) {
              i = 0;
              flag2 = true;
            } else {
              message = "You must place a level 1 Secondary power here.";
            }
          }
          break;
        default:
          flag2 = i > 1;
          break;
      }

      if (flag2) {
        this.SetPower_NID(i, powerID);
        this.Lock();

        const powerEntry = this.CurrentBuild!.Powers[i];
        if (powerEntry?.Power?.VariableEnabled === true) {
          const initialVariableValue = Math.max(
            powerEntry.Power.VariableMin,
            powerEntry.Power.VariableStart
          );
          powerEntry.VariableValue = initialVariableValue;
          powerEntry.Power.Stacks = initialVariableValue;
        }
      } else if (message && !MidsContext.EnhCheckMode) {
        console.warn(message);
      }
    }

    this.Validate();
    if (!noPoolShuffle) {
      this.PoolShuffle();
    }

    this.ResetLevel();
  }

  public BuildSlot(powerNID: number, slotIDX: number = -1): number {
    if (powerNID < 0) {
      return -1;
    }

    const powerEntry = this.CurrentBuild?.Powers.find(p => p?.NIDPower === powerNID);
    if (!powerEntry) {
      return -1;
    }

    let num2 = -1;
    if (slotIDX > -1) {
      powerEntry.CanRemoveSlot(slotIDX);
      powerEntry.RemoveSlot(slotIDX);
      if (!powerEntry.Chosen && powerEntry.Slots.length === 0) {
        powerEntry.Level = -1;
      }
      this.ResetLevel();
      this.Lock();
    } else {
      const iLevel = this.SlotCheck(powerEntry);
      if (iLevel > -1) {
        num2 = powerEntry.AddSlot(iLevel);
      }
    }

    this.ResetLevel();
    this.Validate();
    return num2;
  }

  public FlipAllSlots(): void {
    if (!this.CurrentBuild) return;
    const num = this.CurrentBuild.Powers.length - 1;
    for (let iPowerSlot = 0; iPowerSlot <= num; iPowerSlot++) {
      this.FlipSlots(iPowerSlot);
    }
    this.GenerateBuffedPowerArray();
  }

  public FlipSlots(iPowerSlot: number): void {
    if (iPowerSlot < 0 || !this.CurrentBuild) return;
    const powerEntry = this.CurrentBuild.Powers[iPowerSlot];
    if (!powerEntry) return;
    const num = powerEntry.SlotCount - 1;
    for (let index = 0; index <= num; index++) {
      powerEntry.Slots[index]?.Flip();
    }
  }

  public PowerState(nIDPower: number, outMessage: { message: string }): { state: string; message: string } {
    if (nIDPower < 0) {
      return { state: 'Disabled', message: '' };
    }

    const power = DatabaseAPI.Database.Power[nIDPower];
    if (!power) {
      return { state: 'Disabled', message: '' };
    }

    const inToonHistory = this.CurrentBuild?.FindInToonHistory(nIDPower) ?? -1;
    const foundInBuild = inToonHistory > -1;
    const num1 = (MidsContext.Config.BuildMode === dmModes.Normal && this.RequestedLevel > -1) ||
                 (MidsContext.Config.BuildMode === dmModes.Respec && this.RequestedLevel > -1)
      ? this.RequestedLevel
      : this.Level;

    outMessage.message = '';
    const flag2 = this.CurrentBuild?.MeetsRequirement(power, foundInBuild 
      ? (this.CurrentBuild.Powers[inToonHistory]?.Level ?? num1)
      : num1) ?? false;

    if (this.PowersetMutexClash(nIDPower)) {
      outMessage.message = `You cannot take the ${this.Powersets[0]?.DisplayName ?? ''} and ${this.Powersets[1]?.DisplayName ?? ''} sets together.`;
      return { state: 'Heading', message: outMessage.message };
    }

    if (!foundInBuild) {
      return (flag2 && num1 >= power.Level - 1)
        ? { state: 'Enabled', message: '' }
        : { state: 'Disabled', message: '' };
    }

    // Additional validation logic for powers already in build
    // Simplified version - full implementation would check branching powersets, etc.
    if (flag2) {
      return num1 <= power.Level - 1
        ? { state: 'SelectedDisabled', message: '' }
        : { state: 'Selected', message: '' };
    }

    if (power.GetPowerSet()?.SetType === ePowerSetType.Ancillary || 
        power.GetPowerSet()?.SetType === ePowerSetType.Pool) {
      outMessage.message = "This power has been placed in a way that is not possible in-game.";
      // Additional message based on PowerSetIndex
    } else {
      if (power.InherentType !== eGridType.None) {
        return { state: 'Enabled', message: '' };
      }
      outMessage.message = "This power has been placed in a way that is not possible in-game.\r\nCheck that any powers that it requires have been taken first, and that if this is a branching powerset, the power does not conflict with another.";
      return { state: 'Invalid', message: outMessage.message };
    }

    return { state: 'Invalid', message: outMessage.message };
  }

  private TestPower(nIDPower: number): boolean {
    if ((this.CurrentBuild?.FindInToonHistory(nIDPower) ?? -1) > -1) {
      return false;
    }
    const result = this.PowerState(nIDPower, { message: '' });
    return result.state === 'Enabled';
  }

  public GenerateBuffedPowerArray(): void {
    if (!this.CurrentBuild) return;
    
    this.CurrentBuild.GenerateSetBonusData();
    this._selfBuffs.Reset();
    this._selfEnhance.Reset();
    this.ModifyEffects = new Map<string, number>();
    
    this._buffedPowers = new Array(this.CurrentBuild.Powers.length).fill(null);
    this._mathPowers = new Array(this.CurrentBuild.Powers.length);

    this.GBPA_Pass0_InitializePowerArray();
    this.GenerateModifyEffectsArray();

    this.GenerateBuffData(this._selfEnhance, true);

    // Process powers sequentially (C# uses Parallel.For)
    for (let hIDX = 0; hIDX < this._mathPowers.length; hIDX++) {
      if (this._mathPowers[hIDX] == null) {
        continue;
      }

      this.GBPA_Pass1_EnhancePreED(this._mathPowers[hIDX], hIDX);
      Toon.GBPA_Pass2_ApplyED(this._mathPowers[hIDX]);
      this.GBPA_Pass3_EnhancePostED(this._mathPowers[hIDX], hIDX);
      Toon.GBPA_Pass4_Add(this._mathPowers[hIDX]);
      this.GBPA_ApplyArchetypeCaps(this._mathPowers[hIDX]);
      Toon.GBPA_Pass5_MultiplyPreBuff(this._mathPowers[hIDX], this._buffedPowers[hIDX]);
    }

    this.GenerateBuffData(this._selfBuffs, false);

    for (let index = 0; index < this._mathPowers.length; index++) {
      if (this._mathPowers[index] != null) {
        this.GBPA_Pass6_MultiplyPostBuff(this._mathPowers[index], this._buffedPowers[index]);
      }
    }

    this.ApplyGlobalEnhancements();
    this.GBD_Totals();
  }

  private GenerateModifyEffectsArray(ignoreExisting: boolean = true): void {
    if (!this.CurrentBuild || !this.ModifyEffects) return;
    
    if (ignoreExisting) {
      this.ModifyEffects.clear();
    }

    // Process powers and collect modify effects
    for (let index = 0; index < this.CurrentBuild.Powers.length; index++) {
      const powerEntry = this.CurrentBuild.Powers[index];
      if (!powerEntry || !powerEntry.StatInclude || powerEntry.NIDPower <= -1 || !this._buffedPowers[index]) {
        continue;
      }

      const buffedPower = this._buffedPowers[index];
      if (!buffedPower) continue;

      for (const effect of buffedPower.Effects) {
        if (!(effect.EffectType === eEffectType.GlobalChanceMod && effect.Reward)) {
          continue;
        }

        if (ignoreExisting && this.ModifyEffects.has(effect.Reward)) {
          continue;
        }

        if (this.ModifyEffects.has(effect.Reward)) {
          this.ModifyEffects.set(effect.Reward, this.ModifyEffects.get(effect.Reward)! + effect.Scale);
        } else {
          this.ModifyEffects.set(effect.Reward, effect.Scale);
        }
      }
    }

    // Process set bonus virtual power
    const setBonusPower = this.CurrentBuild.SetBonusVirtualPower;
    if (!setBonusPower) return;

    for (const effect of setBonusPower.Effects) {
      if (!(effect.EffectType === eEffectType.GlobalChanceMod && effect.Reward)) {
        continue;
      }

      if (ignoreExisting && this.ModifyEffects.has(effect.Reward)) {
        continue;
      }

      if (this.ModifyEffects.has(effect.Reward)) {
        this.ModifyEffects.set(effect.Reward, this.ModifyEffects.get(effect.Reward)! + effect.Scale);
      } else {
        this.ModifyEffects.set(effect.Reward, effect.Scale);
      }
    }
  }

  private GenerateBuffData(nBuffs: any, enhancementPass: boolean): void {
    if (!this.CurrentBuild) return;

    for (let i = 0; i < this.CurrentBuild.Powers.length; i++) {
      const powerEntry = this.CurrentBuild.Powers[i];
      if (!powerEntry) continue;

      if (!(powerEntry.StatInclude && powerEntry.NIDPower > -1)) continue;
      const power = DatabaseAPI.Database.Power[powerEntry.NIDPower];
      if (power.PowerType === ePowerType.GlobalBoost) continue;

      if (this._buffedPowers[i] == null) continue;

      this.CalculateAndApplyEffects(this._buffedPowers[i]!, nBuffs, enhancementPass);
    }

    const setBonusPower = this.CurrentBuild.SetBonusVirtualPower;
    if (setBonusPower) {
      this.CalculateAndApplyEffects(setBonusPower, nBuffs, enhancementPass);
    }

    if (!MidsContext.Config.Inc.DisablePvE) {
      return;
    }

    const index1 = DatabaseAPI.NidFromUidPower("Temporary_Powers.Temporary_Powers.PVP_Resist_Bonus");
    if (index1 <= -1) {
      return;
    }

    const tPwr = new Power(DatabaseAPI.Database.Power[index1]);
    this.CalculateAndApplyEffects(tPwr, nBuffs, enhancementPass);
  }

  private GBPA_Pass0_InitializePowerArray(): boolean {
    if (!this.CurrentBuild) return false;
    
    this._buffedPowers = new Array(this.CurrentBuild.Powers.length).fill(null);
    this._mathPowers = new Array(this.CurrentBuild.Powers.length);
    
    for (let hIDX = 0; hIDX < this.CurrentBuild.Powers.length; hIDX++) {
      const powerEntry = this.CurrentBuild.Powers[hIDX];
      if (!powerEntry || powerEntry.NIDPower <= -1) {
        continue;
      }

      // Resync Power.Stacks and PowerEntry.VariableValue
      if (powerEntry.Power && powerEntry.Power.Stacks < powerEntry.VariableValue) {
        powerEntry.Power.Stacks = powerEntry.VariableValue;
      }

      const power = this.GBPA_SubPass0_AssemblePowerEntry(powerEntry.NIDPower, hIDX, 1);
      if (power) {
        this._mathPowers[hIDX] = power;
        if (powerEntry) {
          this._mathPowers[hIDX]!.Stacks = powerEntry.VariableValue;
        }
      }
    }

    // Apply incarnate enhancements from other powers
    for (let index1 = 0; index1 < this.CurrentBuild.Powers.length; index1++) {
      const powerEntry1 = this.CurrentBuild.Powers[index1];
      if (!powerEntry1 || powerEntry1.NIDPower <= -1) {
        continue;
      }

      for (let index2 = 0; index2 < this.CurrentBuild.Powers.length; index2++) {
        const powerEntry2 = this.CurrentBuild.Powers[index2];
        if (index1 === index2 || !powerEntry2?.StatInclude || powerEntry2.NIDPower <= -1) {
          continue;
        }

        let effectType = eEffectType.GrantPower;
        this.GBPA_ApplyIncarnateEnhancements(this._mathPowers[index1]!, -1, this._mathPowers[index2], false, effectType);
      }
    }

    // Multiply variables and create buffed powers
    for (let hIDX = 0; hIDX < this.CurrentBuild.Powers.length; hIDX++) {
      const powerEntry = this.CurrentBuild.Powers[hIDX];
      if (!powerEntry || powerEntry.NIDPower <= -1) {
        continue;
      }

      this.GBPA_MultiplyVariable(this._mathPowers[hIDX]!, hIDX);
      this._buffedPowers[hIDX] = new Power(this._mathPowers[hIDX]!);
      this._buffedPowers[hIDX]?.SetMathMag();
    }

    return true;
  }

  private GBPA_SubPass0_AssemblePowerEntry(nIDPower: number, hIDX: number, stackingOverride: number = -1): IPower | null {
    if (nIDPower < 0) {
      return null;
    }

    // Fetch unenhanced power from DB
    let power2: IPower = new Power(DatabaseAPI.Database.Power[nIDPower]);
    
    // Apply stacks
    if (stackingOverride > -1) {
      power2.Stacks = stackingOverride;
    } else if (hIDX >= 0 && hIDX < (this.CurrentBuild?.Powers.length ?? 0) && this.CurrentBuild?.Powers[hIDX]) {
      power2.Stacks = this.CurrentBuild.Powers[hIDX]!.VariableValue;
    }
    
    power2 = this.GBPA_ApplyPowerOverride(power2);
    this.GBPA_AddEnhFX(power2, hIDX);
    power2.AbsorbPetEffects(hIDX, stackingOverride);
    power2.ApplyGrantPowerEffects();
    this.GBPA_AddSubPowerEffects(power2, hIDX);
    power2.ApplyModifyEffects();

    return power2;
  }

  private GBPA_ApplyPowerOverride(ret: IPower): IPower {
    if (!ret.HasPowerOverrideEffect) {
      return ret;
    }

    for (const fx of ret.Effects) {
      if (fx.EffectType !== eEffectType.PowerRedirect || 
          !(fx.nOverride > -1 && Math.abs(fx.Probability - 1) < 0.01 && fx.CanInclude())) {
        continue;
      }

      const level = ret.Level;
      ret = new Power(DatabaseAPI.Database.Power[fx.nOverride]);
      ret.Level = level;
      return ret;
    }

    return ret;
  }

  private GBPA_AddEnhFX(iPower: IPower | null, iIndex: number): void {
    if (!MidsContext.Config || !this.CurrentBuild || MidsContext.Config.I9.IgnoreEnhFX || iIndex < 0 || !iPower) {
      return;
    }

    const currentPowerEntry = this.CurrentBuild.Powers[iIndex];
    if (!currentPowerEntry?.Power) {
      return;
    }

    const newEffects: IEffect[] = [];

    for (const slotEntry of currentPowerEntry.Slots) {
      if (slotEntry.Enhancement.Enh < 0) continue;
      
      const enhancement = DatabaseAPI.Database.Enhancements[slotEntry.Enhancement.Enh];
      const enhancementPower = enhancement.GetPower();
      if (!enhancementPower) {
        continue;
      }

      if (currentPowerEntry.ProcInclude && enhancement.IsProc) {
        continue;
      }

      const eSet = enhancement.GetEnhancementSet();
      if (!eSet) {
        continue;
      }

      for (const enhEffect of enhancementPower.Effects) {
        let shouldAddEffect = false;
        
        if (enhEffect.AffectsPetsOnly() && iPower.IsSummonPower) {
          const uidEntity = iPower.Effects.find(x => x.EffectType === eEffectType.EntCreate)?.Summon;
          if (uidEntity) {
            const summon = DatabaseAPI.NidFromUidEntity(uidEntity);
            const entitySetName = DatabaseAPI.Database.Entities[summon]?.PowersetFullName?.[0];
            const entitySet = entitySetName ? DatabaseAPI.GetPowersetByFullname(entitySetName) : null;
            if (entitySet) {
              for (const entPower of entitySet.Powers) {
                if (!entPower) continue;
                shouldAddEffect = entPower.Effects.some(e => e.EffectType === enhEffect.EffectType);
                if (!shouldAddEffect) continue;

                Toon.AddClonedEffectToList(newEffects, enhEffect, enhancement.IsProc);
                if (enhEffect.EffectType === eEffectType.GrantPower) {
                  entPower.HasGrantPowerEffect = true;
                }
              }
            }
          }
        } else {
          // Find enhancement index in set
          const enhIndexSet = eSet.Enhancements.findIndex(e => e === slotEntry.Enhancement.Enh);
          
          // Will include if there is no special bonus for this enhancement (at set level),
          // and no regular buff is attached to this enhancement
          shouldAddEffect = enhIndexSet >= 0 &&
            eSet.SpecialBonus[enhIndexSet].Index.length <= 0 &&
            (enhancement.Effect.every(e => e.Mode !== eEffMode.Enhancement) || 
             !/^(Melee|Ranged)_Boosts_/.test(enhEffect.ModifierTable));
        }

        if (!shouldAddEffect) {
          continue;
        }

        Toon.AddClonedEffectToList(newEffects, enhEffect, enhancement.IsProc);
        if (enhEffect.EffectType === eEffectType.GrantPower) {
          iPower.HasGrantPowerEffect = true;
        }
      }
    }

    if (newEffects.length > 0) {
      iPower.Effects = [...iPower.Effects, ...newEffects];
    }
  }

  private static AddClonedEffectToList(effectsList: IEffect[], enhEffect: IEffect, isProc: boolean, isEnhancementEffect: boolean = true): void {
    const clonedEffect = enhEffect.Clone();
    if (!clonedEffect) return;
    clonedEffect.isEnhancementEffect = isEnhancementEffect;
    clonedEffect.IgnoreScaling = isProc;
    clonedEffect.ToWho = enhEffect.ToWho;
    clonedEffect.Absorbed_Effect = true;
    clonedEffect.Ticks = enhEffect.Ticks;
    clonedEffect.Buffable = false;
    effectsList.push(clonedEffect);
  }

  private GBPA_AddSubPowerEffects(ret: IPower, hIDX: number): boolean {
    if (!ret.NIDSubPower || ret.NIDSubPower.length <= 0) {
      return false;
    }
    
    let length = ret.Effects.length;
    if (hIDX < 0 || !this.CurrentBuild) {
      return false;
    }
    
    let effectCount = 0;
    const powerEntry = this.CurrentBuild.Powers[hIDX];
    if (!powerEntry) return false;
    
    for (let index = 0; index < powerEntry.SubPowers.length; index++) {
      const subPower = powerEntry.SubPowers[index];
      if (subPower && subPower.nIDPower > -1 && subPower.StatInclude) {
        effectCount += DatabaseAPI.Database.Power[ret.NIDSubPower[index]]?.Effects.length ?? 0;
      }
    }

    // Expand effects array
    const effectArray = new Array<IEffect>(ret.Effects.length + effectCount);
    for (let i = 0; i < ret.Effects.length; i++) {
      effectArray[i] = ret.Effects[i];
    }
    ret.Effects = effectArray;
    
    for (const sp of powerEntry.SubPowers) {
      if (!sp || sp.nIDPower <= -1 || !sp.StatInclude) continue;
      
      const subPowerEffects = DatabaseAPI.Database.Power[sp.nIDPower]?.Effects ?? [];
      for (let index2 = 0; index2 < subPowerEffects.length; index2++) {
        ret.Effects[length] = subPowerEffects[index2].Clone();
        ret.Effects[length].Absorbed_EffectID = index2;
        ret.Effects[length].Absorbed_Effect = true;
        ret.Effects[length].Absorbed_Power_nID = sp.nIDPower;
        ret.Effects[length].Absorbed_PowerType = DatabaseAPI.Database.Power[sp.nIDPower]?.PowerType ?? ePowerType.Click;
        length++;
      }
    }

    return true;
  }

  private GBPA_ApplyArchetypeCaps(powerMath: IPower): void {
    if (!this.Archetype) return;
    
    if (powerMath.RechargeTime > this.Archetype.RechargeCap) {
      powerMath.RechargeTime = this.Archetype.RechargeCap;
    }

    for (const fx of powerMath.Effects) {
      if (fx.EffectType === eEffectType.Damage && fx.Math_Mag > this.Archetype.DamageCap) {
        fx.Math_Mag = this.Archetype.DamageCap;
      }
    }
  }

  private GBPA_MultiplyVariable(iPower: IPower, hIDX: number): boolean {
    if (!iPower || hIDX < 0 || !this.CurrentBuild) {
      return false;
    }

    if (!iPower.VariableEnabled) {
      return false;
    }

    const powerEntry = this.CurrentBuild.Powers[hIDX];
    if (!powerEntry) return false;

    for (const fx of iPower.Effects) {
      if (fx.VariableModified && !fx.IgnoreScaling) {
        fx.Scale *= powerEntry.VariableValue;
      }
    }

    return true;
  }

  private GBPA_Pass1_EnhancePreED(powerMath: IPower, hIDX: number): boolean {
    if (hIDX < 0 || !this.CurrentBuild) {
      return false;
    }

    const powerEntry = this.CurrentBuild.Powers[hIDX];
    if (!powerEntry || powerEntry.NIDPowerset < 0) {
      return false;
    }

    // Reset power attributes
    powerMath.Accuracy = 0;
    powerMath.EndCost = 0;
    powerMath.InterruptTime = 0;
    powerMath.Range = 0;
    powerMath.RechargeTime = 0;
    for (const effect of powerMath.Effects) {
      effect.Math_Mag = 0;
      effect.Math_Duration = 0;
    }

    const basePower = DatabaseAPI.Database.Power[powerEntry.NIDPower];
    const isAcc = basePower.IgnoreEnhancement(eEnhance.Accuracy);
    const isRech = basePower.IgnoreEnhancement(eEnhance.RechargeTime);
    const isEnd = basePower.IgnoreEnhancement(eEnhance.EnduranceDiscount);

    const effectTypeCount = Object.keys(eEffectType).length / 2; // Approximate enum count

    // Process each slot
    for (let index = 0; index < powerEntry.SlotCount; index++) {
      const slot = powerEntry.Slots[index];
      if (!(slot.Enhancement.Enh > -1 && slot.Level < MidsContext.Config.ForceLevel)) {
        continue;
      }

      const enhancement = slot.Enhancement;
      if (isAcc) {
        powerMath.Accuracy += enhancement.GetEnhancementEffect(eEnhance.Accuracy, -1, 1);
      }
      if (isEnd) {
        powerMath.EndCost += enhancement.GetEnhancementEffect(eEnhance.EnduranceDiscount, -1, 1);
      }
      powerMath.InterruptTime += enhancement.GetEnhancementEffect(eEnhance.Interrupt, -1, 1);
      powerMath.Range += enhancement.GetEnhancementEffect(eEnhance.Range, -1, 1);
      if (isRech) {
        powerMath.RechargeTime += enhancement.GetEnhancementEffect(eEnhance.RechargeTime, -1, 1);
      }

      // Process effects
      for (let effIdx = 0; effIdx < powerMath.Effects.length; effIdx++) {
        if (!powerMath.Effects[effIdx].Buffable) {
          continue;
        }

        for (let index2 = 0; index2 < effectTypeCount; index2++) {
          const eEffectType2 = index2 as eEffectType;
          if (powerMath.Effects[effIdx].EffectType !== eEffectType2) {
            continue;
          }

          let fxDuration = 0;
          let flag6 = false; // IsEnumValue check
          let flag7 = false;

          // Check for special cases
          if (powerMath.Effects[effIdx].EffectType === eEffectType.Enhancement && 
              powerMath.Effects[effIdx].ETModifies === eEffectType.Accuracy) {
            flag6 = true;
            flag7 = true;
          } else if (powerMath.Effects[effIdx].EffectType === eEffectType.ResEffect && 
                     powerMath.Effects[effIdx].ETModifies === eEffectType.Defense) {
            flag6 = true;
          }

          if (!flag6) {
            const allowedFx = this.GetAllowedEffectsFromEnhance(enhancement);
            if (!allowedFx) {
              continue;
            }
            if (!this.CheckAllowedFromFx(allowedFx, powerMath.Effects[effIdx].EffectType, 
                powerMath.Effects[effIdx].MezType, powerMath.Effects[effIdx].ETModifies)) {
              continue;
            }
          }

          const iEffect = !flag7 ? eEnhance.None : eEnhance.Accuracy; // Simplified - would need StringToFlaggedEnum
          
          let fxMag = 0;
          if (eEffectType2 === eEffectType.Mez) {
            fxMag = enhancement.GetEnhancementEffect(iEffect, powerMath.Effects[effIdx].MezType, 
              this._buffedPowers[hIDX]?.Effects[effIdx]?.Math_Mag ?? 0);
          } else if (eEffectType2 === eEffectType.ResEffect && 
                     (powerMath.Effects[effIdx].ETModifies === eEffectType.Defense || 
                      powerMath.Effects[effIdx].ETModifies === eEffectType.Regeneration)) {
            if (powerMath.Effects[effIdx].ETModifies === eEffectType.Defense) {
              fxMag = enhancement.GetEnhancementEffect(eEnhance.Defense, -1, 
                this._buffedPowers[hIDX]?.Effects[effIdx]?.Math_Mag ?? 0);
            } else {
              fxMag = enhancement.GetEnhancementEffect(eEnhance.Heal, -1, 
                this._buffedPowers[hIDX]?.Effects[effIdx]?.Math_Mag ?? 0);
            }
          } else {
            fxMag = enhancement.GetEnhancementEffect(iEffect, -1, 
              this._buffedPowers[hIDX]?.Effects[effIdx]?.Math_Mag ?? 0);
          }

          if (eEffectType2 === eEffectType.Damage && powerMath.Effects[effIdx].DamageType === eDamage.Special) {
            fxMag = 0;
          } else if (eEffectType2 === eEffectType.Mez && powerMath.Effects[effIdx].AttribType === eAttribType.Duration) {
            fxDuration = fxMag;
            fxMag = 0;
          }

          powerMath.Effects[effIdx].Math_Mag += fxMag;
          powerMath.Effects[effIdx].Math_Duration += fxDuration;
        }
      }
    }

    // Apply incarnate enhancements from other powers
    for (let index = 0; index < this.CurrentBuild.Powers.length; index++) {
      const otherPowerEntry = this.CurrentBuild.Powers[index];
      if (!otherPowerEntry || !otherPowerEntry.StatInclude || otherPowerEntry.NIDPower <= -1) {
        continue;
      }

      let effectType = eEffectType.Enhancement;
      this.GBPA_ApplyIncarnateEnhancements(powerMath, hIDX, this._mathPowers[index], false, effectType);
    }

    return false;
  }

  private static GBPA_Pass2_ApplyED(powerMath: IPower): boolean {
    powerMath.Accuracy = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.Accuracy), powerMath.Accuracy);
    powerMath.EndCost = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.EnduranceDiscount), powerMath.EndCost);
    powerMath.InterruptTime = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.Interrupt), powerMath.InterruptTime);
    powerMath.Range = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.Range), powerMath.Range);
    powerMath.RechargeTime = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.RechargeTime), powerMath.RechargeTime);
    
    for (const eff of powerMath.Effects) {
      if (eff.isEnhancementEffect) continue;
      
      for (let index2 = 0; index2 < Object.keys(eEffectType).length / 2; index2++) {
        const effectType = index2 as eEffectType;
        if (eff.EffectType !== effectType) continue;
        
        let iEnh = eEnhance.None; // Simplified - would need StringToFlaggedEnum
        let isSpecial = false;
        
        if (eff.EffectType === eEffectType.Enhancement && eff.ETModifies === eEffectType.Accuracy) {
          isSpecial = true;
          iEnh = eEnhance.Accuracy;
        } else if (eff.EffectType === eEffectType.ResEffect && eff.ETModifies === eEffectType.Defense) {
          iEnh = eEnhance.Defense;
        }

        if (effectType === eEffectType.Mez) {
          eff.Math_Mag = Enhancement.ApplyED(Enhancement.GetSchedule(iEnh, eff.MezType), eff.Math_Mag);
          eff.Math_Duration = Enhancement.ApplyED(Enhancement.GetSchedule(iEnh, eff.MezType), eff.Math_Duration);
        } else {
          if (effectType === eEffectType.ResEffect && eff.ETModifies === eEffectType.Defense) {
            eff.Math_Mag = Enhancement.ApplyED(Enhancement.GetSchedule(eEnhance.Defense), eff.Math_Mag);
          } else {
            eff.Math_Mag = Enhancement.ApplyED(Enhancement.GetSchedule(iEnh), eff.Math_Mag);
          }
        }
      }
    }
    
    return true;
  }

  private GBPA_Pass3_EnhancePostED(powerMath: IPower, hIDX: number): boolean {
    if (!this.CurrentBuild || hIDX < 0) return false;
    
    const powerEntry = this.CurrentBuild.Powers[hIDX];
    if (!powerEntry) return false;
    
    const basePower = DatabaseAPI.Database.Power[powerEntry.NIDPower];
    const okAcc = basePower.IgnoreEnhancement(eEnhance.Accuracy);
    const okRecharge = basePower.IgnoreEnhancement(eEnhance.RechargeTime);
    const okEnd = basePower.IgnoreEnhancement(eEnhance.EnduranceDiscount);
    
    // Apply self-enhancement buffs
    for (let index1 = 0; index1 < this._selfEnhance.Effect.length; index1++) {
      const effectType = index1 as eEffectType;
      
      switch (effectType) {
        case eEffectType.Accuracy:
          if (okAcc) {
            powerMath.Accuracy += this._selfEnhance.Effect[index1];
          }
          break;
        case eEffectType.EnduranceDiscount:
          if (okEnd) {
            powerMath.EndCost += this._selfEnhance.Effect[index1];
          }
          break;
        case eEffectType.InterruptTime:
          powerMath.InterruptTime += this._selfEnhance.Effect[index1];
          break;
        case eEffectType.Range:
          powerMath.Range += this._selfEnhance.Effect[index1];
          break;
        case eEffectType.RechargeTime:
          if (okRecharge) {
            powerMath.RechargeTime += this._selfEnhance.Effect[index1];
          }
          break;
        default:
          for (let index2 = 0; index2 < powerMath.Effects.length; index2++) {
            if (!powerMath.Effects[index2].Buffable) {
              continue;
            }

            let num3 = 0;
            let mag = 0;
            if (powerMath.Effects[index2].EffectType !== effectType) {
              continue;
            }

            switch (effectType) {
              case eEffectType.Damage:
                for (let index3 = 0; index3 < Object.keys(eDamage).length / 2; index3++) {
                  const dmgType = index3 as eDamage;
                  if (powerMath.Effects[index2].DamageType === dmgType) {
                    powerMath.Effects[index2].Math_Mag += this._selfEnhance.Damage[powerMath.Effects[index2].DamageType];
                  }
                }
                mag = 0;
                break;
              case eEffectType.Defense:
                for (let dmgTypeIndex = 0; dmgTypeIndex < Object.keys(eDamage).length / 2; dmgTypeIndex++) {
                  const dmgType = dmgTypeIndex as eDamage;
                  if (powerMath.Effects[index2].DamageType === dmgType) {
                    powerMath.Effects[index2].Math_Mag += this._selfEnhance.Defense[powerMath.Effects[index2].DamageType];
                  }
                }
                mag = 0;
                break;
              case eEffectType.Mez:
                for (let index3 = 0; index3 < Object.keys(eMez).length / 2; index3++) {
                  const mezType = index3 as eMez;
                  if (powerMath.Effects[index2].AttribType === eAttribType.Duration) {
                    if (powerMath.Effects[index2].MezType === mezType) {
                      powerMath.Effects[index2].Math_Duration += this._selfEnhance.Mez[powerMath.Effects[index2].MezType];
                    }
                    num3 = 0;
                    mag = 0;
                  } else if (powerMath.Effects[index2].MezType === mezType) {
                    powerMath.Effects[index2].Math_Mag += this._selfEnhance.Mez[powerMath.Effects[index2].MezType];
                    mag = 0;
                  }
                }
                break;
              case eEffectType.Resistance:
                for (let dmgTypeIndex = 0; dmgTypeIndex < Object.keys(eDamage).length / 2; dmgTypeIndex++) {
                  const dmgType = dmgTypeIndex as eDamage;
                  if (powerMath.Effects[index2].DamageType === dmgType) {
                    powerMath.Effects[index2].Math_Mag += this._selfEnhance.Resistance[powerMath.Effects[index2].DamageType];
                  }
                }
                break;
              default:
                const effect = powerMath.Effects[index2];
                if (effect.EffectType === eEffectType.Enhancement && 
                    (effect.ETModifies === eEffectType.SpeedRunning || 
                     effect.ETModifies === eEffectType.SpeedJumping || 
                     effect.ETModifies === eEffectType.JumpHeight || 
                     effect.ETModifies === eEffectType.SpeedFlying)) {
                  if (this._buffedPowers[hIDX] && this._buffedPowers[hIDX].Effects[index2] && this._buffedPowers[hIDX].Effects[index2].Mag > 0) {
                    mag = this._selfEnhance.Effect[effect.ETModifies];
                  } else if (this._buffedPowers[hIDX] && this._buffedPowers[hIDX].Effects[index2] && this._buffedPowers[hIDX].Effects[index2].Mag < 0) {
                    mag = this._selfEnhance.EffectAux[effect.ETModifies];
                  }
                  break;
                }

                if (effect.EffectType === eEffectType.SpeedRunning || 
                    effect.EffectType === eEffectType.SpeedJumping || 
                    effect.EffectType === eEffectType.JumpHeight || 
                    effect.EffectType === eEffectType.SpeedFlying) {
                  if (this._buffedPowers[hIDX] && this._buffedPowers[hIDX].Effects[index2] && this._buffedPowers[hIDX].Effects[index2].Mag > 0) {
                    mag = this._selfEnhance.Effect[effect.EffectType];
                  } else if (this._buffedPowers[hIDX] && this._buffedPowers[hIDX].Effects[index2] && this._buffedPowers[hIDX].Effects[index2].Mag < 0) {
                    mag = this._selfEnhance.EffectAux[effect.EffectType];
                  }
                  break;
                }

                mag = this._selfEnhance.Effect[index1];
                break;
            }

            powerMath.Effects[index2].Math_Mag += mag;
            powerMath.Effects[index2].Math_Duration += num3;
          }
          break;
      }
    }

    // Apply incarnate enhancements from other powers
    for (let index = 0; index < this.CurrentBuild.Powers.length; index++) {
      const otherPowerEntry = this.CurrentBuild.Powers[index];
      if (!otherPowerEntry || !otherPowerEntry.StatInclude || otherPowerEntry.NIDPower <= -1) {
        continue;
      }
      let effectType = eEffectType.Enhancement;
      this.GBPA_ApplyIncarnateEnhancements(powerMath, hIDX, this._mathPowers[index], true, effectType);
    }

    return true;
  }

  private static GBPA_Pass4_Add(powerMath: IPower): boolean {
    powerMath.EndCost++;
    powerMath.InterruptTime++;
    powerMath.Range++;
    powerMath.RechargeTime++;
    for (const effect of powerMath.Effects) {
      effect.Math_Mag++;
      effect.Math_Duration++;
    }
    return true;
  }

  private static GBPA_Pass5_ResyncEffects(powerMath: IPower, powerBuffed: IPower): void {
    const l = Math.min(powerMath.Effects.length, powerBuffed.Effects.length);
    const fxMath = [...powerMath.Effects];
    const fxBuffed = [...powerBuffed.Effects];
    
    for (let i = 0; i < l; i++) {
      if (fxMath[i].EffectType === fxBuffed[i].EffectType &&
          fxMath[i].DamageType === fxBuffed[i].DamageType &&
          fxMath[i].MezType === fxBuffed[i].MezType &&
          fxMath[i].ETModifies === fxBuffed[i].ETModifies &&
          fxMath[i].Summon === fxBuffed[i].Summon) {
        continue;
      }
      fxMath.splice(i, 1);
    }

    powerMath.Effects = fxMath;
  }

  private static GBPA_Pass5_MultiplyPreBuff(powerMath: IPower, powerBuffed: IPower | null): void {
    if (!powerBuffed) return;
    
    powerBuffed.EndCost /= powerMath.EndCost;
    powerBuffed.InterruptTime /= powerMath.InterruptTime;
    powerBuffed.Range *= powerMath.Range;
    powerBuffed.RechargeTime /= powerMath.RechargeTime;

    if (powerMath.Effects.length > powerBuffed.Effects.length) {
      Toon.GBPA_Pass5_ResyncEffects(powerMath, powerBuffed);
    }

    for (let index = 0; index < powerMath.Effects.length; index++) {
      if (index < powerBuffed.Effects.length) {
        powerBuffed.Effects[index].Math_Mag = powerBuffed.Effects[index].Mag * powerMath.Effects[index].Math_Mag;
        powerBuffed.Effects[index].Math_Duration = powerBuffed.Effects[index].Duration * powerMath.Effects[index].Math_Duration;
      }
    }
  }

  private GBPA_Pass6_MultiplyPostBuff(powerMath: IPower, powerBuffed: IPower | null): boolean {
    if (!powerMath || !powerBuffed || !MidsContext.Config) return false;
    
    const nToHit = !powerMath.IgnoreBuff(eEnhance.ToHit) ? 0 : this._selfBuffs.Effect[eStatType.ToHit];
    const nAcc = !powerMath.IgnoreBuff(eEnhance.Accuracy) ? 0 : this._selfBuffs.Effect[eStatType.BuffAcc];
    powerBuffed.Accuracy = powerBuffed.Accuracy * (1 + powerMath.Accuracy + nAcc) * (MidsContext.Config.ScalingToHit + nToHit);
    powerBuffed.AccuracyMult = powerBuffed.Accuracy * (1 + powerMath.Accuracy + nAcc);
    return true;
  }

  private GetAllowedEffectsFromEnhance(enhanceTypeOrSlot: eEnhance | I9Slot): FxIdShort[] | null {
    // Handle I9Slot overload
    if (typeof enhanceTypeOrSlot === 'object' && 'Enh' in enhanceTypeOrSlot) {
      const enhancement = enhanceTypeOrSlot as I9Slot;
      if (enhancement.Enh < 0) {
        return null;
      }

      const enh = DatabaseAPI.Database.Enhancements[enhancement.Enh];
      const allEffects: FxIdShort[] = [];
      
      for (const e of enh.Effect) {
        const allowed = this.GetAllowedEffectsFromEnhance(e.Enhance.ID as eEnhance);
        if (allowed) {
          allEffects.push(...allowed);
        }
      }

      // Remove duplicates
      const unique: FxIdShort[] = [];
      for (const fx of allEffects) {
        if (!unique.some(u => 
          u.EffectType === fx.EffectType && 
          u.MezType === fx.MezType && 
          u.ETModifies === fx.ETModifies
        )) {
          unique.push(fx);
        }
      }

      return unique.length > 0 ? unique : null;
    }

    // Handle eEnhance overload
    const enhanceType = enhanceTypeOrSlot as eEnhance;
    switch (enhanceType) {
      case eEnhance.Defense:
        return [
          { EffectType: eEffectType.Defense, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.ResEffect, MezType: eMez.None, ETModifies: eEffectType.Defense }
        ];
      case eEnhance.Heal:
        return [
          { EffectType: eEffectType.Heal, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.Absorb, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.Regeneration, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.HitPoints, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.ResEffect, MezType: eMez.None, ETModifies: eEffectType.Regeneration }
        ];
      case eEnhance.Accuracy:
        return [
          { EffectType: eEffectType.Accuracy, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.EnduranceDiscount:
        return [
          { EffectType: eEffectType.EnduranceDiscount, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.Endurance:
        return [
          { EffectType: eEffectType.Endurance, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.SpeedFlying:
        return [
          { EffectType: eEffectType.SpeedFlying, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.Interrupt:
        return [
          { EffectType: eEffectType.InterruptTime, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.JumpHeight:
        return [
          { EffectType: eEffectType.JumpHeight, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.SpeedJumping:
        return [
          { EffectType: eEffectType.SpeedJumping, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.Range:
        return [
          { EffectType: eEffectType.Range, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.RechargeTime:
      case eEnhance.X_RechargeTime:
        return [
          { EffectType: eEffectType.RechargeTime, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.Recovery:
        return [
          { EffectType: eEffectType.Recovery, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.SpeedRunning:
        return [
          { EffectType: eEffectType.SpeedRunning, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.ToHit:
        return [
          { EffectType: eEffectType.ToHit, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      case eEnhance.Slow:
        return [
          { EffectType: eEffectType.SpeedRunning, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.SpeedJumping, MezType: eMez.None, ETModifies: eEffectType.None },
          { EffectType: eEffectType.SpeedFlying, MezType: eMez.None, ETModifies: eEffectType.None }
        ];
      default:
        return null;
    }
  }

  private CheckAllowedFromFx(fxIdList: FxIdShort[] | null, effectType: eEffectType, mezType: eMez = eMez.None, etModifies: eEffectType = eEffectType.None): boolean {
    if (fxIdList == null) {
      return true;
    }

    const fxId: FxIdShort = { EffectType: effectType, MezType: mezType, ETModifies: etModifies };
    return fxIdList.some(fx => 
      fx.EffectType === fxId.EffectType && 
      fx.MezType === fxId.MezType && 
      fx.ETModifies === fxId.ETModifies
    );
  }

  private static HandleDefaultIncarnateEnh(powerMath: IPower, effect1: IEffect): void {
    for (const effect of powerMath.Effects) {
      if (!effect.Buffable) {
        continue;
      }

      let duration = 0;
      let mag = 0;
      if ((effect.EffectType === eEffectType.Resistance || effect.EffectType === eEffectType.Damage) && 
          effect1.EffectType === eEffectType.DamageBuff) {
        if (effect.DamageType === effect1.DamageType) {
          effect.Math_Mag += effect1.Mag;
        }
      } else if (effect.EffectType === effect1.ETModifies) {
        switch (effect1.ETModifies) {
          case eEffectType.Damage:
            if (effect.DamageType === effect1.DamageType) {
              effect.Math_Mag += effect1.Mag;
            }
            mag = 0;
            break;
          case eEffectType.Defense:
            if (effect.DamageType === effect1.DamageType) {
              effect.Math_Mag += effect1.Mag;
            }
            mag = 0;
            break;
          case eEffectType.Mez:
            if (effect1.MezType === effect.MezType) {
              for (let mezIndex = 0; mezIndex < Object.keys(eMez).length / 2; mezIndex++) {
                const mezType = mezIndex as eMez;
                if (effect.AttribType === eAttribType.Duration) {
                  if (effect.MezType === mezType) {
                    effect.Math_Duration += effect1.Mag;
                  }
                  duration = 0;
                  mag = 0;
                } else if (effect.MezType === mezType) {
                  effect.Math_Mag += effect1.Mag;
                  mag = 0;
                }
              }
            }
            break;
          default:
            if (effect.EffectType === eEffectType.Enhancement && 
                (effect.ETModifies === eEffectType.SpeedRunning || 
                 effect.ETModifies === eEffectType.SpeedJumping || 
                 effect.ETModifies === eEffectType.JumpHeight || 
                 effect.ETModifies === eEffectType.SpeedFlying)) {
              mag = effect1.Mag;
              break;
            }

            if (effect.EffectType === eEffectType.SpeedRunning || 
                effect.EffectType === eEffectType.SpeedJumping || 
                effect.EffectType === eEffectType.JumpHeight || 
                effect.EffectType === eEffectType.SpeedFlying) {
              mag = effect1.Mag;
              break;
            }

            mag = effect1.Mag;
            break;
        }

        effect.Math_Mag += mag;
        effect.Math_Duration += duration;
      }
    }
  }

  private static HandleGrantPowerIncarnate(powerMath: IPower, effect1: IEffect, buffedPowers: (IPower | null)[], effIdx: number, at: Archetype | null, hIDX: number): void {
    powerMath.AbsorbEffects(DatabaseAPI.Database.Power[effect1.nSummon], effect1.Duration, 0, at, 1, true, effIdx);
    for (const fx of powerMath.Effects) {
      fx.ToWho = eToWho.Target;
      fx.Absorbed_Effect = true;
      fx.isEnhancementEffect = effect1.isEnhancementEffect;
      fx.BaseProbability *= effect1.BaseProbability;
      fx.EffectiveProbability = fx.Probability * effect1.Probability;
      fx.Ticks = effect1.Ticks;
    }

    if (hIDX <= -1) return;
    
    const buffedPower = buffedPowers[hIDX];
    if (!buffedPower) return;
    
    const length2 = buffedPower.Effects.length;
    buffedPower.AbsorbEffects(DatabaseAPI.Database.Power[effect1.nSummon], effect1.Duration, 0, at, 1, true, effIdx);
    for (let index2 = length2; index2 < buffedPower.Effects.length; index2++) {
      buffedPower.Effects[index2].ToWho = effect1.ToWho;
      buffedPower.Effects[index2].Absorbed_Effect = true;
      buffedPower.Effects[index2].isEnhancementEffect = effect1.isEnhancementEffect;
      buffedPower.Effects[index2].EffectiveProbability = buffedPower.Effects[index2].Probability * effect1.Probability;
      buffedPower.Effects[index2].Ticks = effect1.Ticks;
    }
  }

  private GBPA_ApplyIncarnateEnhancements(powerMath: IPower, hIDX: number, sourcePower: IPower | null, ignoreED: boolean, effectType: eEffectType): void {
    if (!powerMath || !sourcePower || sourcePower.Effects.length === 0 || !powerMath.Slottable) {
      return;
    }

    const powerGrantsMap = new PowerGrantsMap(sourcePower);
    const gcmFlags: string[] = [];
    const len = powerMath.Effects.length;
    
    for (let effIdx = 0; effIdx < sourcePower.Effects.length; effIdx++) {
      const effect1 = sourcePower.Effects[effIdx];
      let disqualified = false;
      
      if (effect1.EffectClass === eEffectClass.Ignored) {
        disqualified = true;
      } else {
        switch (effectType) {
          case eEffectType.Enhancement:
            if (effect1.EffectType !== eEffectType.Enhancement && effect1.EffectType !== eEffectType.DamageBuff) {
              disqualified = true;
            }
            break;
          case eEffectType.GrantPower:
            if (effect1.EffectType === eEffectType.Enhancement || effect1.EffectType === eEffectType.DamageBuff) {
              disqualified = true;
            }
            break;
          default:
            if (effect1.IgnoreED !== ignoreED ||
                (sourcePower.PowerType !== ePowerType.GlobalBoost && 
                 (!effect1.Absorbed_Effect || effect1.Absorbed_PowerType !== ePowerType.GlobalBoost)) ||
                (effect1.EffectType === eEffectType.GrantPower && effect1.Absorbed_Effect)) {
              disqualified = true;
            }
            break;
        }
      }

      if (disqualified) {
        continue;
      }

      const power1 = (effect1.Absorbed_Effect && effect1.Absorbed_Power_nID > -1)
        ? DatabaseAPI.Database.Power[effect1.Absorbed_Power_nID]
        : sourcePower;

      // Check if enhancements are allowed
      const isAllowed = powerMath.Enhancements.some(e => power1.Enhancements.includes(e));
      if (!isAllowed) {
        continue;
      }

      if (effectType === eEffectType.Enhancement && 
          (effect1.EffectType === eEffectType.DamageBuff || effect1.EffectType === eEffectType.Enhancement)) {
        const incAcc = powerMath.IgnoreEnhancement(eEnhance.Accuracy);
        const incRech = powerMath.IgnoreEnhancement(eEnhance.RechargeTime);
        const incEndDisc = powerMath.IgnoreEnhancement(eEnhance.EnduranceDiscount);
        
        switch (effect1.ETModifies) {
          case eEffectType.Accuracy:
            if (incAcc) {
              powerMath.Accuracy += effect1.BuffedMag;
            }
            continue;
          case eEffectType.EnduranceDiscount:
            if (incEndDisc) {
              powerMath.EndCost += effect1.BuffedMag;
            }
            continue;
          case eEffectType.InterruptTime:
            powerMath.InterruptTime += effect1.BuffedMag;
            continue;
          case eEffectType.Range:
            powerMath.Range += effect1.BuffedMag;
            continue;
          case eEffectType.RechargeTime:
            if (incRech) {
              powerMath.RechargeTime += effect1.BuffedMag;
            }
            continue;
          default:
            Toon.HandleDefaultIncarnateEnh(powerMath, effect1);
            break;
        }
      } else if (effect1.EffectType === eEffectType.GrantPower) {
        Toon.HandleGrantPowerIncarnate(powerMath, effect1, this._buffedPowers, effIdx, this.Archetype, hIDX);
      } else {
        powerMath.AbsorbEffects(power1, effect1.Duration, 0, this.Archetype, 1, true, effIdx, effIdx);
        
        const lastEffect = powerMath.Effects[powerMath.Effects.length - 1];
        if (lastEffect) {
          lastEffect.ToWho = eToWho.Target;
          lastEffect.Absorbed_Effect = true;
          lastEffect.isEnhancementEffect = effect1.isEnhancementEffect;
          lastEffect.Ticks = effect1.Ticks;
        }

        if (hIDX > -1 && this._buffedPowers[hIDX]) {
          this._buffedPowers[hIDX]!.AbsorbEffects(power1, effect1.Duration, 0, this.Archetype, 1, true, effIdx, effIdx);
          
          const buffedLastEffect = this._buffedPowers[hIDX]!.Effects[this._buffedPowers[hIDX]!.Effects.length - 1];
          if (buffedLastEffect) {
            buffedLastEffect.ToWho = effect1.ToWho;
            buffedLastEffect.Absorbed_Effect = true;
            buffedLastEffect.isEnhancementEffect = effect1.isEnhancementEffect;
            buffedLastEffect.Ticks = effect1.Ticks;
          }
        }
      }
    }

    // Calculate grant vs absorbed effect probabilities
    // Pass 1: gather GCM flags needed
    for (let i = len; i < powerMath.Effects.length; i++) {
      const grantFx = powerGrantsMap.GetGrantRoot(i - len);
      const fx = powerMath.Effects[i];
      if (grantFx && grantFx.EffectId && !gcmFlags.includes(grantFx.EffectId)) {
        gcmFlags.push(grantFx.EffectId);
      }

      if (fx.EffectId && !gcmFlags.includes(fx.EffectId)) {
        gcmFlags.push(fx.EffectId);
      }
    }

    // Pass 2: calc GCM flags scale (from source incarnate power only)
    for (const flag of gcmFlags) {
      if (MidsContext.Character?.ModifyEffects?.has(flag)) {
        continue;
      }

      const scale = sourcePower.Effects
        .filter(e => e.Reward === flag)
        .reduce((sum, e) => sum + e.Scale, 0);

      MidsContext.Character?.ModifyEffects?.set(flag, scale);
    }

    // Pass 3: recalculate probabilities
    for (let i = len; i < powerMath.Effects.length; i++) {
      const grantPowerProbability = powerGrantsMap.GetGrantProbability(i - len);
      powerMath.Effects[i].EffectiveProbability = powerMath.Effects[i].Probability * (grantPowerProbability ?? 1);

      if (hIDX > -1 && this._buffedPowers[hIDX]) {
        this._buffedPowers[hIDX]!.Effects[i].EffectiveProbability = 
          this._buffedPowers[hIDX]!.Effects[i].Probability * (grantPowerProbability ?? 1);
      }
    }
  }

  public GetBasePower(iPower: number = -1, nIDPower: number = -1): IPower | null {
    if (nIDPower < 0 || nIDPower > DatabaseAPI.Database.Power.length) {
      return null;
    }

    let powerMath = this.GBPA_SubPass0_AssemblePowerEntry(nIDPower, iPower);
    if (!powerMath) return null;
    
    powerMath = new Power(DatabaseAPI.GetPowerByFullName(powerMath.FullName) ?? powerMath);
    powerMath.ProcessExecutes();
    powerMath.AbsorbPetEffects();

    return powerMath;
  }

  public GetEnhancedPower(iPowerOrPower: number | IPower | null): IPower | null {
    if (typeof iPowerOrPower === 'number') {
      const iPower = iPowerOrPower;
      if (iPower < 0 || iPower >= this._buffedPowers.length) {
        return null;
      }
      return this._buffedPowers[iPower] ?? null;
    } else {
      const power = iPowerOrPower;
      if (!power) return null;
      return this._buffedPowers.find(e => e != null && e.FullName === power.FullName) ?? null;
    }
  }

  public GetEnhancements(iPowerSlot: number): number[] {
    if (iPowerSlot < 0 || !this.CurrentBuild || iPowerSlot >= this.CurrentBuild.Powers.length) {
      return [];
    }

    const powerEntry = this.CurrentBuild.Powers[iPowerSlot];
    if (!powerEntry || powerEntry.SlotCount <= 0) {
      return [];
    }

    return powerEntry.Slots.map(slot => slot.Enhancement.Enh).filter(enh => enh >= 0);
  }

  private static GetClassByName(iName: string): number {
    for (const enhCls of DatabaseAPI.Database.EnhancementClasses) {
      if (enhCls.ShortName.toLowerCase() === iName.toLowerCase()) {
        return enhCls.ID;
      }

      if (enhCls.Name.toLowerCase() === iName.toLowerCase()) {
        return enhCls.ID;
      }
    }

    return -1;
  }

  public GenerateBuffedPowers(powers: IPower[], basePowerHistoryIdx: number): { mathPowers: IPower[]; buffedPowers: IPower[] } | null {
    if (basePowerHistoryIdx < 0) {
      // If root power is not picked in build, get unbuffed powers data from the db directly
      const powersList = powers.map(e => {
        const dbPower = DatabaseAPI.Database.Power.find(f => f?.StaticIndex === e.StaticIndex);
        return dbPower ? new Power(dbPower) : new Power();
      });

      const clonedPowersList = powersList.map(p => new Power(p));
      return { mathPowers: clonedPowersList, buffedPowers: clonedPowersList };
    }

    if (!this.CurrentBuild) return null;

    const mathPowers: IPower[] = [];
    const buffedPowers: IPower[] = [];
    const basePower = this.CurrentBuild.Powers[basePowerHistoryIdx]?.Power ? new Power(this.CurrentBuild.Powers[basePowerHistoryIdx].Power) : null;
    if (!basePower) return null;

    powers.push(basePower); // Restore original attached power

    for (let i = 0; i < powers.length; i++) {
      if (!powers[i]) {
        continue;
      }

      const powerIndex = DatabaseAPI.Database.Power.findIndex(e => e?.StaticIndex === powers[i].StaticIndex);
      if (powerIndex >= 0) {
        if (this.CurrentBuild.Powers[basePowerHistoryIdx]) {
          this.CurrentBuild.Powers[basePowerHistoryIdx]!.NIDPower = powerIndex;
        }
        this.GenerateBuffedPowerArray();

        if (i < powers.length - 1) {
          mathPowers.push(this._mathPowers[basePowerHistoryIdx] ? new Power(this._mathPowers[basePowerHistoryIdx]) : new Power());
          buffedPowers.push(this._buffedPowers[basePowerHistoryIdx] ? new Power(this._buffedPowers[basePowerHistoryIdx]) : new Power());
        }
      }
    }

    return { mathPowers, buffedPowers };
  }

  // Note: UI-related methods (PopPowerInfo, PopPowersetInfo, PopSlottedEnhInfo, BuildEDItem)
  // These are for generating popup/tooltip data and would need PopUp types to be defined
  // For now, leaving as placeholders since they're UI-specific
  public PopPowerInfo(hIDX: number, pIDX: number): any {
    // Note: Returns PopUp.PopupData - would need PopUp types defined
    // This method generates popup information for a power
    return {};
  }

  public PopPowersetInfo(nIDPowerset: number, extraString: string = ""): any {
    // Note: Returns PopUp.PopupData - would need PopUp types defined
    // This method generates popup information for a powerset
    return {};
  }

  private PopSlottedEnhInfo(hIDX: number): any {
    // Note: Returns PopUp.Section - would need PopUp types defined
    // This method generates popup information for slotted enhancements
    return {};
  }

  private static BuildEDItem(index: number, value: number[], schedule: eSchedule[], edName: string, afterED: number[]): any {
    // Note: Returns PopUp.StringValue - would need PopUp types defined
    // This method builds an ED (Enhancement Diversification) item for display
    if (value[index] <= 0) {
      return { Text: "", TextColumn: "", tColor: "White", tColorColumn: "White", tSize: 0.9, tIndent: 0, tFormat: "Bold" };
    }

    const flag1 = value[index] > DatabaseAPI.Database.MultED[schedule[index]][0];
    const flag2 = value[index] > DatabaseAPI.Database.MultED[schedule[index]][1];
    const flag3 = value[index] > DatabaseAPI.Database.MultED[schedule[index]][2];
    
    const num1 = value[index] * 100;
    const num2 = Enhancement.ApplyED(schedule[index], value[index]) * 100;
    const str2 = `${(num1 + afterED[index] * 100).toFixed(2)}%`;
    const str3 = `${(num2 + afterED[index] * 100).toFixed(2)}%`;
    
    let str4: string;
    let color: string;
    if (Math.round(num1 - num2) > 0) {
      str4 = `${str3}  (Pre-ED: ${str2})`;
      if (flag3) {
        color = "Red";
      } else if (flag2) {
        color = "Yellow";
      } else if (flag1) {
        color = "Green";
      } else {
        color = "White";
      }
    } else {
      str4 = str3;
      color = "Title";
    }

    return {
      Text: `${edName}:`,
      TextColumn: str4,
      tColor: "Title",
      tColorColumn: color,
      tSize: 0.9,
      tIndent: 1,
      tFormat: "Bold"
    };
  }

  private static IsClickPower(power: IPower | null): boolean {
    return power != null && power.PowerType === ePowerType.Click && !power.ClickBuff;
  }

  private CalculateAndApplyEffects(tPwr: IPower, nBuffs: any, enhancementPass: boolean): void {
    // GlobalBoost is handled elsewhere; skip here
    if (tPwr.PowerType === ePowerType.GlobalBoost) {
      return;
    }

    // Local helpers
    const TargetsSelfOrAll = (fx: IEffect): boolean =>
      fx.ToWho === eToWho.Self || fx.ToWho === eToWho.All;

    const IsMaxSpeedCap = (fx: IEffect, mod: eEffectType): boolean =>
      fx.EffectType !== eEffectType.ResEffect && fx.ETModifies === mod && fx.Aspect === eAspect.Max;

    const IsSpeedScalar = (mod: eEffectType): boolean =>
      mod === eEffectType.SpeedRunning || mod === eEffectType.SpeedFlying || 
      mod === eEffectType.SpeedJumping || mod === eEffectType.JumpHeight;

    const IsDamageBuffOrEnhancement = (fx: IEffect): boolean =>
      fx.EffectType === eEffectType.DamageBuff || fx.EffectType === eEffectType.Enhancement;

    const IsGlobalAccuracySource = (src: IPower): boolean =>
      src === MidsContext.Character?.CurrentBuild?.SetBonusVirtualPower ||
      src.PowerType === ePowerType.GlobalBoost;

    const shortFx = new ShortFXImpl(); // main per-effect-type accumulator
    const sFxSelf = new ShortFXImpl(); // used only for Max* speed self caps

    // Iterate effect-types by the stat array length
    for (let effIndex = 0; effIndex < nBuffs.Effect.length; effIndex++) {
      const iEffect = effIndex as eEffectType;

      // Damage is never accumulated via this pass
      if (iEffect === eEffectType.Damage) {
        continue;
      }

      // Gather magnitudes for this effect-type
      if (enhancementPass && iEffect !== eEffectType.DamageBuff) {
        // Enhancement scan
        shortFx.Assign(tPwr.GetEnhancementMagSum(iEffect, -1));
      } else {
        // Non-enhancement scan with special cases for Max* speed caps
        switch (iEffect) {
          case eEffectType.MaxRunSpeed:
            shortFx.Assign(tPwr.GetEffectMagSum(eEffectType.SpeedRunning, false, false, false, true));
            sFxSelf.Assign(tPwr.GetEffectMagSum(eEffectType.MaxRunSpeed, false, true));
            nBuffs.Effect[eStatType.MaxRunSpeed] += sFxSelf.Sum;
            break;
          case eEffectType.MaxJumpSpeed:
            shortFx.Assign(tPwr.GetEffectMagSum(eEffectType.SpeedJumping, false, false, false, true));
            sFxSelf.Assign(tPwr.GetEffectMagSum(eEffectType.MaxJumpSpeed, false, true));
            nBuffs.Effect[eStatType.MaxJumpSpeed] += sFxSelf.Sum;
            break;
          case eEffectType.MaxFlySpeed:
            shortFx.Assign(tPwr.GetEffectMagSum(eEffectType.SpeedFlying, false, false, false, true));
            sFxSelf.Assign(tPwr.GetEffectMagSum(eEffectType.MaxFlySpeed, false, true));
            nBuffs.Effect[eStatType.MaxFlySpeed] += sFxSelf.Sum;
            break;
          default:
            shortFx.Assign(tPwr.GetEffectMagSum(iEffect));
            break;
        }
      }

      // Apply each contributing sub-effect instance
      for (let shortFxIdx = 0; shortFxIdx < shortFx.Value.length; shortFxIdx++) {
        const fx = tPwr.Effects[shortFx.Index![shortFxIdx]];
        if (!TargetsSelfOrAll(fx)) {
          continue;
        }

        let value = shortFx.Value[shortFxIdx];

        // Enhancement "Range" is modeled as a buff in MR: include during non-enhancement pass
        if (!enhancementPass && fx.EffectType === eEffectType.Enhancement && fx.ETModifies === eEffectType.Range) {
          nBuffs.Effect[eEffectType.Range] += value;
        }

        // Effects absorbed from a GlobalBoost power are excluded here
        if (fx.Absorbed_PowerType === ePowerType.GlobalBoost) {
          continue;
        }

        // Non-enhancement-only status and resistance buckets
        if (!enhancementPass) {
          switch (fx.EffectType) {
            case eEffectType.Mez:
              nBuffs.StatusProtection[fx.MezType] += value;
              break;
            case eEffectType.MezResist:
              nBuffs.StatusResistance[fx.MezType] += value;
              break;
            case eEffectType.ResEffect:
              nBuffs.DebuffResistance[fx.ETModifies] += value;
              break;
          }
        }

        // Enhancement pass: only applies when the source effect is DamageBuff or Enhancement
        if (enhancementPass && IsDamageBuffOrEnhancement(fx)) {
          switch (fx.ETModifies) {
            case eEffectType.Mez:
              nBuffs.Mez[fx.MezType] += value;
              continue;
            case eEffectType.Defense:
              if (fx.DamageType !== eDamage.None) {
                nBuffs.Defense[fx.DamageType] += value;
              } else {
                nBuffs.Effect[effIndex] += value; // generic defense
              }
              continue;
            case eEffectType.Resistance:
              if (fx.DamageType !== eDamage.None) {
                nBuffs.Resistance[fx.DamageType] += value;
              } else {
                nBuffs.Effect[effIndex] += value; // generic resistance
              }
              continue;
            default:
              // DamageBuff aggregation (except for noted special-cases)
              if (iEffect === eEffectType.DamageBuff) {
                const isDefiance =
                  (fx.isEnhancementEffect === true && fx.EffectClass === eEffectClass.Tertiary) ||
                  fx.ValidateConditional("Active", "Defiance") ||
                  fx.SpecialCase === eSpecialCase.Defiance;

                if (!isDefiance) {
                  nBuffs.Damage[fx.DamageType] += value;
                }
                continue;
              }

              // Skip pure Accuracy *enhancements* here
              if (fx.ETModifies === eEffectType.Accuracy) {
                continue;
              }

              // Speed scalars respect buff/debuff channels
              if (IsSpeedScalar(fx.ETModifies)) {
                if (fx.buffMode !== eBuffMode.Debuff) {
                  nBuffs.Effect[fx.ETModifies] += value;
                } else {
                  nBuffs.EffectAux[fx.ETModifies] += value;
                }
                continue;
              }

              // Fallback enhancement contribution
              nBuffs.Effect[effIndex] += value;
              continue;
          }
        }

        // Non-enhancement (or remaining) contributions and special cases

        // Max Endurance
        if (fx.EffectType === eEffectType.Endurance && fx.Aspect === eAspect.Max) {
          nBuffs.MaxEnd += value;
          continue;
        }

        // Non-enhancement mez & mez-resist
        if (!enhancementPass && fx.EffectType !== eEffectType.ResEffect && fx.ETModifies === eEffectType.Mez) {
          nBuffs.Mez[fx.MezType] += value;
          continue;
        }
        if (!enhancementPass && fx.EffectType !== eEffectType.ResEffect && fx.ETModifies === eEffectType.MezResist) {
          nBuffs.MezRes[fx.MezType] += value;
          continue;
        }

        // Non-enhancement typed buckets for Defense/Resistance/Elusivity
        if (!enhancementPass && iEffect === eEffectType.Defense && fx.DamageType !== eDamage.None) {
          nBuffs.Defense[fx.DamageType] += value;
          continue;
        }
        if (!enhancementPass && iEffect === eEffectType.Resistance && fx.DamageType !== eDamage.None) {
          nBuffs.Resistance[fx.DamageType] += value;
          continue;
        }
        if (!enhancementPass && iEffect === eEffectType.Elusivity && fx.DamageType !== eDamage.None) {
          nBuffs.Elusivity[fx.DamageType] += value;
          continue;
        }

        // Only true/global Accuracy (set-bonus / GlobalBoost) contributes to BuffAcc
        if (!enhancementPass && fx.EffectType !== eEffectType.ResEffect && fx.ETModifies === eEffectType.Accuracy) {
          if (IsGlobalAccuracySource(tPwr)) {
            nBuffs.Effect[eStatType.BuffAcc] += value; // global accuracy
          } else {
            nBuffs.Effect[eStatType.ToHit] += value; // normal buffs behave as ToHit
          }
          continue;
        }

        // Max speed caps from scalar effects
        if (!enhancementPass && IsMaxSpeedCap(fx, eEffectType.SpeedRunning)) {
          nBuffs.Effect[eStatType.MaxRunSpeed] += value;
          continue;
        }
        if (!enhancementPass && IsMaxSpeedCap(fx, eEffectType.SpeedFlying)) {
          nBuffs.Effect[eStatType.MaxFlySpeed] += value;
          continue;
        }
        if (!enhancementPass && IsMaxSpeedCap(fx, eEffectType.SpeedJumping)) {
          nBuffs.Effect[eStatType.MaxJumpSpeed] += value;
          continue;
        }

        // ToHit (non-enhancement) - ignore tertiary enhancement-class side paths
        if (!enhancementPass && iEffect === eEffectType.ToHit) {
          if (!(fx.isEnhancementEffect === true && fx.EffectClass === eEffectClass.Tertiary)) {
            nBuffs.Effect[effIndex] += value;
          }
          continue;
        }

        // Generic non-enhancement effect accumulation
        if (enhancementPass) {
          continue;
        }

        // Normalize Absorb from % to flat HP when needed
        if (effIndex === eStatType.Absorb && fx.DisplayPercentage) {
          value *= (MidsContext.Character?.Totals.HPMax ?? 0);
        }

        nBuffs.Effect[effIndex] += value;

        // Subtract the "base magnitude" for click powers
        if (Toon.IsClickPower(fx.GetPower()) && !fx.BuildEffectString().includes("From Enh")) {
          nBuffs.Effect[effIndex] -= fx.Mag;
        }
      }
    }
  }

  private GBD_Totals(): void {
    if (!this.Totals || !this.TotalsCapped) return;
    this.Totals.Init();
    this.TotalsCapped.Init();
    let canFly = false;
    
    for (let index1 = 0; index1 < (this.CurrentBuild?.Powers.length ?? 0); index1++) {
      const powerEntry = this.CurrentBuild?.Powers[index1];
      if (!powerEntry) continue;
      if (!(powerEntry.StatInclude && this._buffedPowers[index1] != null)) {
        continue;
      }

      const buffedPower = this._buffedPowers[index1];
      if (!buffedPower) continue;
      if (buffedPower.PowerType === ePowerType.Toggle) {
        this.Totals.EndUse += buffedPower.ToggleCost;
      }

      for (const buffedPwr of buffedPower.Effects) {
        if (buffedPwr.EffectType === eEffectType.Fly && buffedPwr.Mag > 0) {
          canFly = true;
        }
      }
    }

    if (Math.abs(this._selfBuffs.Defense[0]) > Number.EPSILON) {
      for (let index = 1; index < this._selfBuffs.Defense.length; index++) {
        this._selfBuffs.Defense[index] += this._selfBuffs.Defense[0];
      }
    }

    for (let index = 0; index < this._selfBuffs.Defense.length; index++) {
      this.Totals.Def[index] = this._selfBuffs.Defense[index];
      this.Totals.Res[index] = this._selfBuffs.Resistance[index];
      this.Totals.Elusivity[index] = this._selfBuffs.Elusivity[index];
    }

    for (let index = 0; index < this._selfBuffs.StatusProtection.length; index++)
      {
        this.Totals.Mez[index] = this._selfBuffs.StatusProtection[index];
        this.Totals.MezRes[index] = this._selfBuffs.StatusResistance[index] * 100;
      }
      
      for (let index = 0; index < this._selfBuffs.DebuffResistance.length; index++)
      {
        this.Totals.DebuffRes[index] = this._selfBuffs.DebuffResistance[index] * 100;
      }
      
      this.Totals.EndMax = this._selfBuffs.MaxEnd;
      this.Totals.BuffAcc = this._selfEnhance.Effect[eStatType.BuffAcc] + this._selfBuffs.Effect[eStatType.BuffAcc];
      this.Totals.BuffEndRdx = this._selfEnhance.Effect[eStatType.BuffEndRdx];
      this.Totals.BuffHaste = this._selfEnhance.Effect[eStatType.Haste] + this._selfBuffs.Effect[eStatType.Haste];
      this.Totals.BuffToHit = this._selfBuffs.Effect[eStatType.ToHit];
      this.Totals.Perception = Statistics.BasePerception * (1 + this._selfBuffs.Effect[eStatType.Perception]);
      this.Totals.StealthPvE = this._selfBuffs.Effect[eStatType.StealthPvE];
      this.Totals.StealthPvP = this._selfBuffs.Effect[eStatType.StealthPvP];
      this.Totals.ThreatLevel = this._selfBuffs.Effect[eStatType.ThreatLevel];
      this.Totals.HPRegen = this._selfBuffs.Effect[eStatType.HPRegen];
      this.Totals.EndRec = this._selfBuffs.Effect[eStatType.EndRec];
      this.Totals.Absorb = this._selfBuffs.Effect[eStatType.Absorb];
      this.Totals.BuffRange = this._selfBuffs.Effect[eStatType.Range];
      
      this.Totals.FlySpd = (1 + Math.max(this._selfBuffs.Effect[eStatType.FlySpeed], -0.9)) * Statistics.BaseFlySpeed;
      this.Totals.RunSpd = (1 + Math.max(this._selfBuffs.Effect[eStatType.RunSpeed], -0.9)) * Statistics.BaseRunSpeed;
      this.Totals.JumpSpd = (1 + Math.max(this._selfBuffs.Effect[eStatType.JumpSpeed], -0.9)) * Statistics.BaseJumpSpeed;
      this.Totals.JumpHeight = (1 + Math.max(this._selfBuffs.Effect[eStatType.JumpHeight], -0.9)) * Statistics.BaseJumpHeight;
      
      this.Totals.MaxFlySpd = Statistics.MaxFlySpeed + this._selfBuffs.Effect[eStatType.MaxFlySpeed] * Statistics.BaseFlySpeed;
      this.Totals.MaxRunSpd = Statistics.MaxRunSpeed + this._selfBuffs.Effect[eStatType.MaxRunSpeed] * Statistics.BaseRunSpeed;
      this.Totals.MaxJumpSpd = Statistics.MaxJumpSpeed + this._selfBuffs.Effect[eStatType.MaxJumpSpeed] * Statistics.BaseJumpSpeed;
      // No MaxJumpHeight
      
      // Apply MaxMax
      this.Totals.FlySpd = Math.min(this.Totals.FlySpd, DatabaseAPI.ServerData.MaxMaxFlySpeed); // Statistics.BaseFlySpeed * 8.19f == 257.985
      this.Totals.RunSpd = Math.min(this.Totals.RunSpd, DatabaseAPI.ServerData.MaxMaxRunSpeed); // Statistics.BaseRunSpeed * 8.398f == 166.257
      this.Totals.JumpSpd = Math.min(this.Totals.JumpSpd, DatabaseAPI.ServerData.MaxMaxJumpSpeed); // Statistics.BaseJumpSpeed * 7.917f == 176.358
      
      this.Totals.HPMax = this._selfBuffs.Effect[eStatType.HPMax] + (this.Archetype?.Hitpoints ?? 0);
      if (!canFly)
      {
        this.Totals.FlySpd = 0;
      }
      
      let maxDmgBuff = -1000;
      let minDmgBuff = -1000;
      let avgDmgBuff = 0;
      for (let index = 0; index < this._selfBuffs.Damage.length; index++)
      {
          if (index <= 0 || index >= 9)
          {
              continue;
          }
      
          if (this._selfEnhance.Damage[index] > maxDmgBuff)
          {
              maxDmgBuff = this._selfEnhance.Damage[index];
          }
      
          if (this._selfEnhance.Damage[index] < minDmgBuff)
          {
              minDmgBuff = this._selfEnhance.Damage[index];
          }
      
          avgDmgBuff += this._selfEnhance.Damage[index];
      }
      
      avgDmgBuff /= this._selfEnhance.Damage.length;
      if (maxDmgBuff - avgDmgBuff < avgDmgBuff - minDmgBuff)
      {
        this.Totals.BuffDam = maxDmgBuff;
      }
      else if ((maxDmgBuff - avgDmgBuff > avgDmgBuff - minDmgBuff) && (minDmgBuff > 0))
      {
        this.Totals.BuffDam = minDmgBuff;
      }
      else
      {
        this.Totals.BuffDam = maxDmgBuff;
      }
      
      this.ApplyPvpDr();
      this.TotalsCapped.Assign(this.Totals);
      this.TotalsCapped.BuffDam = Math.min(this.TotalsCapped.BuffDam, this.Archetype!.DamageCap - 1);
      this.TotalsCapped.BuffHaste = Math.min(this.TotalsCapped.BuffHaste, this.Archetype!.RechargeCap - 1);
      this.TotalsCapped.HPRegen = Math.min(this.TotalsCapped.HPRegen, this.Archetype!.RegenCap - 1);
      this.TotalsCapped.EndRec = Math.min(this.TotalsCapped.EndRec, this.Archetype!.RecoveryCap - 1);
      for (let index = 0; index < this.TotalsCapped.Res.length; index++)
      {
        this.TotalsCapped.Res[index] = Math.min(this.TotalsCapped.Res[index], this.Archetype!.ResCap);
      }
      
      if (this.Archetype!.HPCap > 0)
      {
        this.TotalsCapped.HPMax = Math.min(this.TotalsCapped.HPMax, this.Archetype!.HPCap);
        this.TotalsCapped.Absorb = Math.min(this.TotalsCapped.Absorb, this.TotalsCapped.HPMax);
      }
      
      this.TotalsCapped.RunSpd = Math.min(this.TotalsCapped.RunSpd, this.Totals.MaxRunSpd);
      this.TotalsCapped.JumpSpd = Math.min(this.TotalsCapped.JumpSpd, this.Totals.MaxJumpSpd);
      this.TotalsCapped.FlySpd = Math.min(this.TotalsCapped.FlySpd, this.Totals.MaxFlySpd);
      this.TotalsCapped.JumpHeight = Math.min(this.TotalsCapped.JumpHeight, DatabaseAPI.ServerData.MaxJumpHeight); // Statistics.BaseJumpHeight * 50 == 200 (MaxMax is at 300 but unused)
      this.TotalsCapped.Perception = Math.min(this.TotalsCapped.Perception, this.Archetype!.PerceptionCap);
  }

  private ApplyGlobalEnhancements(): void {
    const grantedPowers: GrantedPowerInfo[] = [];
    
    // Fetch buffed powers that are non empty, non incarnates
    const allowedSets = [ePowerSetType.Ancillary, ePowerSetType.Pool, ePowerSetType.Primary, ePowerSetType.Secondary];
    const mainPowers = this._mathPowers.filter(p => 
      p != null && p.StaticIndex >= 0 && allowedSets.includes(p.GetPowerSet()?.SetType ?? ePowerSetType.None)
    );

    // Inventory and collect GrantPower effects that lead to GlobalBoost powers
    for (const p of mainPowers) {
      if (!p) continue;
      const grantedPowersFx = p.Effects.filter(fx => fx.EffectType === eEffectType.GrantPower);
      
      if (grantedPowersFx.length <= 0) continue;

      for (const gFx of grantedPowersFx) {
        const gPower = DatabaseAPI.GetPowerByFullName(gFx.Summon);
        if (!gPower || gPower.PowerType !== ePowerType.GlobalBoost) continue;

        // Verify if the list doesn't have yet the target granted power
        const hasPower = grantedPowers.some(gp => gp.TargetPower.FullName === gPower.FullName);
        if (hasPower) continue;
        
        grantedPowers.push({
          GrantPowerFX: gFx.Clone(),
          TargetPower: new Power(gPower),
          SourcePower: new Power(p)
        });

        // Special flag to get rid of the GrantPower effect from source
        if (!gPower.SkipMax) continue;

        const fxList = [...p.Effects];
        const gFxIndex = fxList.findIndex(fx => fx === gFx);
        if (gFxIndex >= 0) {
          fxList.splice(gFxIndex, 1);
          p.Effects = fxList;
        }
        this.RemoveGrantEffectIndirect(this._mathPowers, p, gFx.Summon);
        
        if (!MidsContext.Character?.CurrentBuild?.Powers) continue;

        const buildPowerPicked = MidsContext.Character.CurrentBuild.Powers.filter(pe => pe?.Power != null);
        const buildPowerIdx = buildPowerPicked.findIndex(pe => pe?.Power?.FullName === p.FullName);
        if (buildPowerIdx < 0) continue;

        const buildPower = buildPowerPicked[buildPowerIdx]?.Power ? new Power(buildPowerPicked[buildPowerIdx]!.Power) : null;
        if (!buildPower) continue;
        const gFxIdxBuild = buildPower.Effects.findIndex(fx => 
          fx.EffectType === eEffectType.GrantPower && fx.Summon === gFx.Summon
        );
        if (gFxIdxBuild < 0) continue;

        buildPower.Effects[gFxIdxBuild].EffectClass = eEffectClass.Ignored;
        buildPower.Effects[gFxIdxBuild].Probability = 0;
        buildPower.Effects[gFxIdxBuild].Scale = 0;
      }
    }

    for (const gp of grantedPowers) {
      for (const p of mainPowers) {
        if (!p) continue;
        // Check if power already has the target granted power
        const hasBoost = p.FullName === gp.SourcePower.FullName;
        if (hasBoost) continue;

        const hasBoostInEffects = p.Effects.some(fx => 
          fx.EffectType === eEffectType.GrantPower && fx.Summon === gp.TargetPower.FullName
        );
        if (hasBoostInEffects) continue;

        // Check if power is eligible to the boost effect: Must have at least one type of effect in common
        const bPowerFxIdentifiers: FxIdentifierKey[] = p.Effects.map(pfx => ({
          EffectType: pfx.EffectType,
          DamageType: eDamage.None,
          MezType: pfx.MezType,
          ETModifies: pfx.ETModifies,
          Summon: pfx.Summon
        }));

        const gPowerFxIdentifiers: FxIdentifierKey[] = gp.TargetPower.Effects.map(pfx => ({
          EffectType: pfx.EffectType,
          DamageType: eDamage.None,
          MezType: pfx.MezType,
          ETModifies: pfx.ETModifies,
          Summon: pfx.Summon
        }));

        // Check for intersection
        const hasCommonEffect = bPowerFxIdentifiers.some(bFx => 
          gPowerFxIdentifiers.some(gFx => 
            bFx.EffectType === gFx.EffectType &&
            bFx.MezType === gFx.MezType &&
            bFx.ETModifies === gFx.ETModifies &&
            bFx.Summon === gFx.Summon
          )
        );
        if (!hasCommonEffect) continue;

        const fxList = [...p.Effects];
        for (const gpFx of gp.TargetPower.Effects) {
          fxList.push(gpFx.Clone());
        }
        p.Effects = fxList;
      }
    }
  }

  private SetPower_NID(index: number, nIDPower: number): void {
    if (!this.CurrentBuild || index < 0 || index >= this.CurrentBuild.Powers.length) {
      return;
    }

    const power1 = DatabaseAPI.Database.Power[nIDPower];
    if (power1 != null) {
      const power2 = this.CurrentBuild.Powers[index];
      if (!power2) return;

      power2.NIDPowerset = power1.PowerSetID;
      power2.IDXPower = power1.PowerSetIndex;
      power2.NIDPower = power1.PowerIndex;
      
      if (power1.NIDSubPower && power1.NIDSubPower.length > 0) {
        power2.SubPowers = new Array(power1.NIDSubPower.length);
        for (let i = 0; i < power2.SubPowers.length; i++) {
          const subPowerNID = power1.NIDSubPower[i];
          if (subPowerNID >= 0 && subPowerNID < DatabaseAPI.Database.Power.length) {
            const subPower = DatabaseAPI.Database.Power[subPowerNID];
            power2.SubPowers[i] = {
              nIDPower: subPowerNID,
              Powerset: subPower?.PowerSetID ?? -1,
              Power: subPower?.PowerSetIndex ?? -1,
              StatInclude: false
            } as any; // PowerSubEntry - Assign is a method, not a property
          }
        }
      }

      if (power1.Slottable && power2.Slots.length === 0) {
        power2.AddSlot(power2.Level);
      }

      if (this.CurrentBuild.Powers[index]) {
        this.CurrentBuild.Powers[index]!.StatInclude = 
        (power1.PowerType === ePowerType.Toggle || power1.PowerType === ePowerType.Auto_) && 
        power1.AlwaysToggle;
      }

      if (this.CurrentBuild.Powers[index]) {
        this.CurrentBuild.Powers[index]!.ValidateSlots();
      }
    }
  }

  private RemoveGrantEffectIndirect(basePower: IPower[], targetPower: IPower, summon: string): void {
    // Note: Implementation would remove grant effect indirect
    const basePowerPicked = basePower.filter(bp => bp != null);
    const basePowerIdx = basePowerPicked.findIndex(bp => bp.FullName === targetPower.FullName);
    if (basePowerIdx < 0) return;

    const fxListBase = [...basePowerPicked[basePowerIdx].Effects];
    const gFxIdxBase = fxListBase.findIndex(fx => 
      fx.EffectType === eEffectType.GrantPower && fx.Summon === summon
    );
    if (gFxIdxBase < 0) return;

    fxListBase.splice(gFxIdxBase, 1);
    basePowerPicked[basePowerIdx].Effects = fxListBase;
  }

  // File I/O methods
  public async Load(iFileName: string, mStream?: any): Promise<boolean> {
    let buildString = "";
    
    // From file
    if (!mStream || iFileName) {
      try {
        const response = await fetch(iFileName);
        buildString = await response.text();
        // Note: mStream would be created from response if needed
      } catch (error) {
        console.error("Failed to load file:", error);
        return false;
      }
    }
    // From clipboard (old datachunk) - Note: Clipboard access is UI-specific
    else if (mStream) {
      // Note: Clipboard handling would need UI-specific implementation
      console.warn("Clipboard loading not implemented - requires UI context");
      return false;
    } else {
      console.error("Cannot load build: no data to load from.");
      return false;
    }

    // Try new format first
    // Note: MidsCharacterFileFormat.MxDExtractAndLoad needs to be implemented
    // For now, we'll always try old format since MxDExtractAndLoad is not implemented
    // const loadResult = MidsCharacterFileFormat.MxDExtractAndLoad(mStream);
    // if (loadResult === MidsCharacterFileFormat.eLoadReturnCode.Success) {
    //   this.ResetLevel();
    //   this.PoolShuffle();
    //   // Note: I9Gfx.OriginIndex = this.Origin; would be set here
    //   this.Validate();
    //   // Note: this.ReadMetadata(buildString); would be called here
    //   return true;
    // }
    // if (loadResult === MidsCharacterFileFormat.eLoadReturnCode.Failure) {
    //   return false;
    // }
    // // IsOldFormat - continue to old format reading below

    // Fall back to old format
    try {
      const response = await fetch(iFileName);
      const text = await response.text();
      const lines = text.split('\n');
      const flag = await this.ReadInternalData(lines);
      this.ResetLevel();
      this.PoolShuffle();
      // Note: I9Gfx.OriginIndex = this.Origin; would be set here
      this.Validate();
      // Note: this.ReadMetadata(buildString); would be called here
      return flag;
    } catch (error) {
      console.error("Failed to read old format:", error);
      return false;
    }
  }

  public async Save(iFileName: string): Promise<boolean> {
    if (!this.Archetype) {
      this.Archetype = DatabaseAPI.Database.Classes[0];
    }
    if (this.Origin > (this.Archetype.Origin?.length ?? 0) - 1) {
      this.Origin = (this.Archetype.Origin?.length ?? 0) - 1;
    }
    
    // Note: MidsCharacterFileFormat.MxDBuildSaveString needs to be implemented
    const saveText = ""; // Placeholder: MidsCharacterFileFormat.MxDBuildSaveString(true, false);
    if (!saveText) {
      console.error("Save failed - save function returned empty data.");
      return false;
    }

    // Note: ClsOutput.Build would generate header text
    const str2 = "\r\n\r\n"; // Placeholder for header
    
    try {
      const fullText = str2 + saveText;
      await fetch(iFileName, {
        method: 'PUT',
        body: fullText,
        headers: { 'Content-Type': 'text/plain' }
      });
      return true;
    } catch (error) {
      console.error("Failed to save file:", error);
      return false;
    }
  }

  public async StringToInternalData(iString: string): Promise<boolean> {
    // Check if it's a valid build format
    const hasNewFormat = iString.indexOf("|MxD[uz];") >= 0;
    const hasLegacyFormat = iString.indexOf("|MxD|") >= 0;
    
    if (!hasNewFormat && !hasLegacyFormat) {
      // Try forum post format
      if (iString.indexOf("Primary") > -1 && iString.indexOf("Secondary") > -1) {
        // Note: clsUniversalImport.InterpretForumPost would be called here
        console.warn("Forum post import not implemented");
        return false;
      } else {
        console.warn("Unable to recognize data format.");
        return false;
      }
    }

    // Clean up string
    let cleanedString = iString;
    if (!hasNewFormat || iString.indexOf("|MxD[uz];") < 0) {
      cleanedString = cleanedString.replace(/\+\r\n\+/g, "");
      cleanedString = cleanedString.replace(/\+ \r\n\+/g, "");
    }

    // Remove HTML tags
    cleanedString = cleanedString
      .replace(/\[Email\]/gi, "")
      .replace(/\[\/Email\]/gi, "")
      .replace(/\[email\]/gi, "")
      .replace(/\[\/email\]/gi, "")
      .replace(/\[EMAIL\]/gi, "")
      .replace(/\[\/EMAIL\]/gi, "")
      .replace(/\[URL\]/gi, "")
      .replace(/\[\/URL\]/gi, "")
      .replace(/\[url\]/gi, "")
      .replace(/\[\/url\]/gi, "")
      .replace(/\[Url\]/gi, "")
      .replace(/\[\/Url\]/gi, "");

    // Write to temp file and load
    try {
      const tempPath = "import.tmp"; // Note: Would use proper temp path
      await fetch(tempPath, {
        method: 'PUT',
        body: cleanedString,
        headers: { 'Content-Type': 'text/plain' }
      });

      const loaded = await this.Load(tempPath);
      if (loaded) {
        console.log("Build data imported!");
        return true;
      } else {
        console.warn("Build data couldn't be imported.");
        return false;
      }
    } catch (error) {
      console.error("Failed to import:", error);
      return false;
    }
  }

  private async ReadInternalData(lines: string[]): Promise<boolean> {
    // Note: This is a simplified version - full implementation would parse line by line
    // Looking for header
    let headerFound = false;
    let headerIndex = -1;
    let headerType = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.indexOf("|MxD|") >= 0 || line.indexOf("|MxDz;") >= 0 || 
          line.indexOf("|MxDu;") >= 0 || line.indexOf("|MxD|") >= 0) {
        headerFound = true;
        headerIndex = i;
        // Extract header type
        const match = line.match(/\|MxD([uz]?)\|/);
        if (match) {
          headerType = match[1] || "";
        }
        break;
      }
    }

    if (!headerFound) {
      console.error("Reached end of data without finding header.");
      return false;
    }

    // Check if uncompressed
    if (headerType === "" || headerType === "u") {
      return await this.ReadInternalDataUC(lines.slice(headerIndex));
    }

    // Compressed format - would need decompression
    // Note: Full implementation would decompress and then call ReadInternalDataUC
    console.warn("Compressed format reading not fully implemented");
    return false;
  }

  private async ReadInternalDataUC(lines: string[]): Promise<boolean> {
    // Note: This is a placeholder - full implementation would parse the entire format
    // This method reads uncompressed format
    if (lines.length === 0) return false;

    const firstLine = lines[0];
    const parts = firstLine.split("|");
    if (parts.length < 2) return false;

    const versionStr = parts[1].replace(",", ".");
    const nVer = parseFloat(versionStr);

    if (nVer < Toon.BuildFormatChange1) {
      return await this.ImportInternalDataUC(lines, nVer);
    }

    // Version check messages would be shown here
    if (nVer < Toon.BuildFormatChange2 && Math.abs(nVer - Toon.BuildFormatChange1) > 0.0001) {
      console.warn("The data being loaded was saved by an older version, attempting conversion.");
    } else if (nVer > Toon.BuildFormatChange2) {
      console.warn(`The data being loaded was saved by a newer version (File format v ${nVer.toFixed(4)}, expected ${Toon.BuildFormatChange2.toFixed(4)}).`);
    }

    // Parse character data
    if (lines.length < 2) return false;
    const charData = lines[1].split("|");
    if (charData.length < 3) return false;

    this.Name = charData[0];
    this.Archetype = DatabaseAPI.GetArchetypeByName(charData[2]);
    this.Origin = DatabaseAPI.GetOriginByName(this.Archetype, charData[1]);

    // Note: Full implementation would continue parsing powersets, powers, slots, etc.
    // This is a simplified version
    return true;
  }

  private async ImportInternalDataUC(lines: string[], nVer: number): Promise<boolean> {
    // Note: This is a placeholder for old format import
    // Full implementation would parse old format data
    if (nVer < 1.0) {
      console.warn("The data being loaded was saved by an older version and may not load correctly.");
    }

    // Note: Full implementation would parse old format
    return false;
  }

  private static IoGrab2(lines: string[], startIndex: number, delimiter: string = ";", fakeLf: string = ""): string[] {
    // Note: This simulates FileIO.ReadLineUnlimited and parsing
    if (startIndex >= lines.length) return [];
    
    let line = lines[startIndex];
    if (fakeLf) {
      line = line.replace(fakeLf, "\n");
    }

    let strArray = line.split(delimiter);
    if (strArray.length < 2) {
      strArray = line.split(";");
    }

    // Strip whitespace
    return strArray.map(s => s.trim());
  }

  public SkPowerState(nIDPower: number, outMessage: { message: string }): string {
    // Note: Returns EItemState enum value as string
    if (nIDPower < 0) {
      return "Disabled";
    }

    const power = DatabaseAPI.Database.Power[nIDPower];
    if (!power) return "Disabled";

    const inToonHistory = this.CurrentBuild?.FindInToonHistory(nIDPower) ?? -1;
    const foundInBuild = inToonHistory > -1;

    const num1 = (MidsContext.Config?.BuildMode === dmModes.Normal && this.RequestedLevel > -1) ||
                 (MidsContext.Config?.BuildMode === dmModes.Respec && this.RequestedLevel > -1)
      ? this.RequestedLevel
      : this.Level;

    const nLevel = foundInBuild && this.CurrentBuild
      ? this.CurrentBuild.Powers[inToonHistory]?.Level ?? 0
      : num1;

    outMessage.message = "";
    const flag2 = this.CurrentBuild?.MeetsRequirement(power, nLevel) ?? false;

    if (this.PowersetMutexClash(nIDPower)) {
      outMessage.message = `You cannot take the ${this.Powersets[0]?.DisplayName} and ${this.Powersets[1]?.DisplayName} sets together.`;
      return "Heading";
    }

    if (!foundInBuild) {
      return flag2 && num1 >= (power.Level - 1) ? "Enabled" : "Disabled";
    }

    // Check primary/secondary level 1 power requirements
    for (let num2 = 0; num2 <= 1; num2++) {
      const setType = num2 === 0 ? ePowerSetType.Primary : ePowerSetType.Secondary;
      const powersetType = num2 === 0 ? "Primary" : "Secondary";
      const index1 = num2;

      if (power.GetPowerSet()?.SetType === setType && power.Level - 1 === 0) {
        const numArray = DatabaseAPI.NidPowersAtLevelBranch(0, this.Powersets[powersetType === "Primary" ? 0 : 1]?.nID ?? -1);
        let flag3 = false;
        let num3 = 0;

        for (const k of numArray) {
          if (this.CurrentBuild?.Powers[index1]?.NIDPower === k) {
            flag3 = true;
          } else if ((this.CurrentBuild?.FindInToonHistory(k) ?? -1) > -1) {
            num3++;
          }
        }

        if ((this.CurrentBuild?.Powers[index1]?.NIDPowerset ?? 0) > 0 && !flag3 || num3 === numArray.length) {
          outMessage.message = `This power has been placed in a way that is not possible in-game. One of the ${numArray.length} level 1 powers from your ${powersetType} set must be taken at level 1.`;
          return "Invalid";
        }
      }
    }

    if (flag2) {
      return num1 <= power.Level - 1 ? "SelectedDisabled" : "Selected";
    }

    if (power.GetPowerSet()?.SetType === ePowerSetType.Ancillary || power.GetPowerSet()?.SetType === ePowerSetType.Pool) {
      outMessage.message = "This power has been placed in a way that is not possible in-game.";
      const powerSetIndex = power.PowerSetIndex;
      if (powerSetIndex === 2) {
        outMessage.message += "\r\nYou must take one of the first two powers in a pool before taking the third.";
      } else if (powerSetIndex === 3) {
        outMessage.message += "\r\nYou must take two of the first three powers in a pool before taking the fourth.";
      } else if (powerSetIndex === 4) {
        outMessage.message += "\r\nYou must take two of the first three powers in a pool before taking the fifth.";
      }
    } else {
      if (power.InherentType !== eGridType.None) {
        return "Enabled";
      }

      outMessage.message = "This power has been placed in a way that is not possible in-game.\r\nCheck that any powers that it requires have been taken first, and that if this is a branching powerset, the power does not conflict with another.";
      return "Invalid";
    }

    return "Invalid";
  }

  // Note: Full implementations of PopPowerInfo, PopPowersetInfo, PopSlottedEnhInfo (UI popups)
  // These are UI-specific and would need PopUp types to be defined
}

