// Converted from C# EnhancementSetCollection.cs
import { EnhancementSet } from './EnhancementSet';
import { DatabaseAPI } from './DatabaseAPI';
import { RTF, ElementID } from './RTF';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { ePvX } from './Enums';

export class EnhancementSetCollection extends Array<EnhancementSet> {
  GetSetBonusEnhCount(sidx: number, bonus: number): number {
    if (sidx >= 0 && sidx < this.length) {
      const effectString = this[sidx].GetEffectString(bonus, false, true);
      if (effectString) {
        return this[sidx].Bonus[bonus].Slotted;
      }
      const specialEffectString = this[sidx].GetEffectString(bonus, true, true);
      return specialEffectString ? 1 : 0;
    }
    return 0;
  }

  static GetSetInfoLongRTF(iSet: number, enhCount: number = -1): string {
    if (iSet < 0 || iSet > DatabaseAPI.Database.EnhancementSets.length - 1) {
      return '';
    }

    const set = DatabaseAPI.Database.EnhancementSets[iSet];
    const levelStr = set.LevelMin === set.LevelMax
      ? `${set.LevelMin + 1}`
      : `${set.LevelMin + 1}-${set.LevelMax + 1}`;
    
    let str3 = RTF.Bold(RTF.Underline(`${set.DisplayName} (${levelStr}): `));
    str3 = `${RTF.Color(ElementID.Invention)}${str3}${RTF.Color(ElementID.Text)}`;

    for (let index = 0; index < set.Bonus.length; index++) {
      const effectString = set.GetEffectString(index, false);
      if (!effectString) {
        continue;
      }
      
      let displayEffectString = effectString;
      if (set.Bonus[index].PvMode === ePvX.PvP) {
        displayEffectString += ' (PvP)';
      }

      const fxColor = (enhCount >= set.Bonus[index].Slotted) &&
        ((!MidsContext.Config?.Inc?.DisablePvE &&
          (set.Bonus[index].PvMode === ePvX.PvE)) ||
         (MidsContext.Config?.Inc?.DisablePvE &&
          (set.Bonus[index].PvMode === ePvX.PvP)) ||
         (set.Bonus[index].PvMode === ePvX.Any))
        ? ElementID.Invention
        : ElementID.Faded;

      str3 += `${RTF.Crlf()}${RTF.Bold(RTF.Color(ElementID.Text))}  ${set.Bonus[index].Slotted} Slotted: ${RTF.Color(fxColor)}${displayEffectString}${RTF.Color(ElementID.Text)}`;
    }

    for (let index = 0; index < set.SpecialBonus.length; index++) {
      const effectString = set.GetEffectString(index, true);
      if (!effectString) {
        continue;
      }
      
      const enhIdx = set.Enhancements[index];
      if (enhIdx >= 0 && enhIdx < DatabaseAPI.Database.Enhancements.length) {
        const enhName = DatabaseAPI.Database.Enhancements[enhIdx].Name;
        str3 += `${RTF.Crlf()}${RTF.Color(ElementID.Enhancement)}${RTF.Bold(`  ${enhName}: `)}${RTF.Color(ElementID.Faded)}${effectString}${RTF.Color(ElementID.Text)}`;
      }
    }

    return str3;
  }
}

