// Converted from C# StatsPowerData.cs
import type { IPower } from '../type/power';
import { eSpeedMeasure, eDamage, eMez, eEffectType } from './Enums';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { Statistics } from './Statistics';
import { DatabaseAPI } from './DatabaseAPI';

export interface PowerValueInfo {
  PowerName: string;
  PowerTaken: boolean;
  BaseValue: number;
  EnhValue: number | null;
  UncappedValue: number | null;
  Stacks: number | null;
  UnitSuffix: string;
  Tip: string;
}

export interface PowerValueInfoExt extends PowerValueInfo {
  Power: IPower | null;
}

export interface BuildMetadata {
  Name: string | null;
  PvMode: string;
  BuildFile: string | null;
  Archetype: string;
  Powersets: string[];
  SpeedFormat: eSpeedMeasure;
}

export interface TotalStat {
  DisplayName: string;
  BaseValue: number;
  EnhValue: number | null;
  UncappedValue: number | null;
  Tip: string;
}

export class TotalStats {
  Defense: TotalStat[] = [];
  Resistance: TotalStat[] = [];
  Health: TotalStat[] = [];
  Endurance: TotalStat[] = [];
  Movement: TotalStat[] = [];
  Stealth: TotalStat[] = [];
  MiscBuffs: TotalStat[] = [];
  StatusProtection: TotalStat[] = [];
  StatusResistance: TotalStat[] = [];
  DebuffResistance: TotalStat[] = [];
  Elusivity: TotalStat[] = [];
}

export enum TotalStatsGroups {
  Defense,
  Resistance,
  Health,
  Endurance,
  Movement,
  Stealth,
  MiscBuffs,
  StatusProtection,
  StatusResistance,
  DebuffResistance,
  Elusivity
}

export class StatsPowerData {
  PowerInfo: Map<number, PowerValueInfo[]> | null = new Map();
  Totals: TotalStats | null = new TotalStats();
  Metadata: BuildMetadata = {
    Name: null,
    PvMode: 'PvE',
    BuildFile: null,
    Archetype: '',
    Powersets: [],
    SpeedFormat: eSpeedMeasure.MilesPerHour
  };

  SetMetadata(
    name: string | null,
    buildFile: string | null,
    archetype: string,
    powersets: string[],
    speedFormat: eSpeedMeasure
  ): void {
    this.Metadata = {
      Name: name,
      PvMode: MidsContext.Config?.Inc?.DisablePvE ? 'PvP' : 'PvE',
      BuildFile: buildFile,
      Archetype: archetype,
      Powersets: powersets,
      SpeedFormat: MidsContext.Config?.SpeedFormat ?? eSpeedMeasure.MilesPerHour
    };
  }

  AddGroup(displayMode: number, pwValues: PowerValueInfo[]): boolean {
    if (this.PowerInfo) {
      this.PowerInfo.set(displayMode, pwValues);
      return true;
    }
    return false;
  }

  GetGroupData(displayMode: number): PowerValueInfo[] {
    return this.PowerInfo?.get(displayMode) ?? [];
  }

  ExportToJson(): string {
    return JSON.stringify(this, null, 2);
  }

  static ImportFromJson(jsonString: string): StatsPowerData | null {
    try {
      return JSON.parse(jsonString) as StatsPowerData;
    } catch {
      return null;
    }
  }

  SetTotals(): void {
    this.Totals = StatsPowerData.GetTotals();
  }

  static GetTotals(forcePvP: boolean = false): TotalStats {
    // Note: Full implementation would calculate all totals
    return new TotalStats();
  }
}

