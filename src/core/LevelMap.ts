// Converted from C# LevelMap.cs
import { dmItem } from './Enums';

export class LevelMap {
  readonly Powers: number;
  readonly Slots: number;

  constructor(ioString: string[]) {
    try {
      const powersValue = parseInt(ioString[1], 10);
      this.Powers = isNaN(powersValue) ? 0 : powersValue;

      if (ioString.length <= 2) {
        this.Slots = 0;
        return;
      }

      const slotsValue = parseInt(ioString[2], 10);
      this.Slots = isNaN(slotsValue) ? 0 : slotsValue;
    } catch (ex) {
      // Note: MessageBox.Show removed as it's Windows Forms specific
      // In TypeScript, you might want to use a logging service or throw the error
      const error = ex instanceof Error ? ex.message : String(ex);
      throw new Error(`An error has occurred reading level data from database. Error: ${error}`);
    }
  }

  LevelType(): dmItem {
    if (this.Powers <= 0) {
      if (this.Slots <= 0) {
        return dmItem.None;
      } else {
        return dmItem.Slot;
      }
    } else {
      return dmItem.Power;
    }
  }
}

