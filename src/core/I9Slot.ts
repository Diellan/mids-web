// Converted from C# I9Slot.cs
import { eEnhGrade, eEnhRelative, eEnhance, eEffMode, eBuffDebuff, eSchedule, eType, GetRelativeString, eEffectType, eStacking } from './Enums';
import { DatabaseAPI } from './DatabaseAPI';
import { GroupedFx } from './GroupedFx';
import { Power } from './Base/Data_Classes/Power';
import type { IPower } from './IPower';
import type { IEnhancement } from './IEnhancement';

export class I9Slot {
  Enh: number = -1;
  Grade: eEnhGrade = eEnhGrade.None;
  IOLevel: number = 1;
  RelativeLevel: eEnhRelative = eEnhRelative.Even;
  Obtained: boolean = false;

  constructor() {
    this.Enh = -1;
    this.RelativeLevel = eEnhRelative.Even;
    this.Grade = eEnhGrade.None;
    this.IOLevel = 1;
    this.Obtained = false;
  }

  Clone(): I9Slot {
    const cloned = new I9Slot();
    cloned.Enh = this.Enh;
    cloned.Grade = this.Grade;
    cloned.IOLevel = this.IOLevel;
    cloned.RelativeLevel = this.RelativeLevel;
    cloned.Obtained = this.Obtained;
    return cloned;
  }

  GetEnhancementEffect(iEffect: eEnhance, subEnh: number, mag: number): number {
    if (this.Enh < 0) {
      return 0.0;
    }

    let num2 = 0.0;
    const enhancement = DatabaseAPI.Database.Enhancements[this.Enh];
    if (!enhancement) {
      return 0.0;
    }

    for (const sEffect of enhancement.Effect) {
      if (sEffect.Mode !== eEffMode.Enhancement ||
          (sEffect.BuffMode === eBuffDebuff.DeBuffOnly && !(mag <= 0.0)) ||
          (sEffect.BuffMode === eBuffDebuff.BuffOnly && !(mag >= 0.0)) ||
          sEffect.Schedule === eSchedule.None ||
          sEffect.Enhance.ID !== iEffect ||
          (subEnh >= 0 && subEnh !== sEffect.Enhance.SubID)) {
        continue;
      }

      const scheduleMult = this.GetScheduleMult(enhancement.TypeID, sEffect.Schedule);
      if (Math.abs(sEffect.Multiplier) > 0.01) {
        num2 += scheduleMult * sEffect.Multiplier;
      } else {
        num2 += scheduleMult;
      }
    }

    return num2;
  }

  private GetScheduleMult(iType: eType, iSched: eSchedule): number {
    if (this.Grade < eEnhGrade.None) {
      this.Grade = eEnhGrade.None;
    }

    if (this.RelativeLevel < eEnhRelative.None) {
      this.RelativeLevel = eEnhRelative.None;
    }

    if (this.Grade > eEnhGrade.SingleO) {
      this.Grade = eEnhGrade.SingleO;
    }

    if (this.RelativeLevel > eEnhRelative.PlusFive) {
      this.RelativeLevel = eEnhRelative.PlusFive;
    }

    let num1 = 0.0;
    if (this.IOLevel <= 0) {
      this.IOLevel = 0;
    }

    if (this.IOLevel > DatabaseAPI.Database.MultIO.length - 1) {
      this.IOLevel = DatabaseAPI.Database.MultIO.length - 1;
    }

    if (iSched === eSchedule.None || iSched === eSchedule.Multiple) {
      num1 = 0.0;
    } else {
      switch (iType) {
        case eType.Normal:
          num1 = this.Grade === eEnhGrade.None ? 0.0 :
                this.Grade === eEnhGrade.TrainingO ? DatabaseAPI.Database.MultTO[0][iSched] :
                this.Grade === eEnhGrade.DualO ? DatabaseAPI.Database.MultDO[0][iSched] :
                this.Grade === eEnhGrade.SingleO ? DatabaseAPI.Database.MultSO[0][iSched] :
                num1;
          break;
        case eType.InventO:
          num1 = DatabaseAPI.Database.MultIO[this.IOLevel][iSched];
          break;
        case eType.SpecialO:
          num1 = DatabaseAPI.Database.MultSO[0][iSched];
          break;
        case eType.SetO:
          num1 = DatabaseAPI.Database.MultIO[this.IOLevel][iSched];
          break;
      }
    }

    let num2 = num1 * this.GetRelativeLevelMultiplier();
    if (this.Enh > -1 && DatabaseAPI.Database.Enhancements[this.Enh]?.Superior) {
      num2 *= 1.25;
    }

    return num2;
  }

