// Converted from C# PowerGrantsMap.cs
import type { IPower } from '../type/power';
import type { IEffect } from '../type/effect';
import { eEffectType } from './Enums';

export interface GrantCount {
  Probability: number;
  BaseProbability: number;
  Effects: number;
  StartIndex: number;
}

export class PowerGrantsMap {
  readonly Map: Map<number, GrantCount>;
  private SourcePower: IPower;
  private BaseEffects: number;

  constructor(power: IPower) {
    this.SourcePower = power;
    // Note: Would need DatabaseAPI.GetPowerByFullName for full implementation
    const k = power.Effects.length;
    this.BaseEffects = k;
    this.Map = new Map<number, GrantCount>();

    for (let i = 0; i < power.Effects.length; i++) {
      if (power.Effects[i].EffectType !== eEffectType.GrantPower) {
        continue;
      }

      // Note: Would need DatabaseAPI access for full implementation
      const numEffects = power.Effects[i].nSummon < 0 ? 0 : 0; // Simplified

      this.Map.set(i, {
        Probability: power.Effects[i].Probability,
        BaseProbability: power.Effects[i].BaseProbability,
        Effects: numEffects,
        StartIndex: k
      });
    }
  }

  GetRealIndex(fxIndex: number, needOffset: boolean = true): number {
    return needOffset ? fxIndex + this.BaseEffects : fxIndex;
  }

  GetGrantRoot(fxIndex: number, needOffset: boolean = true): IEffect | null {
    const realIndex = this.GetRealIndex(fxIndex, needOffset);

    for (const [key, grc] of this.Map) {
      if (realIndex >= grc.StartIndex && realIndex < grc.StartIndex + grc.Effects) {
        return this.SourcePower.Effects[key];
      }
    }

    return null;
  }

  GetGrantProbability(
    fxIndex: number,
    getBaseProbability: boolean = false,
    needOffset: boolean = true
  ): number | null {
    const realIndex = this.GetRealIndex(fxIndex, needOffset);

    for (const [key, grc] of this.Map) {
      if (realIndex >= grc.StartIndex && realIndex < grc.StartIndex + grc.Effects) {
        return getBaseProbability
          ? this.SourcePower.Effects[key].BaseProbability
          : this.SourcePower.Effects[key].Probability;
      }
    }

    return null;
  }

  GetRanges(grantDetail: boolean = true): string[] {
    const ranges: string[] = [];
    for (const [key, value] of this.Map) {
      const endIndex = value.StartIndex + Math.max(0, value.Effects - 1);
      if (grantDetail) {
        ranges.push(`[${value.StartIndex}; ${endIndex}] => ${key}`);
      } else {
        ranges.push(`[${value.StartIndex}; ${endIndex}]`);
      }
    }
    return ranges;
  }
}

