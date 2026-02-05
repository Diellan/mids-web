import { describe, it, expect } from 'vitest';
import {
  StringToFlaggedEnum,
  StringToArray,
  IsEnumValue,
  eEnhance,
  eEntity,
  eModeFlags,
  eEffectType
} from '../src/core/Enums';

describe('Enums Utility Functions', () => {
  describe('StringToArray', () => {
    it('should split comma-separated string and sort', () => {
      const result = StringToArray('Damage, Accuracy, Heal');
      expect(result).toEqual(['Accuracy', 'Damage', 'Heal']);
    });

    it('should handle null and undefined', () => {
      expect(StringToArray(null)).toEqual([]);
      expect(StringToArray(undefined)).toEqual([]);
      expect(StringToArray('')).toEqual([]);
    });

    it('should handle comma with space', () => {
      const result = StringToArray('Fire, Cold, Energy');
      expect(result).toEqual(['Cold', 'Energy', 'Fire']);
    });
  });

  describe('IsEnumValue', () => {
    it('should return true for valid enum name (case insensitive)', () => {
      expect(IsEnumValue('Accuracy', eEnhance)).toBe(true);
      expect(IsEnumValue('accuracy', eEnhance)).toBe(true);
      expect(IsEnumValue('ACCURACY', eEnhance)).toBe(true);
    });

    it('should return false for invalid enum name', () => {
      expect(IsEnumValue('InvalidName', eEnhance)).toBe(false);
      expect(IsEnumValue('NotAnEnum', eEnhance)).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(IsEnumValue(null, eEnhance)).toBe(false);
      expect(IsEnumValue(undefined, eEnhance)).toBe(false);
    });

    it('should work with different enums', () => {
      expect(IsEnumValue('Damage', eEffectType)).toBe(true);
      expect(IsEnumValue('Heal', eEffectType)).toBe(true);
      expect(IsEnumValue('InvalidEffect', eEffectType)).toBe(false);
    });
  });

  describe('StringToFlaggedEnum', () => {
    describe('Single value conversion (non-flagged)', () => {
      it('should convert single enum name to value', () => {
        const result = StringToFlaggedEnum('Accuracy', eEnhance);
        expect(result).toBe(eEnhance.Accuracy);
      });

      it('should be case insensitive', () => {
        const result1 = StringToFlaggedEnum('accuracy', eEnhance);
        const result2 = StringToFlaggedEnum('ACCURACY', eEnhance);
        const result3 = StringToFlaggedEnum('Accuracy', eEnhance);
        expect(result1).toBe(eEnhance.Accuracy);
        expect(result2).toBe(eEnhance.Accuracy);
        expect(result3).toBe(eEnhance.Accuracy);
      });

      it('should return 0 for invalid enum name', () => {
        const result = StringToFlaggedEnum('InvalidEnum', eEnhance);
        expect(result).toBe(0);
      });

      it('should return 0 for empty string', () => {
        const result = StringToFlaggedEnum('', eEnhance);
        expect(result).toBe(0);
      });

      it('should work with different enums', () => {
        const result = StringToFlaggedEnum('Damage', eEffectType);
        expect(result).toBe(eEffectType.Damage);
      });
    });

    describe('Flagged enum conversion (bitwise)', () => {
      it('should sum multiple values separated by spaces', () => {
        const result = StringToFlaggedEnum('Caster Player', eEntity);
        expect(result).toBe(eEntity.Caster + eEntity.Player);
        expect(result).toBe(3); // 1 + 2
      });

      it('should sum multiple values separated by commas', () => {
        const result = StringToFlaggedEnum('Caster,Player,Teammate', eEntity);
        expect(result).toBe(eEntity.Caster + eEntity.Player + eEntity.Teammate);
        expect(result).toBe(11); // 1 + 2 + 8
      });

      it('should handle mixed comma and space separation', () => {
        const result = StringToFlaggedEnum('Arena, Domination', eModeFlags);
        expect(result).toBe(eModeFlags.Arena + eModeFlags.Domination);
        expect(result).toBe(4097); // 1 + 4096
      });

      it('should ignore empty strings in array', () => {
        const result = StringToFlaggedEnum('Caster  Player', eEntity); // double space
        expect(result).toBe(eEntity.Caster + eEntity.Player);
      });

      it('should handle complex flagged combinations', () => {
        const result = StringToFlaggedEnum(
          'Melee_Attack,Ranged_Attack,Smashing_Attack',
          {
            None: 0,
            Melee_Attack: 1,
            Ranged_Attack: 2,
            AOE_Attack: 4,
            Smashing_Attack: 8
          }
        );
        expect(result).toBe(11); // 1 + 2 + 8
      });
    });

    describe('noFlag parameter', () => {
      it('should return first match when noFlag is true', () => {
        const result = StringToFlaggedEnum('Caster Player', eEntity, true);
        expect(result).toBe(eEntity.Caster);
        expect(result).toBe(1);
      });

      it('should sum values when noFlag is false (default)', () => {
        const result = StringToFlaggedEnum('Caster Player', eEntity, false);
        expect(result).toBe(eEntity.Caster + eEntity.Player);
        expect(result).toBe(3);
      });

      it('should sum values when noFlag is not specified', () => {
        const result = StringToFlaggedEnum('Caster Player', eEntity);
        expect(result).toBe(eEntity.Caster + eEntity.Player);
        expect(result).toBe(3);
      });
    });

    describe('Edge cases', () => {
      it('should handle single valid value with trailing/leading spaces', () => {
        const result = StringToFlaggedEnum(' Accuracy ', eEnhance);
        expect(result).toBe(eEnhance.Accuracy);
      });

      it('should return 0 when no valid enum names found', () => {
        const result = StringToFlaggedEnum('Invalid1,Invalid2,Invalid3', eEnhance);
        expect(result).toBe(0);
      });

      it('should skip invalid names and sum valid ones', () => {
        const result = StringToFlaggedEnum('Caster,InvalidName,Player', eEntity);
        expect(result).toBe(eEntity.Caster + eEntity.Player);
        expect(result).toBe(3);
      });
    });

    describe('Real-world usage scenarios', () => {
      it('should convert effect type name to enhance enum value', () => {
        // This simulates the actual usage in Toon.ts
        const effectTypeName = eEffectType[eEffectType.Accuracy];
        const result = StringToFlaggedEnum(effectTypeName, eEnhance);
        expect(result).toBe(eEnhance.Accuracy);
      });

      it('should return 0 for effect types that do not map to enhance', () => {
        const effectTypeName = eEffectType[eEffectType.GrantPower];
        const result = StringToFlaggedEnum(effectTypeName, eEnhance);
        expect(result).toBe(0); // GrantPower is not in eEnhance
      });

      it('should handle Damage effect type', () => {
        const effectTypeName = eEffectType[eEffectType.Damage];
        const result = StringToFlaggedEnum(effectTypeName, eEnhance);
        expect(result).toBe(eEnhance.Damage);
      });

      it('should handle RechargeTime effect type', () => {
        const effectTypeName = eEffectType[eEffectType.RechargeTime];
        const result = StringToFlaggedEnum(effectTypeName, eEnhance);
        expect(result).toBe(eEnhance.RechargeTime);
      });
    });
  });
});
