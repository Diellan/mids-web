// Converted from C# ArrayExt.cs
export class ArrayExt {
  /**
   * Pad an array both directions with a value to match a target length.
   */
  static Pad<T>(arr: T[], padWith: T, targetLength: number, padBefore: number = 0): T[] {
    if (arr.length >= targetLength) {
      return arr;
    }

    padBefore = Math.max(0, Math.min(padBefore, targetLength - arr.length));

    const padBeforeArr = padBefore === 0 ? [] : new Array(padBefore).fill(padWith);
    const padAfterCount = targetLength - arr.length - padBefore;
    const padAfterArr = padAfterCount <= 0 ? [] : new Array(padAfterCount).fill(padWith);

    return [...padBeforeArr, ...arr, ...padAfterArr];
  }
}

