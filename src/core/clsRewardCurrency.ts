// Converted from C# clsRewardCurrency.cs
import { RewardCurrency } from './Enums';
import { PopUp } from './Base/Display/PopUp';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import type { Salvage } from './Salvage';
import { Recipe } from './Recipe';

export class clsRewardCurrency {
  // Allowed -direct- conversions
  private static readonly AllowedConversions = new Map<
    [RewardCurrency, RewardCurrency],
    [number, number]
  >([
    [[RewardCurrency.VanguardMerit, RewardCurrency.RewardMerit], [30, 1]],
    [[RewardCurrency.AstralMerit, RewardCurrency.RewardMerit], [1, 2]],
    [[RewardCurrency.EmpyreanMerit, RewardCurrency.RewardMerit], [1, 10]],
    [[RewardCurrency.EmpyreanMerit, RewardCurrency.AstralMerit], [1, 5]],
    [[RewardCurrency.AlignmentMerit, RewardCurrency.RewardMerit], [1, 50]],
    [[RewardCurrency.Influence, RewardCurrency.RewardMerit], [1000000, 1]]
  ]);

  private static CurrencyChangeInner(
    c1: RewardCurrency,
    c2: RewardCurrency,
    amount: number,
    path: RewardCurrency[]
  ): number | null {
    if (c1 === c2) return amount;

    let linkFound = false;
    let l = Infinity;
    let p: RewardCurrency[] = [];
    let amt = 0;

    for (const kv of Object.values(RewardCurrency)) {
      if (typeof kv !== 'number') continue;
      if (path.includes(kv)) continue;

      const cLink: [RewardCurrency, RewardCurrency] = [c1, kv];
      const cLinkRev: [RewardCurrency, RewardCurrency] = [kv, c1];

      if (this.AllowedConversions.has(cLink)) {
        const l2 = [...path, kv];
        const cnvRate = this.AllowedConversions.get(cLink)!;
        const t = this.CurrencyChangeInner(
          kv,
          c2,
          Math.floor((amount / cnvRate[0]) * cnvRate[1]),
          l2
        );
        if (t !== null && l2.length < l) {
          l = l2.length;
          p = l2;
          amt = t;
          linkFound = true;
        }
      }

      if (this.AllowedConversions.has(cLinkRev)) {
        const l2 = [...path, kv];
        const cnvRate = this.AllowedConversions.get(cLinkRev)!;
        const t = this.CurrencyChangeInner(
          kv,
          c2,
          Math.floor((amount / cnvRate[1]) * cnvRate[0]),
          l2
        );
        if (t !== null && l2.length < l) {
          l = l2.length;
          p = l2;
          amt = t;
          linkFound = true;
        }
      }
    }

    return linkFound ? amt : null;
  }

  static CurrencyChange(
    c1: RewardCurrency,
    c2: RewardCurrency,
    amount: number
  ): number | null {
    const cPath: RewardCurrency[] = [c1];
    const ret = this.CurrencyChangeInner(c1, c2, amount, cPath);
    return ret === null ? null : Math.max(1, ret);
  }

  static GetCurrencyName(c: RewardCurrency, amount: number = 1): string {
    const plural = amount > 1 ? 's' : '';
    switch (c) {
      case RewardCurrency.RewardMerit:
        return `Reward Merit${plural}`;
      case RewardCurrency.AstralMerit:
        return `Astral Merit${plural}`;
      case RewardCurrency.EmpyreanMerit:
        return `Empyrean Merit${plural}`;
      case RewardCurrency.AlignmentMerit:
        return MidsContext.Character?.Alignment === 'Villain' ||
          MidsContext.Character?.Alignment === 'Rogue' ||
          MidsContext.Character?.Alignment === 'Loyalist'
          ? `Villain Merit${plural}`
          : `Hero Merit${plural}`;
      case RewardCurrency.VanguardMerit:
        return `Vanguard Merit${plural}`;
      case RewardCurrency.AETicket:
        return `AE Ticket${plural}`;
      case RewardCurrency.Influence:
        return 'Influence';
      default:
        return '';
    }
  }

  static GetCurrencyRarityColor(c: RewardCurrency): string {
    switch (c) {
      case RewardCurrency.RewardMerit:
        return PopUp.Colors.Rare;
      case RewardCurrency.AstralMerit:
        return PopUp.Colors.UltraRare;
      case RewardCurrency.EmpyreanMerit:
        return PopUp.Colors.UltraRare;
      case RewardCurrency.AlignmentMerit:
        return PopUp.Colors.UltraRare;
      case RewardCurrency.VanguardMerit:
        return PopUp.Colors.Rare;
      default:
        return PopUp.Colors.Common;
    }
  }

  static GetSalvageCost(
    s: Salvage,
    c: RewardCurrency = RewardCurrency.RewardMerit,
    amount: number = 1
  ): number | null {
    if (amount === 0) return 0;

    // Note: Full implementation would handle all salvage types
    return null;
  }
}

