// Converted from C# SlotEntry.cs
import { I9Slot } from './I9Slot';
import { eEnhRelative, eEnhGrade } from './Enums';

export class SlotEntry {
  Level: number = 0;
  IsInherent: boolean = false;
  Enhancement: I9Slot = new I9Slot();
  FlippedEnhancement: I9Slot = new I9Slot();

  Assign(slotEntry: SlotEntry): void {
    this.Level = slotEntry.Level;
    this.IsInherent = slotEntry.IsInherent;
    this.Enhancement = slotEntry.Enhancement.Clone();
    this.FlippedEnhancement = slotEntry.FlippedEnhancement.Clone();
  }

  Flip(): void {
    const temp = this.Enhancement.Clone();
    this.Enhancement = this.FlippedEnhancement.Clone();
    this.FlippedEnhancement = temp;
  }

  LoadFromString(iString: string, delimiter: string): void {
    const strArray = iString.split(delimiter);
    const i9Slot1 = new I9Slot();
    const i9Slot2 = new I9Slot();

    if (strArray.length > 4) {
      // Note: Would need DatabaseAPI.FindEnhancement for full implementation
      // i9Slot1.Enh = DatabaseAPI.FindEnhancement(strArray[0], strArray[1], parseInt(strArray[2]), parseInt(strArray[3]));
      i9Slot1.RelativeLevel = parseInt(strArray[4]) as eEnhRelative;
      i9Slot1.Grade = parseInt(strArray[5]) as eEnhGrade;
      i9Slot1.IOLevel = parseInt(strArray[6]);
      if (i9Slot1.IOLevel > 49) {
        i9Slot1.IOLevel = 49;
      }

      if (strArray.length > 12) {
        // i9Slot2.Enh = DatabaseAPI.FindEnhancement(strArray[7], strArray[8], parseInt(strArray[9]), parseInt(strArray[10]));
        i9Slot2.RelativeLevel = parseInt(strArray[11]) as eEnhRelative;
        i9Slot2.Grade = parseInt(strArray[12]) as eEnhGrade;
        i9Slot2.IOLevel = parseInt(strArray[13]);
        if (i9Slot2.IOLevel > 49) {
          i9Slot2.IOLevel = 49;
        }
      }
    } else if (strArray.length > 3) {
      i9Slot1.Enh = parseInt(strArray[0]);
      i9Slot1.RelativeLevel = parseInt(strArray[1]) as eEnhRelative;
      i9Slot1.Grade = parseInt(strArray[2]) as eEnhGrade;
      i9Slot1.IOLevel = parseInt(strArray[3]);
      if (i9Slot1.IOLevel > 49) {
        i9Slot1.IOLevel = 49;
      }
    }

    this.Enhancement = i9Slot1.Clone();
    this.FlippedEnhancement = i9Slot2.Clone();
  }
}

