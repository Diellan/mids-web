// Converted from C# PowersReplTable.cs
import fs from 'fs';
import { AppDataPaths } from './AppDataPaths';

interface AlternateEntry {
  SourcePowerId: number;
  TargetPowerId: number;
  Archetype: string;
}

export class PowersReplTable {
  private _table: AlternateEntry[] = [];
  private static _current: PowersReplTable | null = null;
  private static readonly EnableDebug = false;

  static get Current(): PowersReplTable {
    if (PowersReplTable._current === null) {
      throw new Error('PowersReplTable not initialized');
    }
    return PowersReplTable._current;
  }

  private constructor(cnt: string) {
    cnt = cnt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove blank lines
    cnt = cnt.replace(/\n{2,}/g, '\n');

    // Remove comments
    cnt = cnt.replace(/\s*#.*/g, '');

    // Split by lines
    const lines = cnt.split('\n');
    this._table = [];

    const rItems = /,\s*/;
    const rBlocks = /^\[([a-zA-Z\s]+)\]/;
    let block = '';

    for (const l of lines) {
      const line = l.trim();
      if (!line) continue;

      const blockMatch = line.match(rBlocks);
      if (blockMatch) {
        block = blockMatch[1].toLowerCase();
        if (block === 'global') {
          block = '';
        }
        continue;
      }

      if (!rItems.test(line)) continue;

      const chunks = line.split(rItems);
      if (chunks.length !== 2) continue;

      const id1 = parseInt(chunks[0], 10);
      const id2 = parseInt(chunks[1], 10);

      if (isNaN(id1) || isNaN(id2)) continue;

      this._table.push({
        SourcePowerId: id1,
        TargetPowerId: id2,
        Archetype: block
      });
    }
  }

  static async Initialize(path: string): Promise<void> {
    try {
      const filename = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbPowersReplTable, path);
      if (!filename) {
        throw new Error('FNamePowersRepl path not configured');
      }
      if (PowersReplTable.EnableDebug) {
        console.log(`Loading PowersReplTable from ${filename}`);
      }
      const response = await fetch(filename);
      if (!response.ok) {
        throw new Error(`Failed to load PowersReplTable file: ${filename}`);
      }
      const cnt = (await response.text()).trim();
      PowersReplTable._current = new PowersReplTable(cnt);
      const pass1Count = PowersReplTable._current._table.length;
      if (PowersReplTable.EnableDebug) {
        console.log(`PowersReplTable Count (pass 1): ${pass1Count}`);
      }
      PowersReplTable._current.CheckConsistency();
      if (PowersReplTable.EnableDebug) {
        console.log(
          `PowersReplTable Count (pass 2): ${PowersReplTable._current._table.length}`
        );
      }
    } catch (ex: any) {
      console.error(`Error initializing PowersReplTable: ${ex.message}`);
      throw ex;
    }
  }

  get Entries(): number {
    return this._table.length;
  }

  FetchAlternate(oldId: number, archetype: string = ''): number {
    if (this._table === null || this._table.length === 0) {
      return -1;
    }

    const archetypeLower = archetype.toLowerCase();

    for (const item of this._table) {
      if (item.SourcePowerId === oldId && archetype === '') {
        return item.TargetPowerId;
      }

      if (item.SourcePowerId === oldId && archetype !== '' && archetypeLower === item.Archetype) {
        return item.TargetPowerId;
      }
    }

    return -1;
  }

  private CheckConsistency(): void {
    const itemsToRemove: AlternateEntry[] = [];
    const counters = new Map<number, number>();

    for (const item of this._table) {
      // Check for duplicate source power IDs
      const count = counters.get(item.SourcePowerId) || 0;
      if (count > 0) {
        itemsToRemove.push(item);
        if (PowersReplTable.EnableDebug) {
          console.warn(
            `Duplicate source power ID ${item.SourcePowerId} found. Removing entry.`
          );
        }
      } else {
        counters.set(item.SourcePowerId, 1);
      }

      // Check if source and target powers exist in database
      // Note: Would need DatabaseAPI access to verify power existence
      // For now, we'll just check for basic validity
      if (item.SourcePowerId < 0 || item.TargetPowerId < 0) {
        itemsToRemove.push(item);
      }
    }

    // Remove invalid items
    this._table = this._table.filter(
      item => !itemsToRemove.includes(item)
    );
  }

  Dump(): void {
    // Note: Debug output implementation
  }
}

