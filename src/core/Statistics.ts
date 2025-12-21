// Converted from C# Statistics.cs
import type { Character } from './Base/Data_Classes/Character';
import { eSpeedMeasure } from './Enums';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { DatabaseAPI } from './DatabaseAPI';

export class Statistics {
  static readonly BaseMagic = 1.666667;
  static readonly MaxDefenseDebuffRes = 95;
  static readonly MaxGenericDebuffRes = 100; // All but defense that has a specific value
  static readonly MaxHaste = 400;

  private readonly _character: Character;

  constructor(character: Character) {
    this._character = character;
  }

  static get MaxRunSpeed(): number {
    return DatabaseAPI.ServerData.MaxRunSpeed;
  }

  static get MaxJumpSpeed(): number {
    return DatabaseAPI.ServerData.MaxJumpSpeed;
  }

  static get MaxFlySpeed(): number {
    return DatabaseAPI.ServerData.MaxFlySpeed;
  }

  static get BaseRunSpeed(): number {
    return DatabaseAPI.ServerData.BaseRunSpeed;
  }

  static get BaseJumpSpeed(): number {
    return DatabaseAPI.ServerData.BaseJumpSpeed;
  }

  static get BaseJumpHeight(): number {
    return DatabaseAPI.ServerData.BaseJumpHeight;
  }

  static get BaseFlySpeed(): number {
    return DatabaseAPI.ServerData.BaseFlySpeed;
  }


  static get BasePerception(): number {
    return DatabaseAPI.ServerData.BasePerception;
  }

  get EnduranceMaxEnd(): number {
    return this._character.Totals.EndMax + 100;
  }

  get EnduranceRecoveryNumeric(): number {
    return (
      this.EnduranceRecovery(false) *
      (this._character.Archetype!.BaseRecovery * Statistics.BaseMagic) *
      (this._character.TotalsCapped.EndMax / 100 + 1)
    );
  }

  get EnduranceRecoveryNumericUncapped(): number {
    return (
      this.EnduranceRecovery(true) *
      (this._character.Archetype!.BaseRecovery * Statistics.BaseMagic) *
      (this._character.Totals.EndMax / 100 + 1)
    );
  }

  get EnduranceTimeToFull(): number {
    return this.EnduranceMaxEnd / this.EnduranceRecoveryNumeric;
  }

  get EnduranceRecoveryNet(): number {
    return this.EnduranceRecoveryNumeric - this.EnduranceUsage;
  }

  get EnduranceRecoveryLossNet(): number {
    return -(this.EnduranceRecoveryNumeric - this.EnduranceUsage);
  }

  get EnduranceTimeToZero(): number {
    return this.EnduranceMaxEnd / -(this.EnduranceRecoveryNumeric - this.EnduranceUsage);
  }

  get EnduranceTimeToFullNet(): number {
    return this.EnduranceMaxEnd / (this.EnduranceRecoveryNumeric - this.EnduranceUsage);
  }

  get EnduranceUsage(): number {
    return this._character.Totals.EndUse;
  }

  get HealthRegenHealthPerSec(): number {
    return (
      this.HealthRegen(false) *
      this._character.Archetype!.BaseRegen *
      1.66666662693024
    );
  }

  get HealthRegenHPPerSec(): number {
    return (
      this.HealthRegen(false) *
      this._character.Archetype!.BaseRegen *
      1.66666662693024 *
      (this.HealthHitpointsNumeric(false) / 100)
    );
  }

  get HealthRegenTimeToFull(): number {
    return this.HealthHitpointsNumeric(false) / this.HealthRegenHPPerSec;
  }

  get HealthHitpointsPercentage(): number {
    return (this._character.TotalsCapped.HPMax / this._character.Archetype!.Hitpoints) * 100;
  }

  get BuffToHit(): number {
    return this._character.Totals.BuffToHit * 100;
  }

  get BuffAccuracy(): number {
    return this._character.Totals.BuffAcc * 100;
  }

  get BuffEndRdx(): number {
    return this._character.Totals.BuffEndRdx * 100;
  }

  get ThreatLevel(): number {
    return (this._character.Totals.ThreatLevel + this._character.Archetype!.BaseThreat) * 100;
  }

  private EnduranceRecovery(uncapped: boolean): number {
    return uncapped ? this._character.Totals.EndRec + 1 : this._character.TotalsCapped.EndRec + 1;
  }

  EnduranceRecoveryPercentage(uncapped: boolean): number {
    return this.EnduranceRecovery(uncapped) * 100;
  }

  private HealthRegen(uncapped: boolean): number {
    return uncapped ? this._character.Totals.HPRegen + 1 : this._character.TotalsCapped.HPRegen + 1;
  }

