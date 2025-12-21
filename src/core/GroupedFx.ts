// Converted from C# GroupedFx.cs
import type { IPower } from './IPower';
import type { IEffect } from './IEffect';
import { eEffectType, eMez, eDamage, eToWho, ePvX, eSpecialCase } from './Enums';
import { DatabaseAPI } from './DatabaseAPI';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { Extensions } from './Extensions';
import { FastItemBuilder } from './FastItemBuilder';

export interface FxId {
  EffectType: eEffectType;
  MezType: eMez;
  DamageType: eDamage;
  ETModifies: eEffectType;
  ToWho: eToWho;
  PvMode: ePvX;
  SummonId: number;
  Duration: number;
  IgnoreScaling: boolean;
}

export interface EnhancedMagSum {
  Base: number;
  Enhanced: number;
}

export interface PairedListItem {
  Name: string;
  Value: string;
  ToolTip: string;
  UseUniqueColor: boolean;
  UseAlternateColor: boolean;
}

interface DelayedVector {
  Vector: string;
  Delay: number;
}

// Utility functions for List extensions
function addRangeUnique<T>(list: T[], elements: T[]): void {
  for (const e of elements) {
    if (!list.includes(e)) {
      list.push(e);
    }
  }
}

function containsAll<T>(list: T[], elements: T[]): boolean {
  return elements.every(e => list.includes(e));
}

// Utility function for Dictionary extensions
function containsKeyPrefix<T1, T2>(dict: Map<T1, T2>, prefix: string, nameFound: { value: string }): boolean {
  for (const k of dict.keys()) {
    const keyStr = String(k);
    if (keyStr.startsWith(prefix)) {
      nameFound.value = keyStr;
      return true;
    }
  }
  return false;
}

export class GroupedFx {
  private FxIdentifier: FxId;
  SpecialCase: eSpecialCase;
  Mag: number;
  private Alias: string;
  private IncludedEffects: number[];
  private IsEnhancement: boolean;
  private SingleEffectSource: IEffect | null;
  IsAggregated: boolean;

  get NumEffects(): number {
    return this.IncludedEffects.length;
  }

  get EffectType(): eEffectType {
    return this.FxIdentifier.EffectType;
  }

  get ETModifies(): eEffectType {
    return this.FxIdentifier.ETModifies;
  }

  get MezType(): eMez {
    return this.FxIdentifier.MezType;
  }

  get DamageType(): eDamage {
    return this.FxIdentifier.DamageType;
  }

  get ToWho(): eToWho {
    return this.FxIdentifier.ToWho;
  }

  get PvMode(): ePvX {
    return this.FxIdentifier.PvMode;
  }

  get EnhancementEffect(): boolean {
    return this.IsEnhancement;
  }

  Clone(): GroupedFx {
    const cloned = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    cloned.IncludedEffects = [...this.IncludedEffects];
    return cloned;
  }

  constructor(
    fxIdentifierOrEffect: FxId | IEffect,
    magOrGreListOrFxIndex?: number | GroupedFx[] | string,
    alias?: string,
    includedEffects?: number[],
    isEnhancement?: boolean,
    specialCase?: eSpecialCase
  ) {
    if (fxIdentifierOrEffect instanceof Object && 'EffectType' in fxIdentifierOrEffect) {
      // First constructor: (FxId, float, string, List<int>, bool, eSpecialCase)
      if (typeof magOrGreListOrFxIndex === 'number' && typeof alias === 'string') {
        this.FxIdentifier = fxIdentifierOrEffect as FxId;
        this.Mag = magOrGreListOrFxIndex;
        this.Alias = alias;
        this.IncludedEffects = includedEffects ?? [];
        this.IsEnhancement = isEnhancement ?? false;
        this.SpecialCase = specialCase ?? eSpecialCase.None;
        this.SingleEffectSource = null;
        this.IsAggregated = false;
        return;
      }
      // Second constructor: (FxId, List<GroupedFx>)
      if (Array.isArray(magOrGreListOrFxIndex)) {
        const greList = magOrGreListOrFxIndex;
        this.FxIdentifier = fxIdentifierOrEffect as FxId;
        this.Mag = greList[0].Mag;
        this.Alias = greList[0].Alias;
        this.IsEnhancement = greList[0].IsEnhancement;
        this.SpecialCase = greList[0].SpecialCase;
        this.IsAggregated = true;
        this.SingleEffectSource = null;

        this.IncludedEffects = [];
        for (const gre of greList) {
          addRangeUnique(this.IncludedEffects, gre.IncludedEffects);
        }

        if (this.NumEffects <= 1) {
          this.IsAggregated = false;
        }

        this.IncludedEffects.sort((a, b) => a - b);
        return;
      }
    }
    // Third constructor: (IEffect, int)
    const effect = fxIdentifierOrEffect as IEffect;
    const fxIndex = magOrGreListOrFxIndex as number;
    this.SingleEffectSource = effect;
    this.FxIdentifier = {
      DamageType: effect.DamageType,
      EffectType: effect.EffectType,
      ETModifies: effect.ETModifies,
      MezType: effect.MezType,
      ToWho: effect.ToWho,
      PvMode: effect.PvMode,
      IgnoreScaling: effect.IgnoreScaling,
      SummonId: -1,
      Duration: 0
    };
    this.Mag = effect.BuffedMag;
    this.Alias = '';
    this.IncludedEffects = [fxIndex];
    this.IsEnhancement = effect.isEnhancementEffect ?? false;
    this.SpecialCase = effect.SpecialCase ?? eSpecialCase.None;
    this.IsAggregated = false;
  }

  toString(): string {
    return `<GroupedFx> {${this.FxIdentifier}, effects: ${this.NumEffects}, Mag: ${this.Mag}, EnhancementFx: ${this.IsEnhancement}, Special case: ${this.SpecialCase}, Aggregated: ${this.IsAggregated}}`;
  }