  private GetRelativeLevelMultiplier(): number {
    let num1: number;
    if (this.RelativeLevel === eEnhRelative.None) {
      num1 = 0.0;
    } else {
      const num2 = (this.RelativeLevel as number) - 4; // eEnhRelative.Even is 4
      num1 = num2 >= 0 ? (num2 * 0.05 + 1.0) : (1.0 + num2 * 0.1);
    }

    return num1;
  }

  GetEnhancementString(): string {
    let str1: string;
    if (this.Enh < 0) {
      str1 = '';
    } else {
      const enhancement = DatabaseAPI.Database.Enhancements[this.Enh];
      if (!enhancement) {
        return '';
      }

      if (enhancement.Effect.length === 0) {
        str1 = enhancement.Desc;
      } else {
        const stringBuilder: string[] = [];
        let flag = false;
        const effect = enhancement.Effect;
        let index1 = 0;
        if (index1 >= effect.length) {
          str1 = stringBuilder.join('');
        } else {
          const sEffect = effect[index1];
          if (sEffect.Mode === eEffMode.FX) {
            flag = true;
          }
          let str2: string;
          if (sEffect.Mode === eEffMode.Enhancement && sEffect.Schedule !== eSchedule.None) {
            let scheduleMult = this.GetScheduleMult(enhancement.TypeID, sEffect.Schedule);
            if (sEffect.Multiplier > 0.0) {
              scheduleMult *= sEffect.Multiplier;
            }

            if (stringBuilder.length > 0) {
              stringBuilder.push(', ');
            }

            switch (enhancement.TypeID) {
              case eType.Normal:
                const relativeString1 = GetRelativeString(this.RelativeLevel, false);
                if (relativeString1 && relativeString1 !== '' && relativeString1 !== 'X') {
                  stringBuilder.push(relativeString1 + ' ' + DatabaseAPI.Database.EnhGradeStringLong[this.Grade] + ' - ');
                  break;
                }

                if (relativeString1 === 'X') {
                  stringBuilder.push('Disabled ' + DatabaseAPI.Database.EnhGradeStringLong[this.Grade] + ' - ');
                  break;
                }

                stringBuilder.push(DatabaseAPI.Database.EnhGradeStringLong[this.Grade] + ' - ');
                break;
              case eType.SpecialO:
                const relativeString2 = GetRelativeString(this.RelativeLevel, false);
                if (relativeString2 && relativeString2 !== '' && relativeString2 !== 'X') {
                  stringBuilder.push(relativeString2 + ' ' + enhancement.GetSpecialName() + ' - ');
                  break;
                }

                if (relativeString2 === 'X') {
                  stringBuilder.push('Disabled ' + enhancement.GetSpecialName() + ' - ');
                  break;
                }

                stringBuilder.push(enhancement.GetSpecialName() + ' - ');
                break;
            }

            stringBuilder.push('Schedule: ');
            stringBuilder.push(`${sEffect.Schedule}`);
            stringBuilder.push(` (${(scheduleMult * 100).toFixed(3)}%)`);
            str2 = stringBuilder.join('');
          } else if (!flag) {
            str2 = stringBuilder.join('');
          } else {
            const power = enhancement.GetPower();
            if (power) {
              for (let index2 = 0; index2 <= power.Effects.length - 1; ++index2) {
                if (stringBuilder.length > 0) {
                  stringBuilder.push(', ');
                }

                stringBuilder.push(power.Effects[index2].BuildEffectString(true));
              }

              str2 = 'Effect: ' + stringBuilder.join('');
            } else {
              str2 = stringBuilder.join('');
            }
          }

          str1 = str2;
        }
      }
    }

    return str1;
  }