  HealthRegenPercent(uncapped: boolean): number {
    return this.HealthRegen(uncapped) * 100;
  }

  HealthHitpointsNumeric(uncapped: boolean): number {
    return uncapped ? this._character.Totals.HPMax : this._character.TotalsCapped.HPMax;
  }

  get Absorb(): number {
    return this._character.Totals.Absorb;
  }

  get Range(): number {
    return this._character.Totals.BuffRange;
  }

  get RangePercent(): number {
    return this._character.Totals.BuffRange * 100;
  }

  DamageResistance(dType: number, uncapped: boolean): number {
    return uncapped
      ? this._character.Totals.Res[dType] * 100
      : this._character.TotalsCapped.Res[dType] * 100;
  }

  Perception(uncapped: boolean): number {
    return uncapped
      ? this._character.Totals.Perception
      : this._character.TotalsCapped.Perception;
  }

  Defense(dType: number): number {
    return this._character.Totals.Def[dType] * 100;
  }

  Speed(iSpeed: number, unit: eSpeedMeasure, baseUnit?: eSpeedMeasure): number {
    // If baseUnit is provided, convert from baseUnit first
    if (baseUnit !== undefined && baseUnit !== unit) {
      // Convert from baseUnit to FeetPerSecond first
      let speedInFeetPerSecond = iSpeed;
      switch (baseUnit) {
        case eSpeedMeasure.MetersPerSecond:
          speedInFeetPerSecond = iSpeed / 0.3048;
          break;
        case eSpeedMeasure.MilesPerHour:
          speedInFeetPerSecond = iSpeed / 0.6818182;
          break;
        case eSpeedMeasure.KilometersPerHour:
          speedInFeetPerSecond = iSpeed / 1.09728;
          break;
        default:
          break;
      }
      // Then convert to target unit
      return this.Speed(speedInFeetPerSecond, unit);
    }
    
    // Standard conversion
    switch (unit) {
      case eSpeedMeasure.FeetPerSecond:
        return iSpeed;
      case eSpeedMeasure.MetersPerSecond:
        return iSpeed * 0.3048;
      case eSpeedMeasure.MilesPerHour:
        return iSpeed * 0.6818182;
      case eSpeedMeasure.KilometersPerHour:
        return iSpeed * 1.09728;
      default:
        return iSpeed;
    }
  }

  Distance(iDist: number, unit: eSpeedMeasure): number {
    switch (unit) {
      case eSpeedMeasure.FeetPerSecond:
        return iDist;
      case eSpeedMeasure.MetersPerSecond:
        return iDist * 0.3048;
      case eSpeedMeasure.MilesPerHour:
        return iDist;
      case eSpeedMeasure.KilometersPerHour:
        return iDist * 0.3048;
      default:
        return iDist;
    }
  }

  MovementRunSpeed(sType: eSpeedMeasure, uncapped: boolean): number {
    const iSpeed = uncapped
      ? MidsContext.Character?.Totals.RunSpd ?? 0
      : MidsContext.Character?.TotalsCapped.RunSpd ?? 0;
    return this.Speed(iSpeed, sType);
  }

  MovementFlySpeed(sType: eSpeedMeasure, uncapped: boolean): number {
    let iSpeed = this._character.Totals.FlySpd;
    if (!uncapped && this._character.Totals.FlySpd > this._character.Totals.MaxFlySpd) {
      iSpeed = this._character.Totals.MaxFlySpd;
    }
    return this.Speed(iSpeed, sType);
  }

  MovementJumpSpeed(sType: eSpeedMeasure, uncapped: boolean): number {
    let iSpeed = this._character.Totals.JumpSpd;
    if (!uncapped && this._character.Totals.JumpSpd > this._character.Totals.MaxJumpSpd) {
      iSpeed = this._character.Totals.MaxJumpSpd;
    }
    return this.Speed(iSpeed, sType);
  }

  MovementJumpHeight(sType: eSpeedMeasure): number {
    return sType === eSpeedMeasure.KilometersPerHour || sType === eSpeedMeasure.MetersPerSecond
      ? this._character.TotalsCapped.JumpHeight * 0.3048
      : this._character.TotalsCapped.JumpHeight;
  }

  BuffHaste(uncapped: boolean): number {
    return !uncapped
      ? Math.min(
          Statistics.MaxHaste,
          (this._character.TotalsCapped.BuffHaste + 1) * 100
        )
      : (this._character.Totals.BuffHaste + 1) * 100;
  }

  BuffDamage(uncapped: boolean): number {
    return !uncapped
      ? Math.min(
          (this._character.Archetype?.DamageCap ?? Infinity) * 100,
          (this._character.TotalsCapped.BuffDam + 1) * 100
        )
      : (this._character.Totals.BuffDam + 1) * 100;
  }
}

