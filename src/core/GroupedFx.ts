// Converted from C# GroupedFx.cs
import type { IPower } from './IPower';
import type { IEffect } from './IEffect';
import { eEffectType, eMez, eDamage, eToWho, ePvX, eSpecialCase, GetEffectName, GetEffectNameShort, eOverrideBoolean } from './Enums';
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
  for (const k of Array.from(dict.keys())) {
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

  /// <summary>
  /// Generate tooltip for a grouped effect.
  /// </summary>
  /// <param name="power">Source power</param>
  /// <param name="simple">Short effect text generation</param>
  /// <returns>Build effect string from each effect, then concatenate into a single string (one effect per line)</returns>
  GetTooltip(power: IPower, simple: boolean = false): string {
    let vectors = '';
    const statName = this.GetStatName(power);
    const groupedVector = this.GetGroupedVector(statName);
    let numDelays = 1;

    if (groupedVector !== '') {
      vectors = groupedVector;
    } else {
      const uniqueVectors: DelayedVector[] = [];
      const refEffect = power.Effects[this.IncludedEffects[0]];
      let vectorsChunks: DelayedVector[] = [];

      switch (refEffect.EffectType) {
        case eEffectType.SpeedFlying:
        case eEffectType.SpeedJumping:
        case eEffectType.SpeedRunning:
          vectorsChunks = this.IncludedEffects.map(e => ({
            Vector: String(power.Effects[e].EffectType),
            Delay: power.Effects[e].DelayedTime ?? 0
          }));
          break;

        case eEffectType.Mez:
        case eEffectType.MezResist:
          vectorsChunks = this.IncludedEffects.map(e => ({
            Vector: String(power.Effects[e].MezType),
            Delay: power.Effects[e].DelayedTime ?? 0
          }));
          break;

        case eEffectType.Enhancement:
          if (
            refEffect.ETModifies === eEffectType.Mez ||
            refEffect.ETModifies === eEffectType.MezResist
          ) {
            if (groupedVector !== '') {
              vectorsChunks = [{
                Vector: groupedVector,
                Delay: power.Effects[this.IncludedEffects[0]].DelayedTime ?? 0
              }];
            } else {
              vectorsChunks = this.IncludedEffects.map(e => ({
                Vector: String(power.Effects[e].MezType),
                Delay: power.Effects[e].DelayedTime ?? 0
              }));
            }
          } else if (
            refEffect.ETModifies === eEffectType.Defense ||
            refEffect.ETModifies === eEffectType.Resistance ||
            refEffect.ETModifies === eEffectType.Elusivity
          ) {
            if (groupedVector !== '') {
              vectorsChunks = [{
                Vector: `${groupedVector} ${refEffect.ETModifies}`,
                Delay: power.Effects[this.IncludedEffects[0]].DelayedTime ?? 0
              }];
            } else {
              vectorsChunks = this.IncludedEffects.map(e => {
                if (
                  power.Effects[e].ETModifies === eEffectType.Defense ||
                  power.Effects[e].ETModifies === eEffectType.Resistance ||
                  power.Effects[e].ETModifies === eEffectType.Elusivity
                ) {
                  return {
                    Vector: `${power.Effects[e].DamageType} ${power.Effects[e].ETModifies}`,
                    Delay: power.Effects[e].DelayedTime ?? 0
                  };
                } else {
                  return {
                    Vector: String(power.Effects[e].ETModifies),
                    Delay: power.Effects[e].DelayedTime ?? 0
                  };
                }
              });
            }
          } else {
            vectorsChunks = this.IncludedEffects.map(e => ({
              Vector: String(power.Effects[e].ETModifies),
              Delay: power.Effects[e].DelayedTime ?? 0
            }));
          }
          break;

        case eEffectType.Defense:
        case eEffectType.Resistance:
        case eEffectType.Elusivity:
        case eEffectType.DamageBuff:
          if (groupedVector !== '') {
            vectorsChunks = [{
              Vector: `${refEffect.EffectType}(${groupedVector})`,
              Delay: power.Effects[this.IncludedEffects[0]].DelayedTime ?? 0
            }];
          } else {
            vectorsChunks = this.IncludedEffects.map(e => ({
              Vector: String(power.Effects[e].DamageType),
              Delay: power.Effects[e].DelayedTime ?? 0
            }));
          }
          break;

        case eEffectType.ResEffect:
          vectorsChunks = this.IncludedEffects.map(e => ({
            Vector: String(power.Effects[e].ETModifies),
            Delay: power.Effects[e].DelayedTime ?? 0
          }));
          break;

        default:
          vectorsChunks = [];
          break;
      }

      addRangeUnique(uniqueVectors, vectorsChunks);
      uniqueVectors.splice(0, uniqueVectors.length, ...this.CompactVectorsList(uniqueVectors, refEffect.EffectType, refEffect.ETModifies));
      vectors = uniqueVectors.map(e => e.Vector).join(', ');
      numDelays = Math.max(1, Array.from(new Set(uniqueVectors.map(e => e.Delay))).length);
    }

    // Change stat name inside effect string with list of vectors
    // Use the first effect of the group as base
    const refEffect = power.Effects[this.IncludedEffects[0]];
    const sameKindBuff = this.GetEffects(power).every(e =>
      e.EffectType === refEffect.EffectType &&
      e.DamageType === refEffect.DamageType &&
      e.MezType === refEffect.MezType &&
      e.ETModifies === refEffect.ETModifies
    );

    const maxRange =
      (this.IsAggregated &&
        this.NumEffects > 1 &&
        this.GetEffects(power).some(e => e.BuffedMag !== power.Effects[this.IncludedEffects[0]].BuffedMag)) ||
      numDelays > 1 ||
      sameKindBuff
        ? this.NumEffects
        : 1;

    const altList: number[] = [];
    const delaysDict = new Map<number, string>();
    if (numDelays <= 1) {
      const fxStrings = this.IncludedEffects.map(e =>
        power.Effects[e].BuildEffectString(simple, '', false, false, false, simple, false, true)
      );

      const delayMatches = fxStrings.map((e, i) => {
        const match = e.match(/after ([0-9.]+) (delay|second)/);
        return {
          index: i,
          delay: match ? match[1] : '0'
        };
      });

      const uniqueDelays = delayMatches.filter((e, index, arr) =>
        arr.findIndex(d => d.delay === e.delay) === index
      );

      uniqueDelays.forEach(e => delaysDict.set(e.index, e.delay));
      altList.push(...Array.from(delaysDict.keys()));
    }

    const useAltList = altList.length > 0 && Array.from(delaysDict.values()).some(e => GroupedFx.ParseFloat(e) > 0);
    let tip = '';

    for (let i = 0; i < (useAltList ? altList.length : maxRange); i++) {
      const index = useAltList ? altList[i] : i;

      const baseEffectString = power.Effects[this.IncludedEffects[index]].BuildEffectString(
        simple, '', false, false, false, simple, false, true
      );

      let fxTip: string;
      switch (power.Effects[this.IncludedEffects[index]].EffectType) {
        case eEffectType.SpeedFlying:
        case eEffectType.SpeedJumping:
        case eEffectType.SpeedRunning:
          fxTip = statName === 'Slow'
            ? GroupedFx.InvertStringValue(
                baseEffectString.replace(
                  /(SpeedFlying|SpeedJumping|SpeedRunning)/g,
                  'Slow'
                )
              )
            : baseEffectString.replace(
                /(SpeedFlying|SpeedJumping|SpeedRunning)/g,
                vectors
              );
          break;

        case eEffectType.Mez:
        case eEffectType.MezResist:
          fxTip = baseEffectString.replace(
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].MezType})`,
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors})`
          );
          break;

        case eEffectType.Enhancement:
          if (
            power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.Mez ||
            power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.MezResist
          ) {
            fxTip = baseEffectString.replace(
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].MezType})`,
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors === 'All' && power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.Mez ? 'Mez' : vectors})`
            );
          } else if (
            power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.Defense ||
            power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.Resistance ||
            power.Effects[this.IncludedEffects[index]].ETModifies === eEffectType.Elusivity
          ) {
            const lastEffect = power.Effects[this.IncludedEffects[this.IncludedEffects.length - 1]];
            const shouldAddType =
              (lastEffect.ETModifies === eEffectType.Defense ||
                lastEffect.ETModifies === eEffectType.Resistance ||
                lastEffect.ETModifies === eEffectType.Elusivity) &&
              vectors.includes('All');

            fxTip = baseEffectString.replace(
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].DamageType} ${power.Effects[this.IncludedEffects[index]].ETModifies})`,
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors}${shouldAddType ? ` ${lastEffect.ETModifies}` : ''})`
            );
          } else {
            fxTip = baseEffectString.replace(
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].ETModifies})`,
              `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors})`
            );
          }
          break;

        case eEffectType.Resistance:
        case eEffectType.Defense:
        case eEffectType.Elusivity:
        case eEffectType.DamageBuff:
          fxTip = baseEffectString.replace(
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].DamageType})`,
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors})`
          );
          break;

        case eEffectType.ResEffect:
          fxTip = baseEffectString.replace(
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${power.Effects[this.IncludedEffects[index]].ETModifies})`,
            `${power.Effects[this.IncludedEffects[index]].EffectType}(${vectors})`
          );
          break;

        case eEffectType.SilentKill:
          fxTip = baseEffectString
            .replace('SilentKill', 'Self-Destructs')
            .replace(' in ', ' after ')
            .replace(' to Self', '')
            .replace(' to Target', '');
          break;

        default:
          fxTip = baseEffectString;
          break;
      }

      tip += `${tip === '' ? '' : '\r\n'}${fxTip}`;
    }

    return tip
      .replace(/([0-9A-Za-z\-]+)\(\1/g, '$1') // statName(statName (both same expression match)
      .replace('((', '(')
      .replace('))', ')')
      .replace('None Defense', 'Base Defense');
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

  /// <summary>
  /// Generates a list of PairedListItems from the provided grouped ranked effects.
  /// </summary>
  /// <param name="groupedRankedEffects">The grouped ranked effects to process.</param>
  /// <param name="pBase">The base power.</param>
  /// <param name="pEnh">The enhanced power.</param>
  /// <param name="rankedEffects">The ranked effects indices.</param>
  /// <param name="displayBlockFontSize">The font size for display blocks.</param>
  /// <returns>A list of key-value pairs where the key is the GroupedFx and the value is the corresponding PairedListItem.</returns>
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

      const rankedEffect = FastItemBuilder.GetRankedEffect(rankedEffects, greIndex, pBase, pEnh);
      GroupedFx.FinalizeListItem(rankedEffect, pBase, pEnh, gre, rankedEffects[greIndex], powerInBuild, displayBlockFontSize);

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
      pBase.AbsorbPetEffects();
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
        rankedEffect.Name = eEffectType[effectType];
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
            ? DatabaseAPI.Database.Entities[effectSource.nSummon].DisplayName
            : (effectSource.Summon || '').replace(/^(MastermindPets|Pets|Villain_Pets)_/, '');
        if (gre.NumEffects > 1) {
          rankedEffect.Value += ` x${gre.NumEffects}`;
        }
        if (effectSource.nSummon > -1) {
          let entityTooltip = gre
            .IncludedEffects.map(e => pEnh.Effects[e])
            .sort((a, b) => a.DelayedTime - b.DelayedTime)
            .map(e => e.BuildEffectString(false, '', false, false, false, false, false, true))
            .join('\r\n');

          const entityPowersets = DatabaseAPI.Database.Entities[effectSource.nSummon].GetNPowerset();
          if (entityPowersets.length > 0 && entityPowersets[0] > -1) {
            const entityPowerset = DatabaseAPI.Database.Powersets[entityPowersets[0]];
            entityTooltip += '\r\n\r\nEntity has the following Powers:';
            for (const p of entityPowerset.Power) {
              const epShortDesc = this.GeneratePowerDescShort(DatabaseAPI.Database.Power[p]);
              entityTooltip += `\r\n- ${DatabaseAPI.Database.Power[p].DisplayName}`;
              if (
                epShortDesc &&
                (!DatabaseAPI.Database.Power[p].DescShort ||
                  DatabaseAPI.Database.Power[p].DescShort.toLowerCase() ===
                    DatabaseAPI.Database.Power[p].DisplayName.toLowerCase())
              ) {
                entityTooltip += ` (${epShortDesc})`;
              } else if (DatabaseAPI.Database.Power[p].DescShort) {
                entityTooltip += ` (${DatabaseAPI.Database.Power[p].DescShort})`;
              }
            }
            entityTooltip += '\r\n\r\nTo see the effects of these Powers, Left-Click on the Entity.';
          }

          // Note: EntTag would be set here if needed
          rankedEffect.ToolTip = entityTooltip;
        } else {
          rankedEffect.ToolTip = greTooltip;
        }
        break;

      case eEffectType.GrantPower:
        rankedEffect.Name = 'Grant';
        if (effectSource.nSummon > -1) {
          rankedEffect.Value = DatabaseAPI.Database.Power[effectSource.nSummon].DisplayName;
          const mainEffectTip = effectSource.BuildEffectString(false, '', false, false, false, false, false, true);
          const subEffectsTip = DatabaseAPI.Database.Power[effectSource.nSummon].Effects
            .filter(
              e =>
                (e.PvMode === ePvX.Any ||
                  (e.PvMode === ePvX.PvE && !MidsContext.Config.Inc.DisablePvE) ||
                  (e.PvMode === ePvX.PvP && MidsContext.Config.Inc.DisablePvE)) &&
                (!e.ActiveConditionals || !e.ActiveConditionals.length || e.ValidateConditional())
            )
            .map(e =>
              e
                .BuildEffectString(false, '', false, false, false, false, false, true)
                .replace(/\r\n/g, '\n')
                .replace(/\n/g, ' -- ')
                .replace(/  /g, ' ')
            )
            .join('\r\n');
          rankedEffect.ToolTip = `${mainEffectTip}\r\n----------\r\n${subEffectsTip}`;
        }
        break;

      case eEffectType.LevelShift:
        rankedEffect.Name = 'LvlShift';
        rankedEffect.Value = `${effectSource.Mag > 0 ? '+' : ''}${effectSource.Mag.toFixed(2)}`;
        break;

      case eEffectType.RevokePower:
        rankedEffect.Name = 'Revoke';
        rankedEffect.Value =
          effectSource.nSummon > -1
            ? DatabaseAPI.Database.Entities[effectSource.nSummon].DisplayName
            : (effectSource.Summon || '').replace(/^(MastermindPets|Pets|Villain_Pets)_/, '');
        break;

      case eEffectType.DamageBuff:
        const isDefiance =
          effectSource.SpecialCase === eSpecialCase.Defiance &&
          effectSource.ValidateConditional('Active', 'Defiance') ||
          (defiancePower && MidsContext.Character?.CurrentBuild?.PowerActive(defiancePower));
        rankedEffect.Name = isDefiance
          ? 'Defiance'
          : FastItemBuilder.Str.ShortStr(
              displayBlockFontSize,
              GetEffectName(effectSource.EffectType),
              GetEffectNameShort(effectSource.EffectType)
            );
        rankedEffect.Value = `${(effectSource.BuffedMag * 100).toFixed(2)}%${toWhoShort}`;
        rankedEffect.ToolTip = isDefiance
          ? effectSource.BuildEffectString(false, 'DamageBuff (Defiance)', false, false, false, true)
          : greTooltip;
        break;

      case eEffectType.Mez:
        if (gre.NumEffects === 1) {
          rankedEffect.Name =
            effectSource.MezType === eMez.Teleport
              ? 'TP'
              : effectSource.MezType === eMez.Knockback
                ? 'KB'
                : effectSource.MezType === eMez.Knockup
                  ? 'KUp'
                  : eMez[effectSource.MezType];
        }

        const minDuration = Math.min(...gre.IncludedEffects.map(e => pEnh.Effects[e].Duration));
        const maxDuration = Math.max(...gre.IncludedEffects.map(e => pEnh.Effects[e].Duration));
        const minMaxDuration =
          Math.abs(minDuration - maxDuration) > Number.EPSILON
            ? `${minDuration > 0 ? `${minDuration.toFixed(2)}s` : 'Up to'} ${maxDuration.toFixed(2)}s`
            : `${maxDuration.toFixed(2)}s`;

        if (effectSource.ToWho === eToWho.Target && !sameKindBuff) {
          rankedEffect.Value =
            [eMez.Knockback, eMez.Knockup, eMez.Teleport].includes(effectSource.MezType)
              ? `${effectSource.BuffedMag.toFixed(2)} (Tgt)`
              : `${effectSource.Duration.toFixed(2)}s (Mag ${effectSource.BuffedMag.toFixed(2)}, to Tgt)`;
        } else if (effectSource.ToWho === eToWho.Self && !sameKindBuff) {
          rankedEffect.Value = `${effectSource.BuffedMag.toFixed(2)} (Slf)`;
        } else if (effectSource.ToWho === eToWho.Target && sameKindBuff) {
          rankedEffect.Value =
            [eMez.Knockback, eMez.Knockup, eMez.Teleport].includes(effectSource.MezType)
              ? `${magSum.toFixed(2)} (Tgt)`
              : `${minMaxDuration} (Mag ${magSum.toFixed(2)}, to Tgt)`;
        } else if (effectSource.ToWho === eToWho.Self && sameKindBuff) {
          rankedEffect.Value = `${magSum.toFixed(2)} (Slf)`;
        }

        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.Translucency:
        rankedEffect.Name = 'Trnslcncy';
        rankedEffect.Value = effectSource.DisplayPercentage
          ? `${(effectSource.BuffedMag * 100).toFixed(2)}%${toWhoShort}`
          : `${effectSource.BuffedMag.toFixed(2)}${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.SpeedFlying:
      case eEffectType.SpeedJumping:
      case eEffectType.SpeedRunning:
        if (gre.GetStatName(pEnh) === 'Slow') {
          rankedEffect.Name = 'Slow';
          rankedEffect.Value = this.InvertStringValue(rankedEffect.Value);
        } else if (
          gre.NumEffects > 1 &&
          gre.IncludedEffects.some(e => pEnh.Effects[e].EffectType !== pEnh.Effects[gre.IncludedEffects[0]].EffectType)
        ) {
          rankedEffect.Name = `${(gre.IsAggregated ? magSum : effectSource.Mag) < 0 ? '-' : ''}Movement`;
        }
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.Resistance:
      case eEffectType.Defense:
      case eEffectType.Elusivity:
      case eEffectType.MezResist:
      case eEffectType.Enhancement:
      case eEffectType.ResEffect:
        rankedEffect.Name =
          effectType === eEffectType.Enhancement
            ? gre.NumEffects > 1
              ? effectSource.Mag < 0
                ? 'Debuff'
                : 'Enhancement'
              : `${effectSource.Mag < 0 ? '-' : '+'}${eEffectType[effectSource.ETModifies]}`
            : FastItemBuilder.Str.ShortStr(
                displayBlockFontSize,
                GetEffectName(effectSource.EffectType),
                GetEffectNameShort(effectSource.EffectType)
              );
        rankedEffect.Value = effectSource.DisplayPercentage
          ? `${(effectSource.BuffedMag * 100).toFixed(2)}%${toWhoShort}`
          : `${effectSource.BuffedMag.toFixed(2)}${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.PerceptionRadius:
        rankedEffect.Name = `Pceptn${toWhoShort}`;
        rankedEffect.Value = `${
          effectSource.DisplayPercentage ? `${(magSum * 100).toFixed(2)}%` : `${magSum.toFixed(2)}`
        } (${(DatabaseAPI.ServerData.BasePerception * magSum).toFixed(2)}ft)`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.ToHit:
        rankedEffect.Name = 'ToHit';
        rankedEffect.Value = `${(gre.Mag * 100).toFixed(2)}%${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.RechargeTime:
        rankedEffect.Value = `${(gre.Mag * 100).toFixed(2)}%${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.Heal:
        rankedEffect.Name = `Heal${toWhoShort}`;
        rankedEffect.Value =
          effectSource.DisplayPercentage && effectSource.DisplayPercentageOverride === eOverrideBoolean.TrueOverride
            ? `${(gre.Mag * 100).toFixed(2)}% HP`
            : `${gre.Mag.toFixed(2)} HP (${(
                (gre.Mag / MidsContext.Character!.DisplayStats.HealthHitpointsNumeric(false)) *
                100
              ).toFixed(2)}%)`;
        rankedEffect.ToolTip = greTooltip;
        break;

      case eEffectType.MaxRunSpeed:
      case eEffectType.MaxJumpSpeed:
      case eEffectType.MaxFlySpeed:
      case eEffectType.EnduranceDiscount:
      case eEffectType.ThreatLevel:
        rankedEffect.Value = `${(gre.Mag * 100).toFixed(2)}%${toWhoShort}`;
        rankedEffect.ToolTip = greTooltip;
        break;

      default:
        const configDisablePvE = MidsContext.Config?.Inc?.DisablePvE ?? false;
        rankedEffect.Value = `${magSum.toFixed(2)}${effectSource.DisplayPercentage ? '%' : ''}${toWhoShort}`;
        rankedEffect.Name = FastItemBuilder.Str.ShortStr(
          displayBlockFontSize,
          GetEffectName(effectSource.EffectType),
          GetEffectNameShort(effectSource.EffectType)
        );
        rankedEffect.ToolTip = pEnh.Effects
          .filter(
            e =>
              ((configDisablePvE && e.PvMode === ePvX.PvP) ||
                (!configDisablePvE && e.PvMode === ePvX.PvE) ||
                e.PvMode === ePvX.Any) &&
              Math.abs(e.BuffedMag) > Number.EPSILON &&
              e.ToWho === effectSource.ToWho &&
              e.EffectType === effectSource.EffectType &&
              e.MezType === effectSource.MezType &&
              e.ETModifies === effectSource.ETModifies &&
              (e.PvMode === effectSource.PvMode || e.PvMode === ePvX.Any) &&
              e.IgnoreScaling === effectSource.IgnoreScaling
          )
          .map(e => e.BuildEffectString(false, '', false, false, false, true))
          .join('\r\n');
        break;
    }
  }

  private static InvertStringValue(value: string): string {
    return value.startsWith('-') ? value.substring(1) : `-${value}`;
  }

  private static GeneratePowerDescShort(power: IPower | null): string {
    if (!power) return '';

    const effectShorts: string[] = [];
    const fxIdList: FxId[] = [];
    let effects = [...power.Effects];
    effects = effects
      .sort((a, b) => a.ToWho - b.ToWho)
      .filter(
        e =>
          ![
            eEffectType.Null,
            eEffectType.NullBool,
            eEffectType.Meter,
            eEffectType.Damage,
            eEffectType.MaxFlySpeed,
            eEffectType.MaxJumpSpeed,
            eEffectType.MaxRunSpeed,
            eEffectType.ExecutePower,
            eEffectType.RevokePower,
            eEffectType.GlobalChanceMod,
            eEffectType.SetMode,
            eEffectType.SetCostume,
          ].includes(e.EffectType) &&
          ![
            eEffectType.Null,
            eEffectType.NullBool,
          ].includes(e.ETModifies) &&
          e.ToWho !== eToWho.Unspecified &&
          Math.abs(e.BuffedMag) >= Number.EPSILON &&
          (e.PvMode === ePvX.Any ||
            (e.PvMode === ePvX.PvE && !MidsContext.Config.Inc.DisablePvE) ||
            (e.PvMode === ePvX.PvP && MidsContext.Config.Inc.DisablePvE)) &&
          (!e.ActiveConditionals || !e.ActiveConditionals.length || e.ValidateConditional())
      );

    for (const effect of effects) {
      let fxIdentifier: FxId;
      switch (effect.EffectType) {
        case eEffectType.MezResist:
        case eEffectType.Mez:
          fxIdentifier = {
            EffectType: effect.EffectType,
            DamageType: eDamage.None,
            MezType: effect.MezType,
            ETModifies: eEffectType.None,
            ToWho: effect.ToWho,
            PvMode: effect.PvMode,
            SummonId: -1,
            Duration: 0,
            IgnoreScaling: effect.IgnoreScaling,
          };
          break;
        case eEffectType.ResEffect:
        case eEffectType.Enhancement:
          fxIdentifier = {
            EffectType: effect.EffectType,
            DamageType: eDamage.None,
            MezType: eMez.None,
            ETModifies: effect.ETModifies,
            ToWho: effect.ToWho,
            PvMode: effect.PvMode,
            SummonId: -1,
            Duration: 0,
            IgnoreScaling: effect.IgnoreScaling,
          };
          break;
        default:
          fxIdentifier = {
            EffectType: effect.EffectType,
            DamageType: eDamage.None,
            MezType: eMez.None,
            ETModifies: eEffectType.None,
            ToWho: effect.ToWho,
            PvMode: effect.PvMode,
            SummonId: -1,
            Duration: 0,
            IgnoreScaling: effect.IgnoreScaling,
          };
          break;
      }

      if (fxIdList.some(fx => GroupedFx.FxIdEquals(fx, fxIdentifier))) {
        continue;
      }

      const toWho =
        effects.length === 1 ||
        (effects.indexOf(effect) < effects.length - 1 &&
          effect.ToWho !== effects[effects.indexOf(effect) + 1].ToWho) ||
        (effects.indexOf(effect) < effects.length - 1 &&
          [eEffectType.Mez, eEffectType.Enhancement].includes(
            effects[effects.indexOf(effect) + 1].EffectType
          )) ||
        (effects.length > 1 && effects.indexOf(effect) === effects.length - 1)
          ? effect.ToWho === eToWho.Self
            ? ' (Self)'
            : effect.ToWho === eToWho.Target
              ? ' (Target)'
              : ''
          : '';

      const mezType =
        effect.ToWho === eToWho.Self
          ? eMez[effect.MezType]
          : effect.MezType === eMez.Held
            ? 'Hold'
            : effect.MezType === eMez.Stunned
              ? 'Stun'
              : effect.MezType === eMez.Confused
                ? 'Confuse'
                : effect.MezType === eMez.Immobilized
                  ? 'Immobilize'
                  : effect.MezType === eMez.Terrorized
                    ? 'Fear'
                    : eMez[effect.MezType];

      let effectShort: string;
      switch (effect.EffectType) {
        case eEffectType.ResEffect:
          effectShort = `${effect.BuffedMag < 0 ? '-' : ''}${effect.EffectType} (${effect.ETModifies})${toWho}`;
          break;
        case eEffectType.MezResist:
          effectShort = `(${effect.EffectType} (${effect.MezType})${toWho}`;
          break;
        case eEffectType.Mez:
          effectShort = `${effect.ToWho} ${mezType}`;
          break;
        case eEffectType.Enhancement:
          effectShort = `${effect.ToWho} ${effect.BuffedMag > 0 ? '+' : '-'}${effect.ETModifies}`;
          break;
        default:
          effectShort = `${effect.BuffedMag < 0 ? '-' : ''}${effect.EffectType}${toWho}`;
          break;
      }

      effectShorts.push(effectShort);
      fxIdList.push(fxIdentifier);
    }

    return effectShorts.join(', ');
  }

  private static ParseFloat(value: string, defaultValue: number = 0): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private CompactVectorsList(vectors: DelayedVector[], effectType: eEffectType, etModifies: eEffectType): DelayedVector[] {
    if (vectors.length === 0) return vectors;

    const result: DelayedVector[] = [];
    const grouped = new Map<string, DelayedVector[]>();

    // Group by delay
    for (const vector of vectors) {
      const key = vector.Delay.toString();
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(vector);
    }

    // Process each delay group
    for (const [delayStr, delayVectors] of Array.from(grouped)) {
      const uniqueVectors = Array.from(new Set(delayVectors.map(v => v.Vector)));
      const delay = parseFloat(delayStr);

      if (uniqueVectors.length === 1) {
        result.push({ Vector: uniqueVectors[0], Delay: delay });
      } else if (uniqueVectors.length === delayVectors.length) {
        // All different, keep as is
        result.push(...delayVectors.map(v => ({ ...v, Delay: delay })));
      } else {
        // Check for special cases
        if (
          (effectType === eEffectType.Mez || effectType === eEffectType.MezResist) &&
          uniqueVectors.length > 1
        ) {
          result.push({ Vector: 'All', Delay: delay });
        } else if (
          (effectType === eEffectType.Defense ||
            effectType === eEffectType.Resistance ||
            effectType === eEffectType.Elusivity ||
            effectType === eEffectType.DamageBuff) &&
          uniqueVectors.length > 1
        ) {
          result.push({ Vector: 'All', Delay: delay });
        } else if (
          effectType === eEffectType.Enhancement &&
          (etModifies === eEffectType.Defense ||
            etModifies === eEffectType.Resistance ||
            etModifies === eEffectType.Elusivity) &&
          uniqueVectors.length > 1
        ) {
          result.push({ Vector: 'All', Delay: delay });
        } else {
          // Keep unique vectors
          uniqueVectors.forEach(vector => {
            result.push({ Vector: vector, Delay: delay });
          });
        }
      }
    }

    return result;
  }

  private static FxIdEquals(a: FxId, b: FxId): boolean {
    return (
      a.EffectType === b.EffectType &&
      a.DamageType === b.DamageType &&
      a.MezType === b.MezType &&
      a.ETModifies === b.ETModifies &&
      a.ToWho === b.ToWho &&
      a.PvMode === b.PvMode &&
      a.IgnoreScaling === b.IgnoreScaling
    );
  }
}