  private GetEffectsStringLong(enhancement: IEnhancement, enhBoostPower: IPower | null): string {
    let str1: string;
    const stringBuilder: string[] = [];
    let flag1 = false;
    let flag2 = false;
    let flag3 = false;
    let flag4 = false;
    let flag5 = false;

    if (enhBoostPower && enhBoostPower.Effects.every(e => e.EffectType !== eEffectType.GrantPower)) {
      return this.GetGroupedEffectsStringLong(enhBoostPower);
    }

    for (const sEffect of enhancement.Effect) {
      switch (sEffect.Mode) {
        case eEffMode.FX:
          flag1 = true;
          break;
        case eEffMode.Enhancement:
          if (sEffect.Schedule !== eSchedule.None) {
            let scheduleMult = this.GetScheduleMult(enhancement.TypeID, sEffect.Schedule);
            if (Math.abs(sEffect.Multiplier) > Number.EPSILON) {
              scheduleMult = Math.round(scheduleMult * sEffect.Multiplier * 1000) / 1000;
            }

            const id = sEffect.Enhance.ID as eEnhance;
            let str2: string;
            if (id === eEnhance.Mez) {
              str2 = `eMez_${sEffect.Enhance.SubID}`; // Would need proper enum name conversion
            } else {
              str2 = `eEnhance_${id}`; // Would need proper enum name conversion
            }

            switch (sEffect.Enhance.ID) {
              case 7:
              case 8:
              case 17:
                str2 = !flag2 ? 'Heal' : '';
                flag2 = true;
                break;
              case 10:
              case 11:
                if (!flag5) {
                  str2 = !flag3 ? 'Jump' : '';
                  flag3 = true;
                }
                break;
              case 5:
              case 16:
                str2 = !flag4 ? 'EndMod' : '';
                flag4 = true;
                break;
              default:
                {
                  const hasSlow = enhancement.Name.indexOf('Slow') > -1;
                  const isDebuffOnly = sEffect.BuffMode === eBuffDebuff.DeBuffOnly;
                  if ((hasSlow && isDebuffOnly && (sEffect.Enhance.ID === 6 || sEffect.Enhance.ID === 11 || sEffect.Enhance.ID === 19)) || sEffect.Enhance.ID === 21) {
                    str2 = !flag5 ? 'Slow Movement' : '';
                    flag5 = true;
                  }
                  break;
                }
            }

            if (str2 && str2 !== '') {
              if (stringBuilder.length > 0) {
                stringBuilder.push('\n');
              }

              const multiplierStr = Math.abs(sEffect.Multiplier) > Number.EPSILON &&
                sEffect.Multiplier !== 1 &&
                sEffect.Multiplier !== 0.625 &&
                sEffect.Multiplier !== 0.5 &&
                sEffect.Multiplier !== 0.4375
                ? ` [x${sEffect.Multiplier}]`
                : '';

              stringBuilder.push(`${str2} enhancement (Sched. ${sEffect.Schedule}: ${(scheduleMult * 100).toFixed(3)}%${multiplierStr})`);
            }

            break;
          }
          break;
        case eEffMode.PowerEnh:
        case eEffMode.PowerProc:
          break;
      }
    }

    if (!flag1) {
      str1 = stringBuilder.join('');
    } else {
      if (!enhBoostPower) {
        return '';
      }
      const power = new Power(enhBoostPower);
      power.ApplyGrantPowerEffects();
      const returnMask: number[] = [];

      for (let index1 = 0; index1 < power.Effects.length; index1++) {
        if (power.Effects[index1].EffectType === eEffectType.GrantPower && power.Effects[index1].CanGrantPower()) {
          if (stringBuilder.length > 0) {
            stringBuilder.push('\n');
          }

          stringBuilder.push(power.Effects[index1].BuildEffectString(true, '', false, false, false, true, false, false, true));

          let empty = '';

          const groupedEffectsArray = power.Effects.filter(x =>
            x.EffectType === eEffectType.DamageBuff ||
            x.EffectType === eEffectType.Defense ||
            x.EffectType === eEffectType.Resistance ||
            x.EffectType === eEffectType.Elusivity ||
            x.EffectType === eEffectType.Mez
          );

          for (let effectId = 0; effectId < groupedEffectsArray.length; effectId++) {
            if (power.Effects[index1] === groupedEffectsArray[effectId]) {
              groupedEffectsArray[effectId].Stacking = eStacking.Yes;
              groupedEffectsArray[effectId].Buffable = true;
            }

            if (groupedEffectsArray[effectId].Absorbed_EffectID === index1) {
              power.GetEffectStringGrouped(effectId, { value: empty }, { value: returnMask }, false, false, false, true, true);
            }

            if (returnMask.length <= 0) {
              continue;
            }

            if (stringBuilder.length > 0) {
              stringBuilder.push('\n');
            }

            stringBuilder.push(`  ${empty}`);
            break;
          }

          let empty2 = '';
          const groupedMezEffectsArray = power.Effects.filter(x => x.EffectType === eEffectType.MezResist);
          if (groupedMezEffectsArray.length > 0) {
            for (let effectId = 0; effectId < power.Effects.length; effectId++) {
              const flag6 = returnMask.some(m => m === effectId);

              if (power.Effects[effectId].Absorbed_EffectID !== index1 || flag6) {
                continue;
              }
              if (stringBuilder.length > 0) {
                stringBuilder.push('\n');
              }

              power.GetEffectStringGrouped(effectId, { value: empty2 }, { value: returnMask }, false, false, false, true, true);
              stringBuilder.push(`  ${empty2}`);
              break;
            }
          } else {
            for (let index2 = 0; index2 < power.Effects.length; index2++) {
              const flag6 = returnMask.some(m => m === index2);

              if (power.Effects[index2].Absorbed_EffectID !== index1 || flag6) {
                continue;
              }

              if (stringBuilder.length > 0) {
                stringBuilder.push('\n');
              }

              power.Effects[index2].Stacking = eStacking.Yes;
              power.Effects[index2].Buffable = true;

              stringBuilder.push(`  ${power.Effects[index2].BuildEffectString(true, '', false, false, false, true, false, false, true)}`);
            }
          }
        } else if (!power.Effects[index1].Absorbed_Effect) {
          if (stringBuilder.length > 0) {
            stringBuilder.push('\n');
          }

          let effectString = power.Effects[index1].BuildEffectString(true, '', false, false, false, true).trim();
          if (effectString.includes('Null')) {
            const enhId = DatabaseAPI.GetEnhancementByBoostName(power.FullName);
            if (enhId >= 0) {
              const enhSetSpecials = DatabaseAPI.Database.EnhancementSets[DatabaseAPI.Database.Enhancements[enhId].nIDSet];
              const enhIndex = enhSetSpecials.Enhancements.findIndex(e => e === enhId);
              if (enhSetSpecials.SpecialBonus.length > 0) {
                effectString = enhSetSpecials.SpecialBonus[enhSetSpecials.SpecialBonus.length - 1].Index.length === 0
                  ? enhSetSpecials.GetEffectString(enhSetSpecials.SpecialBonus.length - 2, true, true, true, true)
                  : enhSetSpecials.GetEffectString(enhSetSpecials.SpecialBonus.length - 1, true, true, true, true);

                if (!effectString || effectString.trim() === '') {
                  effectString = enhSetSpecials.GetEffectString(enhIndex, true, true, true, true);
                }
                effectString = effectString.replace(', ', '\n');
              }
            }
          }

          if (!stringBuilder.join('').includes(effectString)) {
            stringBuilder.push(effectString);
          }
        }
      }

      str1 = stringBuilder.join('').replace(/Slf/g, 'Self').replace(/Tgt/g, 'Target');
    }

    return str1;
  }