  GetRankedEffectIndex(rankedEffects: number[], index: number): number {
    if (this.NumEffects <= 0) {
      return -1;
    }
    return Extensions.TryFindIndex(rankedEffects, e => e === this.IncludedEffects[index]);
  }

  GetEffectAt(power: IPower, index: number = 0): IEffect {
    return power.Effects[this.IncludedEffects[index]];
  }

  GetEffects(power: IPower): IEffect[] {
    return this.IncludedEffects
      .filter(e => e >= 0 && e < power.Effects.length)
      .map(e => power.Effects[e]);
  }

  private GetPowerEffectAt(power: IPower, index: number = 0): IEffect {
    return power.Effects[index];
  }

  private static GetAllDefensesEx(): eDamage[] {
    return DatabaseAPI.RealmUsesToxicDef()
      ? [
          eDamage.None,
          eDamage.Smashing,
          eDamage.Lethal,
          eDamage.Fire,
          eDamage.Cold,
          eDamage.Energy,
          eDamage.Negative,
          eDamage.Psionic,
          eDamage.Toxic,
          eDamage.Melee,
          eDamage.Ranged,
          eDamage.AoE
        ]
      : [
          eDamage.None,
          eDamage.Smashing,
          eDamage.Lethal,
          eDamage.Fire,
          eDamage.Cold,
          eDamage.Energy,
          eDamage.Negative,
          eDamage.Psionic,
          eDamage.Melee,
          eDamage.Ranged,
          eDamage.AoE
        ];
  }

  private static GetAllDefenses(): eDamage[] {
    return DatabaseAPI.RealmUsesToxicDef()
      ? [
          eDamage.Smashing,
          eDamage.Lethal,
          eDamage.Fire,
          eDamage.Cold,
          eDamage.Energy,
          eDamage.Negative,
          eDamage.Psionic,
          eDamage.Toxic,
          eDamage.Melee,
          eDamage.Ranged,
          eDamage.AoE
        ]
      : [
          eDamage.Smashing,
          eDamage.Lethal,
          eDamage.Fire,
          eDamage.Cold,
          eDamage.Energy,
          eDamage.Negative,
          eDamage.Psionic,
          eDamage.Melee,
          eDamage.Ranged,
          eDamage.AoE
        ];
  }

  private static GetPositionDefenses(): eDamage[] {
    return [eDamage.Melee, eDamage.Ranged, eDamage.AoE];
  }

  private static GetTypedDefenses(): eDamage[] {
    const damageTypes = Object.values(eDamage).filter(
      v => typeof v === 'number'
    ) as eDamage[];
    const usesToxic = DatabaseAPI.RealmUsesToxicDefense;
    return damageTypes.filter(
      type =>
        type !== eDamage.None &&
        type !== eDamage.Melee &&
        type !== eDamage.Ranged &&
        type !== eDamage.AoE &&
        type !== eDamage.Special &&
        type !== eDamage.Unique1 &&
        type !== eDamage.Unique2 &&
        type !== eDamage.Unique3 &&
        (usesToxic || type !== eDamage.Toxic)
    );
  }

  private static GetAllResistances(): eDamage[] {
    return [
      eDamage.Smashing,
      eDamage.Lethal,
      eDamage.Fire,
      eDamage.Cold,
      eDamage.Energy,
      eDamage.Negative,
      eDamage.Psionic,
      eDamage.Toxic
    ];
  }

  private static GetAllMez(): eMez[] {
    return [
      eMez.Immobilized,
      eMez.Held,
      eMez.Stunned,
      eMez.Sleep,
      eMez.Terrorized,
      eMez.Confused
    ];
  }

  private static GetAllMovement(): eEffectType[] {
    return [eEffectType.SpeedFlying, eEffectType.SpeedJumping, eEffectType.SpeedRunning];
  }

  GetStatName(power: IPower): string {
    const fx = this.IncludedEffects
      .filter(i => i >= 0 && i < power.Effects.length)
      .map(i => power.Effects[i]);

    const allDefenses = GroupedFx.GetAllDefenses();
    const positionDefenses = GroupedFx.GetPositionDefenses();
    const typedDefenses = GroupedFx.GetTypedDefenses();
    const allResistances = GroupedFx.GetAllResistances();
    const allMez = GroupedFx.GetAllMez();

    const fxDamageTypes = fx.map(e => e.DamageType);
    const fxMezTypes = fx.map(e => e.MezType);
    const fxEffectTypes = fx.map(e => e.ETModifies);
    const fxMainEffectTypes = fx.map(e => e.EffectType);

    let groupedVector = '';
    switch (this.FxIdentifier.EffectType) {
      case eEffectType.Defense:
      case eEffectType.Elusivity:
        if (containsAll(fxDamageTypes, allDefenses)) {
          groupedVector = 'All';
        } else if (containsAll(fxDamageTypes, positionDefenses)) {
          groupedVector = 'All positions';
        } else if (containsAll(fxDamageTypes, typedDefenses)) {
          groupedVector = 'All types';
        } else if (fxDamageTypes.length > 1) {
          groupedVector = 'Multi';
        } else {
          groupedVector = String(fxDamageTypes[0]);
        }
        break;

      case eEffectType.Resistance:
      case eEffectType.DamageBuff:
        if (containsAll(fxDamageTypes, allResistances)) {
          groupedVector = 'All';
        } else if (fxDamageTypes.length > 1) {
          groupedVector = 'Multi';
        } else {
          groupedVector = String(fxDamageTypes[0]);
        }
        break;

      case eEffectType.MezResist:
        if (containsAll(fxMezTypes, allMez)) {
          groupedVector = 'All';
        } else if (fxMezTypes.length > 1) {
          groupedVector = 'Multi';
        } else {
          groupedVector = String(fxMezTypes[0]);
        }
        break;

      case eEffectType.Enhancement:
        if (
          this.FxIdentifier.ETModifies === eEffectType.Mez ||
          this.FxIdentifier.ETModifies === eEffectType.MezResist
        ) {
          if (containsAll(fxMezTypes, allMez)) {
            groupedVector = 'All';
          } else if (fxMezTypes.length > 1) {
            groupedVector = 'Multi';
          } else {
            groupedVector = String(fxMezTypes[0]);
          }
        } else if (
          this.FxIdentifier.ETModifies === eEffectType.Defense ||
          this.FxIdentifier.ETModifies === eEffectType.Elusivity
        ) {
          if (containsAll(fxDamageTypes, allDefenses)) {
            groupedVector = 'All';
          } else if (containsAll(fxDamageTypes, positionDefenses)) {
            groupedVector = 'All positions';
          } else if (containsAll(fxDamageTypes, typedDefenses)) {
            groupedVector = 'All types';
          } else if (fxDamageTypes.length > 1) {
            groupedVector = 'Multi';
          } else {
            groupedVector = String(fxDamageTypes[0]);
          }
        } else if (this.FxIdentifier.ETModifies === eEffectType.Resistance) {
          if (containsAll(fxDamageTypes, allResistances)) {
            groupedVector = 'All';
          } else if (fxDamageTypes.length > 1) {
            groupedVector = 'Multi';
          } else {
            groupedVector = String(fxDamageTypes[0]);
          }
        }
        break;

      case eEffectType.ResEffect:
        groupedVector = fxEffectTypes.length > 1 ? 'Multi' : String(fxEffectTypes[0]);
        break;
    }

    if (
      this.FxIdentifier.EffectType !== eEffectType.SpeedFlying &&
      this.FxIdentifier.EffectType !== eEffectType.SpeedJumping &&
      this.FxIdentifier.EffectType !== eEffectType.SpeedRunning
    ) {
      return groupedVector !== '' ? `${fx[0].EffectType} (${groupedVector})` : String(fx[0].EffectType);
    }

    if (containsAll(fxMainEffectTypes, GroupedFx.GetAllMovement())) {
      return 'Slow';
    }

    return groupedVector !== '' ? `${fx[0].EffectType} (${groupedVector})` : String(fx[0].EffectType);
  }

