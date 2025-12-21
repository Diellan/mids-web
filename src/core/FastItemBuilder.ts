// Converted from C# FastItemBuilder.cs
import type { IPower } from './IPower';
import type { IEffect } from './IEffect';
import { eEffectType, eToWho, eMez, eMezShort, eEffectTypeShort, eSpecialCase, eStacking, ePvX, ShortFX, ShortFXImpl } from './Enums';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { Utilities } from './Base/Master_Classes/Utilities';
import { PairedListItem } from './GroupedFx';
import { GetMezName } from './Enums';

export class FastItemBuilder {
  static Str = {
    ShortStr(fontSize: number, full: string, brief: string): string {
      // fontSize == info_DataList.Font.Size
      return fontSize <= 100 / full.length ? full : brief;
    },

    CapString(str: string, capLength: number): string {
      return str.length >= capLength ? str.substring(0, capLength) : str;
    }
  };

  static GetRankedEffect(
    index: number[],
    id: number,
    pBase: IPower,
    pEnh: IPower | null
  ): PairedListItem {
    let title = '';
    const shortFxBase = new ShortFXImpl();
    const shortFxEnh = new ShortFXImpl();
    const tag2 = new ShortFXImpl();
    let suffix = '';
    const enhancedPower = pEnh ?? pBase;
    const fx =
      pEnh != null && index[id] < pEnh.Effects.length
        ? pEnh.Effects[index[id]]
        : index[id] < pBase.Effects.length
          ? pBase.Effects[index[id]]
          : null;

    const fx2 =
      id <= 0
        ? null
        : pEnh != null && index[id - 1] < pEnh.Effects.length
          ? pEnh.Effects[index[id - 1]]
          : index[id - 1] < pBase.Effects.length
            ? pBase.Effects[index[id - 1]]
            : null;

    if (fx == null) {
      return FastItemBuilder.Fi.FastItem('', 0, 0, '', '');
    }

    if (index[id] > -1) {
      let flag = false;
      const onlySelf = fx.ToWho === eToWho.Self;
      const onlyTarget = fx.ToWho === eToWho.Target;
      if (id > 0 && fx2) {
        flag =
          fx.EffectType === fx2.EffectType &&
          fx.ToWho === eToWho.Self &&
          fx2.ToWho === eToWho.Self;
      }

      if ((fx.DelayedTime ?? 0) > 5) {
        flag = true;
      }

      const names = Object.keys(eEffectTypeShort).filter(
        k => typeof eEffectTypeShort[k as keyof typeof eEffectTypeShort] === 'number'
      ) as string[];
      if (fx.EffectType === eEffectType.Enhancement) {
        switch (fx.ETModifies) {
          case eEffectType.EnduranceDiscount:
            title = '+EndRdx';
            break;
          case eEffectType.RechargeTime:
            title = '+Rechg';
            break;
          case eEffectType.Mez:
            title =
              fx.MezType === eMez.None
                ? '+Effects'
                : `Enh(${GetMezName(fx.MezType)})`;
            break;
          case eEffectType.Defense:
            title = 'Enh(Def)';
            break;
          case eEffectType.Resistance:
            title = 'Enh(Res)';
            break;
          default:
            const enumName = Object.keys(eEffectType).find(
              k => eEffectType[k as keyof typeof eEffectType] === fx.ETModifies
            );
            title = FastItemBuilder.Str.CapString(enumName ?? String(fx.ETModifies), 7);
            break;
        }

        shortFxBase.Assign(
          pBase.GetEffectMagSum(fx.EffectType, fx.ETModifies, fx.DamageType, fx.MezType, false, onlySelf, onlyTarget)
        );

        shortFxEnh.Assign(
          enhancedPower.GetEffectMagSum(
            enhancedPower.Effects[index[id]].EffectType,
            enhancedPower.Effects[index[id]].ETModifies,
            enhancedPower.Effects[index[id]].DamageType,
            enhancedPower.Effects[index[id]].MezType,
            false,
            onlySelf,
            onlyTarget
          )
        );
      } else {
        title =
          fx.EffectType !== eEffectType.Mez
            ? names[fx.EffectType] ?? String(fx.EffectType)
            : GetMezName(fx.MezType);
      }

      let temp = '';
      switch (fx.EffectType) {
        case eEffectType.HitPoints:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.HitPoints, false, onlySelf, onlyTarget));
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.HitPoints, false, onlySelf, onlyTarget));
          tag2.Assign(shortFxBase);
          shortFxBase.Sum = (shortFxBase.Sum / (MidsContext.Archetype?.Hitpoints ?? 1)) * 100;
          shortFxEnh.Sum = (shortFxEnh.Sum / (MidsContext.Archetype?.Hitpoints ?? 1)) * 100;
          suffix = '%';
          break;

        case eEffectType.Heal:
          if (fx.BuffedMag <= 1) {
            temp = `${(fx.BuffedMag * 100).toFixed(2)}%`;
            shortFxBase.Add(index[id], parseFloat(temp.replace('%', '')));
            shortFxEnh.Add(index[id], parseFloat(temp.replace('%', '')));
            tag2.Assign(shortFxBase);
          } else {
            shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Heal, false, onlySelf, onlyTarget));
            shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Heal, false, onlySelf, onlyTarget));
            shortFxBase.Sum = (shortFxBase.Sum / (MidsContext.Archetype?.Hitpoints ?? 1)) * 100;
            shortFxEnh.Sum = (shortFxEnh.Sum / (MidsContext.Archetype?.Hitpoints ?? 1)) * 100;
            tag2.Assign(shortFxBase);
          }
          suffix = '%';
          break;

        case eEffectType.Absorb:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Absorb, false, onlySelf, onlyTarget));
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Absorb, false, onlySelf, onlyTarget));
          const absorbPercent = pBase.Effects.some(
            e => e.EffectType === eEffectType.Absorb && e.DisplayPercentage
          );
          tag2.Assign(shortFxBase);
          suffix = absorbPercent ? '%' : '';
          break;

        case eEffectType.Endurance:
          if (fx.BuffedMag < -0.01 && fx.BuffedMag > -1) {
            temp = `${(fx.BuffedMag * 100).toFixed(2)}%`;
            shortFxBase.Add(index[id], parseFloat(temp.replace('%', '')));
            shortFxEnh.Add(index[id], parseFloat(temp.replace('%', '')));
            tag2.Assign(shortFxBase);
          } else {
            shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Endurance, false, onlySelf, onlyTarget));
            shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Endurance, false, onlySelf, onlyTarget));
            tag2.Assign(shortFxBase);
          }
          suffix = '%';
          break;

        case eEffectType.Regeneration:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Regeneration, false, onlySelf, onlyTarget));
          shortFxBase.Sum *= 100;
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Regeneration, false, onlySelf, onlyTarget));
          shortFxEnh.Sum *= 100;
          tag2.Assign(shortFxBase);
          suffix = '%';
          break;

        case eEffectType.Null:
          if (fx.BuffedMag < 1) {
            temp = `${(fx.BuffedMag * 100).toFixed(2)}%`;
            shortFxBase.Add(index[id], parseFloat(temp.replace('%', '')));
            shortFxEnh.Add(index[id], parseFloat(temp.replace('%', '')));
            tag2.Assign(shortFxBase);
          } else {
            shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Null, false, onlySelf, onlyTarget));
            shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Null, false, onlySelf, onlyTarget));
            tag2.Assign(shortFxBase);
          }
          suffix = '%';
          break;

        case eEffectType.ToHit:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.ToHit, false, onlySelf, onlyTarget));
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.ToHit, false, onlySelf, onlyTarget));
          shortFxBase.Sum *= 100;
          shortFxEnh.Sum *= 100;
          tag2.Assign(shortFxBase);
          suffix = '%';
          break;

        case eEffectType.Fly:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Fly, false, onlySelf, onlyTarget));
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Fly, false, onlySelf, onlyTarget));
          shortFxBase.Sum *= 100;
          shortFxEnh.Sum *= 100;
          tag2.Assign(shortFxBase);
          suffix = '%';
          break;

        case eEffectType.Recovery:
          shortFxBase.Assign(pBase.GetEffectMagSum(eEffectType.Recovery, false, onlySelf, onlyTarget));
          shortFxEnh.Assign(enhancedPower.GetEffectMagSum(eEffectType.Recovery, false, onlySelf, onlyTarget));
          shortFxBase.Sum *= 100;
          shortFxEnh.Sum *= 100;
          tag2.Assign(shortFxBase);
          suffix = '%';
          break;

        case eEffectType.Mez:
          if (fx.MezType === eMez.Taunt || fx.MezType === eMez.Placate) {
            shortFxBase.Add(index[id], fx.Duration);
            shortFxEnh.Add(index[id], enhancedPower.Effects[index[id]].Duration);
            tag2.Assign(shortFxBase);
            suffix = 's';
          }
          break;

        // Set list of effects below that are treated as percentages
        // Base and enhanced values will be multiplied by 100
        case eEffectType.DamageBuff:
        case eEffectType.Defense:
        case eEffectType.Resistance:
        case eEffectType.ResEffect:
        case eEffectType.Enhancement:
        case eEffectType.MezResist:
        case eEffectType.RechargeTime:
        case eEffectType.SpeedFlying:
        case eEffectType.SpeedRunning:
        case eEffectType.SpeedJumping:
        case eEffectType.JumpHeight:
        case eEffectType.PerceptionRadius:
        case eEffectType.Meter:
        case eEffectType.Range:
        case eEffectType.MaxFlySpeed:
        case eEffectType.MaxRunSpeed:
        case eEffectType.MaxJumpSpeed:
        case eEffectType.Jumppack:
        case eEffectType.GlobalChanceMod:
          if (fx.EffectType !== eEffectType.Enhancement) {
            shortFxBase.Add(index[id], fx.BuffedMag);
            shortFxEnh.Add(index[id], enhancedPower.Effects[index[id]].BuffedMag);
          }

          shortFxBase.Multiply();
          shortFxEnh.Multiply();

          tag2.Assign(enhancedPower.GetEffectMagSum(fx.EffectType, false, onlySelf, onlyTarget));
          break;

        case eEffectType.SilentKill:
          shortFxBase.Add(index[id], fx.Absorbed_Duration ?? 0);
          shortFxEnh.Add(index[id], enhancedPower.Effects[index[id]].Absorbed_Duration ?? 0);
          tag2.Assign(shortFxBase);
          break;

        default:
          shortFxBase.Add(index[id], fx.BuffedMag);
          shortFxEnh.Add(index[id], enhancedPower.Effects[index[id]].BuffedMag);
          tag2.Assign(shortFxBase);
          break;
      }

      if (fx.DisplayPercentage) {
        suffix = '%';
      }

      suffix +=
        fx.ToWho === eToWho.Target
          ? ' (Tgt)'
          : fx.ToWho === eToWho.Self
            ? ' (Self)'
            : '';

      if (flag) {
        return FastItemBuilder.Fi.FastItem('', 0, 0, '', '');
      }
    }

    for (let i = 0; i < (shortFxEnh.Index?.length ?? 0); i++) {
      const sFxIdx = shortFxEnh.Index![i];
      if (sFxIdx >= pBase.Effects.length && sFxIdx >= (pEnh?.Effects.length ?? 0)) {
        continue;
      }

      const effect =
        sFxIdx < pBase.Effects.length
          ? pBase.Effects[sFxIdx]
          : pEnh?.Effects[sFxIdx] ?? null;

      if (sFxIdx <= -1 || !effect?.DisplayPercentage) {
        continue;
      }

      if (shortFxEnh.Value[i] > 1) {
        continue;
      }

      switch (effect.EffectType) {
        case eEffectType.Absorb:
          // Fixes the Absorb display to correctly show the percentage
          shortFxEnh.Sum = parseFloat(
            (shortFxEnh.Sum / 100).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 }).replace('%', '')
          );
          break;

        case eEffectType.ToHit:
          // Fixes the ToHit display to correctly show the percentage
          if (effect.Stacking === eStacking.Yes) {
            const overage = (fx.Ticks ?? 0) * 0.05;
            shortFxEnh.Sum -= overage;
            shortFxEnh.Sum /= 2;
          }
          break;

        default:
          shortFxEnh.ReSum();
          break;
      }

      break;
    }

    // shortFxEnh.index.Length == 0 will occur if all effects of the same kind
    // have non validated conditionals.
    // E.g. -Recovery on Kick if Cross Punch has not been picked.
    const tip =
      (shortFxEnh.Index?.length ?? 0) <= 0
        ? ''
        : pEnh?.BuildTooltipStringAllVectorsEffects(
            pEnh.Effects[shortFxEnh.Index![0]].EffectType,
            pEnh.Effects[shortFxEnh.Index![0]].ETModifies,
            pEnh.Effects[shortFxEnh.Index![0]].DamageType,
            pEnh.Effects[shortFxEnh.Index![0]].MezType
          ) ?? '';

    if (fx.ActiveConditionals && fx.ActiveConditionals.length > 0) {
      return FastItemBuilder.Fi.FastItem(
        title,
        shortFxBase,
        shortFxEnh,
        suffix,
        true,
        false,
        (fx.Probability ?? 1) < 1,
        fx.ActiveConditionals.length > 0,
        tip
      );
    }

    const hasSpecialCase = fx.SpecialCase != null && fx.SpecialCase !== (eSpecialCase.None as any);
    if (hasSpecialCase) {
      return FastItemBuilder.Fi.FastItem(
        title,
        shortFxBase,
        shortFxEnh,
        suffix,
        true,
        false,
        (fx.Probability ?? 1) < 1,
        hasSpecialCase,
        tip
      );
    }

    return FastItemBuilder.Fi.FastItem(
      title,
      shortFxBase,
      shortFxEnh,
      suffix,
      true,
      false,
      (fx.Probability ?? 1) < 1,
      false,
      tip
    );
  }

  // FastItem/ItemPair constructors
  static Fi = {
    FastItem(
      title: string,
      s1: number | ShortFX,
      s2: number | ShortFX,
      suffix: string,
      tipOrSkipBase?: string | boolean,
      alwaysShow?: boolean,
      isChance?: boolean,
      isSpecial?: boolean,
      tipOrTag?: string | number | ShortFX | IPower,
      maxDecimal?: number
    ): PairedListItem {
      // Handle overload: FastItem(title, float, float, suffix, string tip)
      if (typeof s1 === 'number' && typeof s2 === 'number' && typeof tipOrSkipBase === 'string') {
        return FastItemBuilder.Fi.FastItem(
          title,
          s1,
          s2,
          suffix,
          false,
          false,
          false,
          false,
          tipOrSkipBase.trim()
        );
      }

      // Handle overload: FastItem(title, ShortFX, ShortFX, suffix, bool, bool, bool, bool, string)
      if (typeof s1 !== 'number' && typeof s2 !== 'number' && typeof tipOrSkipBase === 'boolean') {
        const shortFx1 = s1 as ShortFX;
        const shortFx2 = s2 as ShortFX;
        const skipBase = tipOrSkipBase;
        const alwaysShowVal = alwaysShow ?? false;
        const isChanceVal = isChance ?? false;
        const isSpecialVal = isSpecial ?? false;
        const tip = (tipOrTag as string)?.trim() ?? '';

        let iValue = Utilities.FixDP(shortFx2.Sum) + suffix;
        let iItem: PairedListItem;
        if (Math.abs(shortFx1.Sum) < Number.EPSILON && !alwaysShowVal) {
          iItem = { Name: '', Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else if (Math.abs(shortFx1.Sum) < Number.EPSILON) {
          iItem = { Name: `${title}:`, Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else {
          let iAlternate = false;
          if (Math.abs(shortFx1.Sum - shortFx2.Sum) > Number.EPSILON) {
            if (!skipBase) {
              const iValue2 = `(${Utilities.FixDP(shortFx2.Sum)}${suffix})`;
              iItem = {
                Name: title,
                Value: iValue + iValue2.replace('%', ''),
                ToolTip: tip,
                UseUniqueColor: false,
                UseAlternateColor: true
              };
              return iItem;
            }
            iAlternate = true;
          }

          iItem = {
            Name: title,
            Value: iValue,
            ToolTip: tip,
            UseUniqueColor: false,
            UseAlternateColor: iAlternate
          };
        }

        return iItem;
      }

      // Handle overload: FastItem(title, ShortFX, ShortFX, suffix, bool, bool, bool, bool, ShortFX, IPower)
      if (
        typeof s1 !== 'number' &&
        typeof s2 !== 'number' &&
        typeof tipOrSkipBase === 'boolean' &&
        typeof tipOrTag !== 'string' &&
        typeof tipOrTag !== 'number' &&
        tipOrTag &&
        'Index' in tipOrTag
      ) {
        const shortFx1 = s1 as ShortFX;
        const shortFx2 = s2 as ShortFX;
        const skipBase = tipOrSkipBase;
        const alwaysShowVal = alwaysShow ?? false;
        const isChanceVal = isChance ?? false;
        const isSpecialVal = isSpecial ?? false;
        const tag = tipOrTag as ShortFX;
        const basePower = maxDecimal as unknown as IPower;

        let iValue = Utilities.FixDP(shortFx2.Sum) + suffix;
        let itemPair: PairedListItem;
        if (Math.abs(shortFx1.Sum) < Number.EPSILON && !alwaysShowVal) {
          itemPair = { Name: '', Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else if (Math.abs(shortFx1.Sum) < Number.EPSILON) {
          itemPair = { Name: `${title}:`, Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else {
          let iAlternate = false;
          if (Math.abs(shortFx1.Sum - shortFx2.Sum) > Number.EPSILON) {
            if (!skipBase) {
              iValue += ` (${Utilities.FixDP(shortFx1.Sum)})`;
            }
            iAlternate = true;
          }

          const tip = FastItemBuilder.Tooltip.GenerateTipFromEffect(basePower, tag).trim();
          itemPair = {
            Name: title,
            Value: iValue,
            ToolTip: tip,
            UseUniqueColor: false,
            UseAlternateColor: iAlternate
          };
        }

        return itemPair;
      }

      // Handle overload: FastItem(title, float, float, suffix, bool, bool, bool, bool, string)
      if (typeof s1 === 'number' && typeof s2 === 'number' && typeof tipOrSkipBase === 'boolean') {
        const num1 = s1;
        const num2 = s2;
        const skipBase = tipOrSkipBase;
        const alwaysShowVal = alwaysShow ?? false;
        const isChanceVal = isChance ?? false;
        const isSpecialVal = isSpecial ?? false;
        const tip = (tipOrTag as string)?.trim() ?? '';

        let iValue = Utilities.FixDP(num2) + suffix;
        let itemPair: PairedListItem;
        if (Math.abs(num1) < Number.EPSILON && !alwaysShowVal) {
          itemPair = { Name: '', Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else if (Math.abs(num1) < Number.EPSILON) {
          itemPair = { Name: title, Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else {
          let iAlternate = false;
          if (Math.abs(num1 - num2) > Number.EPSILON) {
            if (!skipBase) {
              const baseValue = `${iValue} (${Utilities.FixDP(num1)}${iValue.endsWith('%') ? '%' : ''})`;
              itemPair = {
                Name: title,
                Value: baseValue,
                ToolTip: tip,
                UseUniqueColor: false,
                UseAlternateColor: true
              };
              return itemPair;
            }
            iAlternate = true;
          }

          itemPair = {
            Name: title,
            Value: iValue,
            ToolTip: tip,
            UseUniqueColor: false,
            UseAlternateColor: iAlternate
          };
        }

        return itemPair;
      }

      // Handle overload: FastItem(title, float, float, suffix, bool, bool, bool, bool, int, int)
      if (typeof s1 === 'number' && typeof s2 === 'number' && typeof tipOrSkipBase === 'boolean' && typeof tipOrTag === 'number') {
        const num1 = s1;
        const num2 = s2;
        const skipBase = tipOrSkipBase;
        const alwaysShowVal = alwaysShow ?? false;
        const isChanceVal = isChance ?? false;
        const isSpecialVal = isSpecial ?? false;
        const tagId = tipOrTag;
        const maxDecimalVal = maxDecimal ?? -1;

        let iValue = maxDecimalVal < 0 ? Utilities.FixDP(num2) + suffix : Utilities.FixDP(num2, maxDecimalVal) + suffix;
        let itemPair: PairedListItem;
        if (Math.abs(num1) < Number.EPSILON && !alwaysShowVal) {
          itemPair = { Name: '', Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else {
          let iAlternate = false;
          if (Math.abs(num1 - num2) > Number.EPSILON) {
            if (!skipBase) {
              iValue += ` (${Utilities.FixDP(num1)}${iValue.endsWith('%') ? '%' : ''})`;
            }
            iAlternate = true;
          }

          itemPair = {
            Name: title,
            Value: iValue,
            ToolTip: String(tagId),
            UseUniqueColor: false,
            UseAlternateColor: iAlternate
          };
        }

        return itemPair;
      }

      // Handle overload: FastItem(title, float, float, suffix, string, bool, bool, bool, bool, int)
      if (typeof s1 === 'number' && typeof s2 === 'number' && typeof tipOrSkipBase === 'string') {
        const num1 = s1;
        const num2 = s2;
        const tip = tipOrSkipBase;
        const skipBase = alwaysShow ?? false;
        const alwaysShowVal = isChance ?? false;
        const isChanceVal = isSpecial ?? false;
        const isSpecialVal = typeof tipOrTag === 'boolean' ? tipOrTag : false;
        const maxDecimalVal = maxDecimal ?? -1;

        let iValue = maxDecimalVal < 0 ? Utilities.FixDP(num2) + suffix : Utilities.FixDP(num2, maxDecimalVal) + suffix;
        let itemPair: PairedListItem;
        if (Math.abs(num1) < Number.EPSILON && !alwaysShowVal) {
          itemPair = { Name: '', Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
        } else {
          let iAlternate = false;
          if (Math.abs(num1 - num2) > Number.EPSILON) {
            if (!skipBase) {
              iValue += ` (${Utilities.FixDP(num1)}${iValue.endsWith('%') ? '%' : ''})`;
            }
            iAlternate = true;
          }

          itemPair = {
            Name: title,
            Value: iValue,
            ToolTip: tip.trim(),
            UseUniqueColor: false,
            UseAlternateColor: iAlternate
          };
        }

        return itemPair;
      }

      // Default fallback
      return { Name: title, Value: '', ToolTip: '', UseUniqueColor: false, UseAlternateColor: false };
    }
  };

  static Tooltip = {
    GenerateTipFromEffect(basePower: IPower, tag: ShortFX): string {
      const effects = tag.Index?.map(e => basePower.Effects[e]).filter(e => e != null) ?? [];
      const effectTypes = effects.map(e => e.EffectType);
      const effectDmgTypes = effects.map(e => e.DamageType);
      const effectETModifies = effects.map(e => e.ETModifies);
      const effectMezTypes = effects.map(e => e.MezType);

      const selfEffects = basePower.Effects.map((e, i) => ({ key: i, value: e }))
        .filter(
          e =>
            effectTypes.includes(e.value.EffectType) &&
            effectDmgTypes.includes(e.value.DamageType) &&
            effectETModifies.includes(e.value.ETModifies) &&
            effectMezTypes.includes(e.value.MezType) &&
            e.value.ToWho === eToWho.Self &&
            e.value.PvMode !==
              (MidsContext.Config?.Inc.DisablePvE ? ePvX.PvE : ePvX.PvP) &&
            ((e.value.Suppression ?? 0) & (MidsContext.Config?.Suppression ?? 0)) === 0
        )
        .map(
          e =>
            (e.value.BuildEffectString(false, '', false, false, false, true) +
              (basePower.GetDifferentAttributesSubPower?.(e.key) ?? '')).replace('.,', ',')
        );

      const targetEffects = basePower.Effects.map((e, i) => ({ key: i, value: e }))
        .filter(
          e =>
            effectTypes.includes(e.value.EffectType) &&
            effectDmgTypes.includes(e.value.DamageType) &&
            effectETModifies.includes(e.value.ETModifies) &&
            effectMezTypes.includes(e.value.MezType) &&
            e.value.ToWho === eToWho.Target &&
            e.value.PvMode !==
              (MidsContext.Config?.Inc.DisablePvE ? ePvX.PvE : ePvX.PvP) &&
            ((e.value.Suppression ?? 0) & (MidsContext.Config?.Suppression ?? 0)) === 0
        )
        .map(
          e =>
            (e.value.BuildEffectString(false, '', false, false, false, true) +
              (basePower.GetDifferentAttributesSubPower?.(e.key) ?? '')).replace('.,', ',')
        );

      return (selfEffects.join('\n') + '\n\n' + targetEffects.join('\n')).trim();
    }
  };
}
