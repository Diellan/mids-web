// Converted from C# CrypticReplTable.cs
import { AppDataPaths } from '../AppDataPaths';
import { DatabaseAPI } from '../DatabaseAPI';
import { fetchLocal } from '../fetchLocal';

export class CrypticReplTable {
  private _table: Map<string, string> = new Map();
  private static _current: CrypticReplTable | null = null;

  static get Current(): CrypticReplTable {
    if (CrypticReplTable._current === null) {
      throw new Error('CrypticReplTable not initialized');
    }
    return CrypticReplTable._current;
  }

  private constructor(table: Map<string, string>) {
    this._table = table;
  }

  static async Initialize(path: string): Promise<void> {
    try {
      const filename = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbCrypticReplTable, path);
      const response = await fetchLocal(filename);
      if (!response.ok) {
        throw new Error(`Failed to load CrypticReplTable file: ${filename}`);
      }
      let cnt = (await response.text()).trim();
      cnt = cnt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
      // Remove blank lines
      cnt = cnt.replace(/\n{2,}/g, '\n');
  
      // Remove comments
      cnt = cnt.replace(/\s*#.*/g, '');
  
      // Split by lines
      const lines = cnt.split('\n');
      const table = new Map();
  
      const rItems = /,\s*/;
      for (const l of lines) {
        const line = l.trim();
        if (!line) continue;
  
        const chunks = line.split(rItems);
        if (chunks.length !== 2) continue;
  
        const id1 = chunks[0];
        const id2 = chunks[1];
  
        // Skip if IDs are the same (case-insensitive)
        if (id1.toLowerCase() === id2.toLowerCase()) continue;
  
        table.set(id1, id2);
      }

      CrypticReplTable._current = new CrypticReplTable(table);
      CrypticReplTable._current.CheckConsistency();
    } catch (ex: any) {
      console.error(`Error initializing CrypticReplTable: ${ex.message}`);
      throw ex;
    }
  }

  get Entries(): number {
    return this._table.size;
  }

  FetchAlternate(oldId: string): string | null {
    return this._table.get(oldId) ?? null;
  }

  private CheckConsistency(): void {
    const itemsToRemove: Array<[string, string]> = [];
    const counters = new Map<string, number>();

    for (const [key, value] of this._table.entries()) {
      // Check for duplicate input power IDs
      const count = counters.get(key) || 0;
      if (count > 0) {
        itemsToRemove.push([key, value]);
        console.warn(
          `Warning: duplicate input power ID ${key} found. The replacement pair <${key}, ${value}> will be disabled.`
        );
      } else {
        counters.set(key, 1);
      }

      // Check if source power exists in database
      const power = DatabaseAPI.Database.Power.find(
        p => p && p.FullName === key
      );
      if (!power || (power as any).StaticIndex === -1) {
        itemsToRemove.push([key, value]);
        console.warn(
          `Warning: power ID ${key} can be converted to ID ${value} but the source power doesn't exist.`
        );
      }

      // Check if target power exists in database
      const targetPower = DatabaseAPI.Database.Power.find(
        p => p && p.FullName === value
      );
      if (!targetPower || (targetPower as any).StaticIndex === -1) {
        itemsToRemove.push([key, value]);
        console.warn(
          `Warning: power ID ${key} can be converted to ID ${value} but the target power doesn't exist.`
        );
      }
    }

    // Remove invalid items
    for (const [key, value] of itemsToRemove) {
      this._table.delete(key);
    }
  }
}