  private GetGroupedVector(statName: string, ignoreMulti: boolean = true): string {
    if (statName.includes('All types')) return 'All types';
    if (statName.includes('All positions')) return 'All positions';
    if (statName.includes('All')) return 'All';
    if (statName.includes('Multi') && !ignoreMulti) return 'Multi';
    return '';
  }

  GetMagSum(power: IPower, ignoreNegs: boolean = true): number {
    if (this.NumEffects <= 0) {
      return 0;
    }

    const validEffects = this.IncludedEffects.filter(e => e >= 0 && e < power.Effects.length);

    const allNegEnh = validEffects
      .map(e => this.GetPowerEffectAt(power, e).BuffedMag)
      .every(e => e < 0);

    const refEffect = this.GetEffectAt(power);
    const fx = validEffects.map(e => power.Effects[e]);
    if (
      fx.every(
        e =>
          e.EffectType === refEffect.EffectType &&
          e.MezType === refEffect.MezType &&
          e.ETModifies === refEffect.ETModifies &&
          e.DamageType === refEffect.DamageType
      )
    ) {
      return allNegEnh || !ignoreNegs
        ? validEffects.map(e => this.GetPowerEffectAt(power, e).BuffedMag).reduce((a, b) => a + b, 0)
        : validEffects
            .map(e => this.GetPowerEffectAt(power, e).BuffedMag)
            .filter(e => e > 0)
            .reduce((a, b) => a + b, 0);
    }

    if (
      this.GetEffectAt(power).EffectType === eEffectType.Defense ||
      this.GetEffectAt(power).EffectType === eEffectType.Resistance ||
      this.GetEffectAt(power).EffectType === eEffectType.Elusivity ||
      this.GetEffectAt(power).EffectType === eEffectType.Mez ||
      this.GetEffectAt(power).EffectType === eEffectType.MezResist ||
      this.GetEffectAt(power).EffectType === eEffectType.ResEffect ||
      this.GetEffectAt(power).EffectType === eEffectType.Enhancement
    ) {
      return this.GetEffectAt(power).BuffedMag;
    }

    return allNegEnh || !ignoreNegs
      ? validEffects.map(e => this.GetPowerEffectAt(power, e).BuffedMag).reduce((a, b) => a + b, 0)
      : validEffects
          .map(e => this.GetPowerEffectAt(power, e).BuffedMag)
          .filter(e => e > 0)
          .reduce((a, b) => a + b, 0);
  }

  GetTooltip(power: IPower, simple: boolean = false): string {
    // Simplified implementation - full implementation would require BuildEffectString and other methods
    const statName = this.GetStatName(power);
    const groupedVector = this.GetGroupedVector(statName);
    let vectors = '';

    if (groupedVector !== '') {
      vectors = groupedVector;
    } else {
      // Simplified vector generation
      const refEffect = power.Effects[this.IncludedEffects[0]];
      vectors = String(refEffect.DamageType || refEffect.MezType || refEffect.ETModifies);
    }

    // Simplified tooltip - would need full BuildEffectString implementation
    const tip = this.IncludedEffects.map(index => {
      const effect = power.Effects[index];
      return `${effect.EffectType}: ${effect.BuffedMag}`;
    }).join('\r\n');

    return tip;
  }

  ContainsFxIndex(idx: number): boolean {
    return this.IncludedEffects.includes(idx);
  }

