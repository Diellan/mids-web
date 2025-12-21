// Converted from C# CSV.cs
export enum HEffect {
  PowerID,
  Table,
  Aspect,
  Attrib,
  Target,
  Scale,
  Type,
  AllowStrength,
  AllowResistance,
  Suppress,
  CancelEvents,
  AllowCombatMobs,
  CostumeName,
  EntityDef,
  PriorityList,
  Delay,
  Duration,
  Magnitude,
  StackType,
  Period,
  Chance,
  NearGround,
  CancelOnMiss,
  VanishOnTimeout,
  RadiusInner,
  RadiusOuter,
  Requires,
  MagnitudeExpr,
  DurationExpr,
  Reward,
  IgnoreSuppressErrors,
  DisplayFloat,
  DisplayAttackerHit,
  DisplayVictimHit,
  Order,
  ShowFloaters,
  ModeName,
  EffectId,
  BoostIgnoreDiminishing,
  BoostTemplate,
  PrimaryStringList,
  SecondaryStringList,
  ApplicationType,
  UseMagnitudeResistance,
  UseDurationResistance,
  UseMagnitudeCombatMods,
  UseDurationCombatMods,
  CasterStackType,
  StackLimit,
  ContinuingFX,
  ConditionalFX,
  Params,
  DisplayOnlyIfNotZero,
  MatchExactPower,
  DoNotTint,
  KeepThroughDeath,
  DelayEval,
  BoostModAllowed,
  EvalFlags,
  ProcsPerMinute
}

export enum BoostSet {
  Id,
  DisplayName,
  GroupName,
  MinLevel,
  MaxLevel
}

export class CSV {
  // Regex to split CSV line while respecting quoted fields
  private static readonly Reg = /,(?=(?:[^"]|"[^"]*")*$)/;

  static ToArray(iLine: string): string[] {
    const strArray = iLine.split(this.Reg);
    const chArray = ['"'];
    for (let index = 0; index < strArray.length; index++) {
      strArray[index] = strArray[index].trim().replace(/^"|"$/g, '');
    }
    return strArray;
  }

  static ExportCsv(arr: any[][]): string {
    let ret = '';
    let k = 0;
    for (const row of arr) {
      for (let j = 0; j < row.length; j++) {
        if (j > 0) {
          ret += ',';
        }
        const value = row[j];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          ret += `"${value.replace(/"/g, '""')}"`;
        } else {
          ret += value;
        }
      }
      ret += '\n';
      k++;
    }
    return ret;
  }
}