  private GetGroupedEffectsStringLong(enhBoostPower: IPower | null): string {
    if (!enhBoostPower) {
      return '';
    }

    if (!enhBoostPower.AppliedExecutes) {
      enhBoostPower.ProcessExecutes();
    }

    const groupedEffects = GroupedFx.AssembleGroupedEffects(enhBoostPower, true);

    return groupedEffects.map(e => e.GetTooltip(enhBoostPower, true)).join('\r\n');
  }

  GetEnhancementStringLong(): string {
    if (this.Enh < 0) {
      return '';
    }

    const enhancement = DatabaseAPI.Database.Enhancements[this.Enh];
    if (!enhancement) {
      return '';
    }

    const enhPowerEffects = this.GetEffectsStringLong(enhancement, enhancement.GetPower());
    if (enhancement.nIDSet < 0 || enhPowerEffects.trim() !== '') {
      return enhPowerEffects;
    }

    const enhSet = DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet];
    if (!enhSet) {
      return '';
    }

    const enhPosInSet = enhSet.Enhancements.indexOf(this.Enh);
    if (enhPosInSet < 0 || enhPosInSet >= enhSet.SpecialBonus.length) {
      return '';
    }

    const setBonusesForEnh = enhSet.SpecialBonus[enhPosInSet];
    if (!setBonusesForEnh) {
      return '';
    }

    const result: string[] = [];
    for (const idx of setBonusesForEnh.Index) {
      const power = DatabaseAPI.Database.Power[idx];
      if (!power) continue;

      const effectList = power.Effects
        .map(effect => effect.BuildEffectString(true, '', false, false, false, true, false, false, true))
        .filter(tEffectString => tEffectString && tEffectString.trim() !== '');

      if (effectList.length > 1) {
        result.push(effectList.join('\n'));
      } else if (effectList.length === 1) {
        result.push(effectList[0]);
      }
    }

    return result.join('\n');
  }

  GetRelativeString(onlySign: boolean): string {
    if (this.RelativeLevel === eEnhRelative.None) {
      return '';
    }

    return GetRelativeString(this.RelativeLevel, onlySign);
  }

  GetEnhancementLevelString(): string {
    if (this.Enh < 0) {
      return '';
    }

    if (this.IOLevel) {
      return (this.IOLevel + 1).toString();
    }

    return this.GetRelativeString(false);
  }
}