  private static GetSimilarEffects(
    power: IPower,
    fxIdentifier: FxId,
    mag: number,
    specialCase: eSpecialCase = eSpecialCase.None,
    enhancementEffect: boolean = false
  ): number[] {
    switch (fxIdentifier.EffectType) {
      case eEffectType.EntCreate:
        return power.Effects.map((e, i) => ({ index: i, effect: e }))
          .filter(
            e =>
              e.effect.EffectType === fxIdentifier.EffectType &&
              e.effect.nSummon === fxIdentifier.SummonId &&
              e.effect.ToWho === fxIdentifier.ToWho &&
              (Math.abs(e.effect.Duration - fxIdentifier.Duration) < Number.EPSILON ||
                fxIdentifier.Duration === 0) &&
              (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
              e.effect.PvMode === fxIdentifier.PvMode &&
              e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
          )
          .map(e => e.index);

      case eEffectType.SpeedFlying:
      case eEffectType.SpeedJumping:
      case eEffectType.SpeedRunning:
        return power.Effects.map((e, i) => ({ index: i, effect: e }))
          .filter(
            e =>
              (e.effect.EffectType === eEffectType.SpeedFlying ||
                e.effect.EffectType === eEffectType.SpeedJumping ||
                e.effect.EffectType === eEffectType.SpeedRunning) &&
              e.effect.ToWho === fxIdentifier.ToWho &&
              Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
              (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
              e.effect.PvMode === fxIdentifier.PvMode &&
              e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
          )
          .map(e => e.index);

      case eEffectType.Enhancement:
        if (
          fxIdentifier.ETModifies === eEffectType.Mez ||
          fxIdentifier.ETModifies === eEffectType.MezResist
        ) {
          return power.Effects.map((e, i) => ({ index: i, effect: e }))
            .filter(
              e =>
                e.effect.EffectType === fxIdentifier.EffectType &&
                e.effect.ETModifies === fxIdentifier.ETModifies &&
                e.effect.ToWho === fxIdentifier.ToWho &&
                Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
                (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
                e.effect.PvMode === fxIdentifier.PvMode &&
                e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
            )
            .map(e => e.index);
        } else {
          return power.Effects.map((e, i) => ({ index: i, effect: e }))
            .filter(
              e =>
                e.effect.EffectType === fxIdentifier.EffectType &&
                e.effect.ETModifies !== eEffectType.Mez &&
                e.effect.ETModifies !== eEffectType.MezResist &&
                e.effect.ToWho === fxIdentifier.ToWho &&
                Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
                (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
                e.effect.PvMode === fxIdentifier.PvMode &&
                e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
            )
            .map(e => e.index);
        }

      case eEffectType.DamageBuff:
        if (specialCase === eSpecialCase.Defiance) {
          return power.Effects.map((e, i) => ({ index: i, effect: e }))
            .filter(
              e =>
                e.effect.EffectType === fxIdentifier.EffectType &&
                e.effect.ToWho === fxIdentifier.ToWho &&
                Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
                e.effect.SpecialCase === specialCase &&
                (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
                e.effect.PvMode === fxIdentifier.PvMode &&
                e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
            )
            .map(e => e.index);
        } else {
          return power.Effects.map((e, i) => ({ index: i, effect: e }))
            .filter(
              e =>
                e.effect.EffectType === fxIdentifier.EffectType &&
                e.effect.ToWho === fxIdentifier.ToWho &&
                Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
                e.effect.SpecialCase !== eSpecialCase.Defiance &&
                (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
                e.effect.PvMode === fxIdentifier.PvMode &&
                e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
            )
            .map(e => e.index);
        }

      case eEffectType.Damage:
        return power.Effects.map((e, i) => ({ index: i, effect: e }))
          .filter(
            e =>
              e.effect.EffectType === fxIdentifier.EffectType &&
              e.effect.ToWho === fxIdentifier.ToWho &&
              Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
              e.effect.DamageType === fxIdentifier.DamageType &&
              e.effect.SpecialCase === specialCase &&
              (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
              e.effect.PvMode === fxIdentifier.PvMode &&
              e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
          )
          .map(e => e.index);

      case eEffectType.Defense:
      case eEffectType.Resistance:
      case eEffectType.Elusivity:
      case eEffectType.MezResist:
      case eEffectType.ResEffect:
        return power.Effects.map((e, i) => ({ index: i, effect: e }))
          .filter(
            e =>
              e.effect.EffectType === fxIdentifier.EffectType &&
              e.effect.ToWho === fxIdentifier.ToWho &&
              Math.abs(e.effect.BuffedMag - mag) < Number.EPSILON &&
              (e.effect.isEnhancementEffect ?? false) === enhancementEffect &&
              e.effect.PvMode === fxIdentifier.PvMode &&
              e.effect.IgnoreScaling === fxIdentifier.IgnoreScaling
          )
          .map(e => e.index);

      default:
        return [];
    }
  }

  static AssembleGroupedEffects(power: IPower | null, includeDamage: boolean = false): GroupedFx[] {
    if (power == null) {
      return [];
    }

    const rankedEffects = power.GetRankedEffects(true);
    const defiancePower = DatabaseAPI.GetPowerByFullName('Inherent.Inherent.Defiance');
    const ignoredEffects: number[] = [];
    const groupedRankedEffects: GroupedFx[] = [];

    // Pass 1: build grouped effects from power effects
    for (const re of rankedEffects) {
      if (re <= -1) {
        continue;
      }

      if (ignoredEffects.includes(re)) {
        continue;
      }

      if (!includeDamage && power.Effects[re].EffectType === eEffectType.Damage) {
        continue;
      }

      if (
        power.Effects[re].EffectType === eEffectType.Meter ||
        power.Effects[re].EffectType === eEffectType.SetMode ||
        power.Effects[re].EffectType === eEffectType.UnsetMode ||
        power.Effects[re].EffectType === eEffectType.Null ||
        power.Effects[re].EffectType === eEffectType.NullBool ||
        power.Effects[re].EffectType === eEffectType.GlobalChanceMod ||
        power.Effects[re].EffectType === eEffectType.ExecutePower
      ) {
        continue;
      }

      if (
        power.Effects[re].EffectType === eEffectType.ResEffect &&
        (power.Effects[re].ETModifies === eEffectType.Null ||
          power.Effects[re].ETModifies === eEffectType.NullBool)
      ) {
        continue;
      }

      if (
        !(
          (power.Effects[re].Probability ?? 0) > 0 &&
          ((MidsContext.Config?.Suppression ?? 0) & (power.Effects[re].Suppression ?? 0)) === 0 &&
          power.Effects[re].CanInclude()
        )
      ) {
        continue;
      }

      if (
        power.Effects[re].EffectType === eEffectType.RevokePower &&
        power.Effects[re].nSummon <= -1 &&
        (!power.Effects[re].Summon || power.Effects[re].Summon.trim() === '')
      ) {
        continue;
      }

      if (
        power.Effects[re].EffectType === eEffectType.GrantPower &&
        power.Effects[re].nSummon <= -1
      ) {
        continue;
      }

      if (
        (power.Effects[re].PvMode === ePvX.PvP && !MidsContext.Config.Inc.DisablePvE) ||
        (power.Effects[re].PvMode === ePvX.PvE && MidsContext.Config.Inc.DisablePvE)
      ) {
        continue;
      }

      if (power.Effects[re].ActiveConditionals && power.Effects[re].ActiveConditionals.length > 0) {
        if (!power.Effects[re].ValidateConditional()) {
          continue;
        }
      }

      if (
        power.Effects[re].EffectType === eEffectType.Mez &&
        power.Effects[re].MezType !== eMez.Teleport &&
        power.Effects[re].MezType !== eMez.Knockback &&
        power.Effects[re].MezType !== eMez.Knockup &&
        power.Effects[re].MezType !== eMez.Repel &&
        power.Effects[re].MezType !== eMez.ToggleDrop
      ) {
        if (power.Effects[re].Duration <= 0) {
          continue;
        }
      }

      let similarFxIds: number[] = [];

      switch (power.Effects[re].EffectType) {
        case eEffectType.Damage:
          similarFxIds = GroupedFx.GetSimilarEffects(
            power,
            {
              DamageType: power.Effects[re].DamageType,
              EffectType: eEffectType.Damage,
              ETModifies: eEffectType.None,
              MezType: eMez.None,
              ToWho: power.Effects[re].ToWho,
              SummonId: -1,
              Duration: power.Effects[re].Duration,
              PvMode: power.Effects[re].PvMode,
              IgnoreScaling: power.Effects[re].IgnoreScaling
            },
            power.Effects[re].BuffedMag,
            power.Effects[re].SpecialCase ?? eSpecialCase.None,
            power.Effects[re].isEnhancementEffect ?? false
          );

          addRangeUnique(ignoredEffects, similarFxIds);

          groupedRankedEffects.push(
            new GroupedFx(
              {
                DamageType: power.Effects[re].DamageType,
                EffectType: eEffectType.Damage,
                ETModifies: eEffectType.None,
                MezType: eMez.None,
                ToWho: power.Effects[re].ToWho,
                SummonId: -1,
                Duration: power.Effects[re].Duration,
                PvMode: power.Effects[re].PvMode,
                IgnoreScaling: power.Effects[re].IgnoreScaling
              },
              power.Effects[re].BuffedMag,
              'Damage',
              similarFxIds,
              power.Effects[re].isEnhancementEffect ?? false
            )
          );
          break;

        case eEffectType.EntCreate:
          similarFxIds = GroupedFx.GetSimilarEffects(
            power,
            {
              DamageType: eDamage.None,
              EffectType: eEffectType.EntCreate,
              ETModifies: eEffectType.None,
              MezType: eMez.None,
              ToWho: power.Effects[re].ToWho,
              SummonId: power.Effects[re].nSummon,
              Duration: 0,
              PvMode: power.Effects[re].PvMode,
              IgnoreScaling: power.Effects[re].IgnoreScaling
            },
            power.Effects[re].BuffedMag,
            eSpecialCase.None,
            power.Effects[re].isEnhancementEffect ?? false
          );

          addRangeUnique(ignoredEffects, similarFxIds);

          groupedRankedEffects.push(
            new GroupedFx(
              {
                DamageType: eDamage.None,
                EffectType: eEffectType.EntCreate,
                ETModifies: eEffectType.None,
                MezType: eMez.None,
                ToWho: power.Effects[re].ToWho,
                SummonId: power.Effects[re].nSummon,
                Duration: 0,
                PvMode: power.Effects[re].PvMode,
                IgnoreScaling: power.Effects[re].IgnoreScaling
              },
              power.Effects[re].BuffedMag,
              'Summon',
              similarFxIds,
              power.Effects[re].isEnhancementEffect ?? false
            )
          );
          break;

        case eEffectType.SpeedFlying:
        case eEffectType.SpeedJumping:
        case eEffectType.SpeedRunning:
          similarFxIds = GroupedFx.GetSimilarEffects(
            power,
            {
              DamageType: eDamage.None,
              EffectType: power.Effects[re].EffectType,
              ETModifies: eEffectType.None,
              MezType: eMez.None,
              ToWho: power.Effects[re].ToWho,
              SummonId: -1,
              Duration: 0,
              PvMode: power.Effects[re].PvMode,
              IgnoreScaling: power.Effects[re].IgnoreScaling
            },
            power.Effects[re].BuffedMag,
            eSpecialCase.None,
            power.Effects[re].isEnhancementEffect ?? false
          );

          addRangeUnique(ignoredEffects, similarFxIds);

          groupedRankedEffects.push(
            new GroupedFx(
              {
                DamageType: eDamage.None,
                EffectType: power.Effects[re].EffectType,
                ETModifies: eEffectType.None,
                MezType: eMez.None,
                ToWho: power.Effects[re].ToWho,
                SummonId: -1,
                Duration: 0,
                PvMode: power.Effects[re].PvMode,
                IgnoreScaling: power.Effects[re].IgnoreScaling
              },
              power.Effects[re].BuffedMag,
              'Slow',
              similarFxIds,
              power.Effects[re].isEnhancementEffect ?? false
            )
          );
          break;

        case eEffectType.DamageBuff:
          const isDefiance =
            power.Effects[re].SpecialCase === eSpecialCase.Defiance &&
            (power.Effects[re].ValidateConditional('Active', 'Defiance') ||
              (defiancePower ? (MidsContext.Character?.CurrentBuild?.PowerActive(defiancePower) ?? false) : false));

          similarFxIds = GroupedFx.GetSimilarEffects(
            power,
            {
              DamageType: eDamage.None,
              EffectType: eEffectType.DamageBuff,
              ETModifies: eEffectType.None,
              MezType: eMez.None,
              ToWho: power.Effects[re].ToWho,
              SummonId: -1,
              Duration: 0,
              PvMode: power.Effects[re].PvMode,
              IgnoreScaling: power.Effects[re].IgnoreScaling
            },
            power.Effects[re].BuffedMag,
            isDefiance ? eSpecialCase.Defiance : eSpecialCase.None,
            power.Effects[re].isEnhancementEffect ?? false
          );

          addRangeUnique(ignoredEffects, similarFxIds);

          groupedRankedEffects.push(
            new GroupedFx(
              {
                DamageType: eDamage.None,
                EffectType: eEffectType.DamageBuff,
                ETModifies: eEffectType.None,
                MezType: eMez.None,
                ToWho: power.Effects[re].ToWho,
                SummonId: -1,
                Duration: 0,
                PvMode: power.Effects[re].PvMode,
                IgnoreScaling: power.Effects[re].IgnoreScaling
              },
              power.Effects[re].BuffedMag,
              isDefiance ? 'Defiance' : String(power.Effects[re].EffectType),
              similarFxIds,
              !isDefiance && (power.Effects[re].isEnhancementEffect ?? false),
              eSpecialCase.Defiance
            )
          );
          break;

        case eEffectType.Defense:
        case eEffectType.Resistance:
        case eEffectType.Elusivity:
        case eEffectType.MezResist:
        case eEffectType.ResEffect:
        case eEffectType.Enhancement:
          similarFxIds = GroupedFx.GetSimilarEffects(
            power,
            {
              EffectType: power.Effects[re].EffectType,
              ETModifies: power.Effects[re].ETModifies,
              MezType: eMez.None,
              DamageType: eDamage.None,
              ToWho: power.Effects[re].ToWho,
              SummonId: -1,
              Duration: 0,
              PvMode: power.Effects[re].PvMode,
              IgnoreScaling: power.Effects[re].IgnoreScaling
            },
            power.Effects[re].BuffedMag,
            eSpecialCase.None,
            power.Effects[re].isEnhancementEffect ?? false
          );

          addRangeUnique(ignoredEffects, similarFxIds);

          groupedRankedEffects.push(
            new GroupedFx(
              {
                EffectType: power.Effects[re].EffectType,
                ETModifies: power.Effects[re].ETModifies,
                MezType: eMez.None,
                DamageType: eDamage.None,
                ToWho: power.Effects[re].ToWho,
                SummonId: -1,
                Duration: 0,
                PvMode: power.Effects[re].PvMode,
                IgnoreScaling: power.Effects[re].IgnoreScaling
              },
              power.Effects[re].BuffedMag,
              power.Effects[re].EffectType === eEffectType.Enhancement
                ? `${power.Effects[re].EffectType}(${power.Effects[re].ETModifies})`
                : String(power.Effects[re].EffectType),
              similarFxIds,
              power.Effects[re].isEnhancementEffect ?? false
            )
          );
          break;

        default:
          groupedRankedEffects.push(new GroupedFx(power.Effects[re], re));
          break;
      }
    }

    // Pass 2: aggregate similar grouped effect containing a single effect
    const groupedRankedEffects2: GroupedFx[] = [];
    const ignoredGroups: number[] = [];
    for (let i = 0; i < groupedRankedEffects.length; i++) {
      if (ignoredGroups.includes(i)) {
        continue;
      }

      if (groupedRankedEffects[i].NumEffects > 1) {
        groupedRankedEffects2.push(groupedRankedEffects[i]);
        continue;
      }

      const similarGreList = groupedRankedEffects
        .map((e, id) => ({ key: id, value: e }))
        .filter(
          e =>
            GroupedFx.FxIdentifierEquals(e.value.FxIdentifier, groupedRankedEffects[i].FxIdentifier) &&
            Math.abs(e.value.Mag - groupedRankedEffects[i].Mag) < Number.EPSILON &&
            e.value.EnhancementEffect === groupedRankedEffects[i].EnhancementEffect &&
            e.value.SpecialCase === groupedRankedEffects[i].SpecialCase
        );

      addRangeUnique(
        ignoredGroups,
        similarGreList.map(e => e.key)
      );

      groupedRankedEffects2.push(
        new GroupedFx(
          groupedRankedEffects[i].FxIdentifier,
          similarGreList.map(e => e.value)
        )
      );
    }

    // Pass 3: generate aggregated GroupedFx, recalc mag sum
    const greAggregated = GroupedFx.Aggregate(groupedRankedEffects2);
    for (const gre of greAggregated) {
      if (!gre.IsAggregated) {
        continue;
      }

      gre.Mag = gre.GetMagSum(
        power!,
        gre.FxIdentifier.EffectType !== eEffectType.SpeedFlying &&
          gre.FxIdentifier.EffectType !== eEffectType.SpeedJumping &&
          gre.FxIdentifier.EffectType !== eEffectType.SpeedRunning &&
          gre.FxIdentifier.EffectType !== eEffectType.JumpHeight
      );
    }

    // Pass 4: filter 0-mag GroupedFx
    return greAggregated.filter(e => Math.abs(e.Mag) > Number.EPSILON);
  }

  private static FxIdentifierEquals(a: FxId, b: FxId): boolean {
    return (
      a.EffectType === b.EffectType &&
      a.MezType === b.MezType &&
      a.DamageType === b.DamageType &&
      a.ETModifies === b.ETModifies &&
      a.ToWho === b.ToWho &&
      a.PvMode === b.PvMode &&
      a.SummonId === b.SummonId &&
      Math.abs(a.Duration - b.Duration) < Number.EPSILON &&
      a.IgnoreScaling === b.IgnoreScaling
    );
  }

  static Aggregate(greList: GroupedFx[]): GroupedFx[] {
    const ret: GroupedFx[] = [];
    const excludedGre: number[] = [];

    for (let i = 0; i < greList.length; i++) {
      if (excludedGre.includes(i)) {
        continue;
      }

      excludedGre.push(i);
      const includedGre: number[] = [i];
      for (let j = 0; j < greList.length; j++) {
        if (i === j) {
          continue;
        }

        if (excludedGre.includes(j)) {
          continue;
        }

        if (
          greList[i].FxIdentifier.EffectType === eEffectType.SpeedFlying ||
          greList[i].FxIdentifier.EffectType === eEffectType.SpeedJumping ||
          greList[i].FxIdentifier.EffectType === eEffectType.SpeedRunning ||
          greList[i].FxIdentifier.EffectType === eEffectType.JumpHeight
        ) {
          if (
            !GroupedFx.FxIdentifierEquals(greList[i].FxIdentifier, greList[j].FxIdentifier) ||
            greList[i].EnhancementEffect !== greList[j].EnhancementEffect ||
            greList[i].SpecialCase !== greList[j].SpecialCase
          ) {
            continue;
          }
        } else {
          if (
            !GroupedFx.FxIdentifierEquals(greList[i].FxIdentifier, greList[j].FxIdentifier) ||
            Math.abs(greList[i].Mag - greList[j].Mag) > Number.EPSILON ||
            greList[i].EnhancementEffect !== greList[j].EnhancementEffect ||
            greList[i].SpecialCase !== greList[j].SpecialCase
          ) {
            continue;
          }
        }

        includedGre.push(j);
        excludedGre.push(j);
      }

      ret.push(
        new GroupedFx(
          greList[i].FxIdentifier,
          includedGre.map(e => greList[e])
        )
      );
    }

    return ret;
  }

  private CropIncludedEffects(power: IPower): GroupedFx {
    const gre = this.Clone();
    gre.IncludedEffects = gre.IncludedEffects.filter(
      e => e >= 0 && e < power.Effects.length
    );
    return gre;
  }

  static GenerateListItems(
    groupedRankedEffects: GroupedFx[],
    pBase: IPower | null,
    pEnh: IPower | null,
    rankedEffects: number[],
    displayBlockFontSize: number
  ): Array<{ key: GroupedFx; value: PairedListItem }> {
    const ret: Array<{ key: GroupedFx; value: PairedListItem }> = [];
    if (!pBase || !pEnh) {
      return ret;
    }

    const powerInBuild =
      (MidsContext.Character?.CurrentBuild?.FindInToonHistory(
        Extensions.TryFindIndex(
          DatabaseAPI.Database.Power,
          e => e?.FullName === pBase.FullName
        )
      ) ?? -1) > -1;

    for (const gre of groupedRankedEffects) {
      const greIndex = gre.GetRankedEffectIndex(rankedEffects, 0);
      if (greIndex < 0) {
        continue;
      }

      // Note: FastItemBuilder.GetRankedEffect needs to be fully implemented
      // For now, creating a basic PairedListItem
      let rankedEffect: PairedListItem = {
        Name: '',
        Value: '',
        ToolTip: '',
        UseUniqueColor: false,
        UseAlternateColor: false
      };

      // Try to get from FastItemBuilder if available
      try {
        // Note: FastItemBuilder.GetRankedEffect needs to be fully implemented
        // For now, we'll create the basic structure and let FinalizeListItem fill it in
        if (typeof (FastItemBuilder as any).GetRankedEffect === 'function') {
          const fastItem = (FastItemBuilder as any).GetRankedEffect(
            rankedEffects,
            greIndex,
            pBase,
            pEnh
          );
          if (fastItem && typeof fastItem === 'object') {
            rankedEffect = {
              Name: fastItem.Name ?? '',
              Value: fastItem.Value ?? '',
              ToolTip: fastItem.ToolTip ?? '',
              UseUniqueColor: fastItem.UseUniqueColor ?? false,
              UseAlternateColor: fastItem.UseAlternateColor ?? false
            };
          }
        }
      } catch {
        // Fallback to basic implementation
      }

      GroupedFx.FinalizeListItem(
        rankedEffect,
        pBase,
        pEnh,
        gre,
        rankedEffects[greIndex],
        powerInBuild,
        displayBlockFontSize
      );

      ret.push({ key: gre, value: rankedEffect });
    }

    return ret;
  }

  static FilterListItemsExt(
    itemsDict: Array<{ key: GroupedFx; value: PairedListItem }> | null,
    filterFunc: (fxId: FxId) => boolean
  ): Array<{ key: GroupedFx; value: PairedListItem }> {
    if (itemsDict == null) {
      return [];
    }

    return itemsDict.filter(e => filterFunc(e.key.FxIdentifier));
  }

  private static FinalizeListItem(
    rankedEffect: PairedListItem,
    pBase: IPower,
    pEnh: IPower,
    gre: GroupedFx,
    effectIndex: number,
    powerInBuild: boolean,
    displayBlockFontSize: number
  ): void {
    if (
      pBase.Effects.some(e => e.EffectType === eEffectType.EntCreate) &&
      pBase.AbsorbSummonEffects
    ) {
      // Note: AbsorbPetEffects needs to be implemented
      // pBase.AbsorbPetEffects();
    }

    const defiancePower = DatabaseAPI.GetPowerByFullName('Inherent.Inherent.Defiance');
    const effectSource = gre.GetEffectAt(pEnh);
    const effectType = gre.EffectType;
    const greTooltip = gre.GetTooltip(pEnh);

    const magSum =
      effectType === eEffectType.SpeedFlying ||
      effectType === eEffectType.SpeedJumping ||
      effectType === eEffectType.SpeedRunning ||
      effectType === eEffectType.JumpHeight
        ? gre.GetMagSum(pEnh, false)
        : gre.GetMagSum(pEnh);
    const baseMagSum =
      effectType === eEffectType.SpeedFlying ||
      effectType === eEffectType.SpeedJumping ||
      effectType === eEffectType.SpeedRunning ||
      effectType === eEffectType.JumpHeight
        ? gre.CropIncludedEffects(pBase).GetMagSum(pBase, false)
        : gre.CropIncludedEffects(pBase).GetMagSum(pBase);

    const sameKindBuff = gre
      .GetEffects(pEnh)
      .every(
        e =>
          e.EffectType === effectSource.EffectType &&
          e.DamageType === effectSource.DamageType &&
          e.MezType === effectSource.MezType &&
          e.ETModifies === effectSource.ETModifies
      );

    const mezDurationDiff =
      effectType === eEffectType.Mez &&
      Math.abs(
        (effectIndex < pBase.Effects.length ? pBase.Effects[effectIndex].Duration : 0) -
          (effectIndex < pEnh.Effects.length ? pEnh.Effects[effectIndex].Duration : 0)
      ) > Number.EPSILON;

    let magDiff = false;
    let buffedMagDiff = false;
    if (pEnh.Effects[effectIndex]?.Buffable) {
      magDiff =
        Math.abs(
          (effectIndex < pBase.Effects.length
            ? pBase.Effects[effectIndex].BuffedMag
            : 0) -
            (effectIndex < pEnh.Effects.length ? pEnh.Effects[effectIndex].BuffedMag : 0)
        ) > Number.EPSILON ||
        Math.abs(magSum - baseMagSum) > Number.EPSILON ||
        mezDurationDiff;
      buffedMagDiff =
        effectIndex < pEnh.Effects.length &&
        Math.abs(
          pEnh.Effects[effectIndex].BuffedMag - pEnh.Effects[effectIndex].Mag
        ) > Number.EPSILON;
    } else {
      // Find alternative buffable effect
      const indexedFx = pEnh.Effects.map((f, i) => ({ key: i, value: f }));
      const fxSourceAlt = gre.IncludedEffects
        .map(e => indexedFx[e])
        .find(e => e?.value.Buffable && e.key < pBase.Effects.length);

      if (fxSourceAlt && fxSourceAlt.key >= 0) {
        magDiff =
          Math.abs(
            (fxSourceAlt.key < pBase.Effects.length
              ? pBase.Effects[fxSourceAlt.key].BuffedMag
              : 0) -
              (fxSourceAlt.key < pEnh.Effects.length
                ? pEnh.Effects[fxSourceAlt.key].BuffedMag
                : 0)
          ) > Number.EPSILON ||
          Math.abs(magSum - baseMagSum) > Number.EPSILON ||
          mezDurationDiff;
        buffedMagDiff =
          fxSourceAlt.key < pEnh.Effects.length &&
          Math.abs(
            pEnh.Effects[fxSourceAlt.key].BuffedMag -
              pEnh.Effects[fxSourceAlt.key].Mag
          ) > Number.EPSILON;
      }
    }

    const toWhoShort =
      effectSource.ToWho === eToWho.Self
        ? ' (Slf)'
        : effectSource.ToWho === eToWho.Target
          ? ' (Tgt)'
          : '';

    rankedEffect.UseUniqueColor = effectSource.isEnhancementEffect ?? false;
    rankedEffect.UseAlternateColor =
      !(effectSource.isEnhancementEffect ?? false) &&
      magDiff &&
      (buffedMagDiff || mezDurationDiff) &&
      gre.GetEffects(pEnh).some(e => e.Buffable) &&
      powerInBuild;

    if (
      gre.IsAggregated &&
      (effectType === eEffectType.SpeedFlying ||
        effectType === eEffectType.SpeedJumping ||
        effectType === eEffectType.SpeedRunning ||
        effectType === eEffectType.JumpHeight)
    ) {
      rankedEffect.Value = effectSource.DisplayPercentage
        ? `${(magSum * 100).toFixed(2)}%${toWhoShort}`
        : `${magSum.toFixed(2)}${toWhoShort}`;
    }

    switch (effectType) {
      case eEffectType.Fly:
      case eEffectType.MovementControl:
      case eEffectType.MovementFriction:
      case eEffectType.StealthRadius:
      case eEffectType.StealthRadiusPlayer:
        rankedEffect.Value = effectSource.DisplayPercentage
          ? `${(magSum * 100).toFixed(2)}%${toWhoShort}`
          : `${magSum.toFixed(2)}${toWhoShort}`;
        break;

      case eEffectType.Recovery:
      case eEffectType.Endurance:
      case eEffectType.Regeneration:
        rankedEffect.Name = String(effectType);
        rankedEffect.Value = effectSource.DisplayPercentage
          ? `${(magSum * 100).toFixed(2)}%${toWhoShort}`
          : `${magSum.toFixed(2)}${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.SilentKill:
        if (effectSource.ToWho === eToWho.Self) {
          rankedEffect.Name = 'Lifespan';
          rankedEffect.Value = `${Math.max(
            effectSource.Duration,
            Math.max(effectSource.DelayedTime ?? 0, effectSource.Absorbed_Duration ?? 0)
          ).toFixed(2)} s`;
          rankedEffect.ToolTip = greTooltip;
        }
        break;

      case eEffectType.EntCreate:
        rankedEffect.Name = 'Summon';
        rankedEffect.Value =
          effectSource.nSummon > -1
            ? `Level ${effectSource.nSummon}`
            : effectSource.Summon || 'Unknown';
        rankedEffect.ToolTip = greTooltip;
        break;

      default:
        // Use default values from FastItemBuilder if available
        if (!rankedEffect.Name) {
          rankedEffect.Name = gre.GetStatName(pEnh);
        }
        if (!rankedEffect.Value) {
          rankedEffect.Value = effectSource.DisplayPercentage
            ? `${(magSum * 100).toFixed(2)}%${toWhoShort}`
            : `${magSum.toFixed(2)}${toWhoShort}`;
        }
        if (!rankedEffect.ToolTip) {
          rankedEffect.ToolTip = greTooltip;
        }
        break;
    }
  }
}
