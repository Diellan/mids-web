// Converted from C# Extensions.cs
export class Extensions {
  static RemoveIndex<T>(source: T[], index: number): T[] {
    return source.filter((_, i) => i !== index);
  }

  static RemoveLast<T>(items: T[]): T[] {
    return items.slice(0, items.length - 1);
  }

  static TryFindIndex<T>(items: T[], predicate: (item: T) => boolean): number {
    for (let i = 0; i < items.length; i++) {
      if (predicate(items[i])) {
        return i;
      }
    }
    return -1;
  }

  static WhereI<T>(items: T[], predicate: (item: T, index: number) => boolean): T[] {
    return items.filter((item, index) => predicate(item, index));
  }

  static ExceptIndex<T>(items: T[], badIndex: number): T[] {
    return items.filter((_, i) => i !== badIndex);
  }

  static FindIndexes<T>(items: T[], predicate: (item: T) => boolean): number[] {
    const indexes: number[] = [];
    for (let i = 0; i < items.length; i++) {
      if (predicate(items[i])) {
        indexes.push(i);
      }
    }
    return indexes;
  }

  static After(x: string, delimiter: string): string {
    if (!x) throw new Error('x cannot be null');
    if (!delimiter) throw new Error('delimiter must not be null or empty');
    if (x.length < delimiter.length) {
      throw new Error('delimiter was longer than input');
    }
    const ind = x.indexOf(delimiter);
    if (ind < 0) {
      throw new Error('delimiter was not found in string');
    }
    return x.substring(ind + delimiter.length);
  }

  static Before(x: string, delimiter: string): string {
    if (!delimiter) throw new Error('delimiter must not be null or empty');
    if (!x) throw new Error('x cannot be null');
    const i = x.indexOf(delimiter);
    if (i < 0) throw new Error(`x did not contain '${delimiter}'`);
    return x.substring(0, i);
  }
}

