// Converted from C# I9SetData.cs
import { I9Slot } from './I9Slot';
import { eType, ePvX } from './Enums';
import { DatabaseAPI } from './DatabaseAPI';

export interface sSetInfo {
  SetIDX: number;
  SlottedCount: number;
  Powers: number[];
  EnhIndexes: number[];
}

export class I9SetData {
  PowerIndex: number = 0;
  SetInfo: sSetInfo[] = [];

  constructor(iSd?: I9SetData) {
    if (iSd) {
      this.PowerIndex = iSd.PowerIndex;
      this.SetInfo = iSd.SetInfo.map(si => ({
        SetIDX: si.SetIDX,
        SlottedCount: si.SlottedCount,
        Powers: [...si.Powers],
        EnhIndexes: [...si.EnhIndexes]
      }));
    }
  }

  get Empty(): boolean {
    return this.SetInfo.length < 1;
  }

  Add(iEnh: I9Slot): void {
    if (iEnh.Enh < 0 || DatabaseAPI.Database.Enhancements[iEnh.Enh].TypeID !== eType.SetO) {
      return;
    }

    const nIdSet = DatabaseAPI.Database.Enhancements[iEnh.Enh].nIDSet;
    const index = this.Lookup(nIdSet);

    if (index >= 0) {
      this.SetInfo[index].SlottedCount++;
      this.SetInfo[index].EnhIndexes.push(iEnh.Enh);
    } else {
      this.SetInfo.push({
        SetIDX: nIdSet,
        SlottedCount: 1,
        Powers: [],
        EnhIndexes: [iEnh.Enh]
      });
    }
  }

  private Lookup(setID: number): number {
    if (setID < 0) {
      return -1;
    }

    for (let index = 0; index < this.SetInfo.length; index++) {
      if (this.SetInfo[index].SetIDX === setID) {
        return index;
      }
    }

    return -1;
  }

  BuildEffects(pvMode: ePvX): void {
    for (const setInfo of this.SetInfo) {
      if (setInfo.SlottedCount < 1) {
        continue;
      }

      const enhancementSet = DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX];

      for (const bonus of enhancementSet.Bonus) {
        if (
          bonus.Slotted <= setInfo.SlottedCount &&
          (bonus.PvMode === pvMode || bonus.PvMode === ePvX.Any)
        ) {
          for (const powerIndex of bonus.Index) {
            setInfo.Powers.push(powerIndex);
          }
        }
      }

      for (var index2 = 0;
        index2 < DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX].Enhancements.length;
        index2++)
      {
        if (!DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX].SpecialBonus[index2].Index.length)
          continue;
        for (var index3 = 0; index3 < setInfo.EnhIndexes.length; ++index3)
        {
          if (setInfo.EnhIndexes[index3] != DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX].Enhancements[index2])
              continue;
          for (var index4 = 0;
            index4 < DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX].SpecialBonus[index2].Index.length;
            ++index4)
          {
              setInfo.Powers.push(DatabaseAPI.Database.EnhancementSets[setInfo.SetIDX].SpecialBonus[index2].Index[index4]);
          }
        }
      }
    }
  }
}

