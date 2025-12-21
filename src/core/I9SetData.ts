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
      this.SetInfo[index].EnhIndexes = [
        ...this.SetInfo[index].EnhIndexes,
        iEnh.Enh
      ];
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
    for (let index1 = 0; index1 < this.SetInfo.length; index1++) {
      if (this.SetInfo[index1].SlottedCount > 1) {
        const enhancementSet = DatabaseAPI.Database.EnhancementSets[this.SetInfo[index1].SetIDX];
        for (let index2 = 0; index2 < enhancementSet.Bonus.length; index2++) {
          const bonus = enhancementSet.Bonus[index2];
          if (
            bonus.Slotted <= this.SetInfo[index1].SlottedCount &&
            (bonus.PvMode === pvMode || bonus.PvMode === ePvX.Any)
          ) {
            for (let index3 = 0; index3 < bonus.Index.length; index3++) {
              this.SetInfo[index1].Powers = [
                ...this.SetInfo[index1].Powers,
                bonus.Index[index3]
              ];
            }
          }
        }
      }

      if (this.SetInfo[index1].SlottedCount <= 0) {
        continue;
      }

      // Note: Special bonus handling would go here
    }
  }
}

