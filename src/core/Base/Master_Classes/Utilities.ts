// Converted from C# Utilities.cs
import { eEnhRelative } from '../../Enums';
import { DatabaseAPI } from '../../DatabaseAPI';

export class RelLevel {
  static UpOne(relLevel: eEnhRelative): eEnhRelative {
    switch (relLevel) {
      case eEnhRelative.MinusThree:
        return eEnhRelative.MinusTwo;
      case eEnhRelative.MinusTwo:
        return eEnhRelative.MinusOne;
      case eEnhRelative.MinusOne:
        return eEnhRelative.Even;
      case eEnhRelative.Even:
        return eEnhRelative.PlusOne;
      case eEnhRelative.PlusOne:
        return eEnhRelative.PlusTwo;
      case eEnhRelative.PlusTwo:
        return eEnhRelative.PlusThree;
      case eEnhRelative.PlusThree:
        return eEnhRelative.PlusFour;
      case eEnhRelative.PlusFour:
        return eEnhRelative.PlusFive;
      case eEnhRelative.PlusFive:
        return eEnhRelative.PlusFive;
      default:
        return eEnhRelative.Even;
    }
  }

  static readonly Maximum = eEnhRelative.PlusFive;
  static readonly Minimum = eEnhRelative.MinusThree;
  static readonly Neutral = eEnhRelative.Even;
}

export class Utilities {
  static FixDP(iNum: number, maxDecimal?: number): string {
    // If maxDecimal is not provided, determine it based on the number
    if (maxDecimal === undefined) {
      maxDecimal = iNum < 100 && iNum > -100 ? 2 : 1;
    }
    
    let format = '0.';
    if (iNum >= 10 || iNum <= -10) {
      format = '###0.';
    }

    for (let index = 0; index < maxDecimal; index++) {
      format += '#';
    }

    return iNum.toFixed(maxDecimal);
  }

  static ModifiedEffectString(effectString: { value: string }, collection: number): void {
    const matchCollection1: Map<RegExp, string> = new Map([
      [
        /(DamageBuff\(Smashing\), \d.*% DamageBuff\(Lethal\), \d.*% DamageBuff\(Fire\), \d.*% DamageBuff\(Cold\), \d.*% DamageBuff\(Energy\), \d.*% DamageBuff\(Negative\), \d.*% DamageBuff\(Toxic\), \d.*% DamageBuff\(Psionic\))/,
        'DamageBuff(All)'
      ],
      [
        /(Defense\(Melee\), \d.*% Defense\(AoE\), \d.*% Defense\(Ranged\), \d.*% Defense\(Smashing\), \d.*% Defense\(Lethal\), \d.*% Defense\(Fire\), \d.*% Defense\(Cold\), \d.*% Defense\(Energy\), \d.*% Defense\(Negative\), \d.*% Defense\(Psionic\))/,
        'Defense(All)'
      ]
      // Note: More regex patterns would be added here
    ]);

    // Note: Implementation would apply regex replacements
    if (collection === 1) {
      for (const [pattern, replacement] of matchCollection1) {
        effectString.value = effectString.value.replace(pattern, replacement);
      }
    }
  }

  static GetEnhClassById(id: number): number {
    const index = DatabaseAPI.Database.EnhancementClasses.findIndex(e => e.ID === id);
    return Math.max(0, index);
  }

  static TimeConverter(time: number): string {
    const words = ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'];
    // Note: Implementation would convert time to human-readable format
    return '';
  }
}

