// Converted from C# Modifiers.cs
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';

export class ModifierTable {
  Table: number[][] = [];
  BaseIndex: number = 0;
  ID: string = '';

  constructor(archetypesListLength?: number) {
    if (archetypesListLength !== undefined) {
      // Initialize with fixed number of rows (55 for levels 1-50 + extras)
      // Based on comment in C#: //public float[][] Table = new float[55][];
      const numRows = 55;
      for (let index = 0; index < numRows; index++) {
        this.Table.push(new Array(archetypesListLength).fill(0));
      }
    } else {
      // Empty initialization
      this.Table = [];
    }
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeString(this.ID);
    writer.writeInt(this.BaseIndex);
    
    for (let index1 = 0; index1 < this.Table.length; index1++) {
      writer.writeInt(this.Table[index1].length - 1);
      for (let index2 = 0; index2 < this.Table[index1].length; index2++) {
        writer.writeFloat(this.Table[index1][index2]);
      }
    }
  }

  Load(reader: BinaryReader): void {
    this.ID = reader.readString();
    this.BaseIndex = reader.readInt();
    
    // The C# code has a bug where it checks Table.Count before populating
    // Based on the comment in C#: //public float[][] Table = new float[55][];
    // It seems like there are 55 rows (for levels 1-50 + extras)
    // The format reads the count for each row first, then the values
    this.Table = [];
    
    // Read the number of rows first (standard binary format pattern)
    // If not present, use fixed 55 based on C# comment
    const numRows = 55; // Fixed based on C# comment: //public float[][] Table = new float[55][];
    
    for (let index1 = 0; index1 < numRows; index1++) {
      const rowLength = reader.readInt() + 1; // +1 because it's stored as length - 1
      const row: number[] = [];
      for (let index2 = 0; index2 < rowLength; index2++) {
        row.push(reader.readFloat());
      }
      this.Table.push(row);
    }
  }
}

export class Modifiers {
  Modifier: ModifierTable[] = [];
  Revision: number = 0;
  RevisionDate: Date = new Date(0);
  SourceIndex: string = '';
  SourceTables: string = '';

  Clone(): Modifiers {
    const cloned = new Modifiers();
    cloned.Revision = this.Revision;
    cloned.RevisionDate = new Date(this.RevisionDate);
    cloned.SourceIndex = this.SourceIndex;
    cloned.SourceTables = this.SourceTables;
    cloned.Modifier = this.Modifier.map(m => {
      const newMod = new ModifierTable();
      newMod.ID = m.ID;
      newMod.BaseIndex = m.BaseIndex;
      newMod.Table = m.Table.map(row => [...row]);
      return newMod;
    });
    return cloned;
  }

  async Load(iPath?: string): Promise<boolean> {
    const { AppDataPaths } = await import('./AppDataPaths');
    const { DatabaseAPI } = await import('./DatabaseAPI');
    
    let path = AppDataPaths.SelectDataFileLoad(AppDataPaths.JsonFileModifiers, iPath);
    
    try {
      // Try to load from JSON first
      const jsonResponse = await fetch(path);
      if (jsonResponse.ok) {
        const jsonText = await jsonResponse.text();
        const data = JSON.parse(jsonText);
        
        // Assign properties
        this.Revision = data.Revision ?? 0;
        this.RevisionDate = data.RevisionDate ? new Date(data.RevisionDate) : new Date(0);
        this.SourceIndex = data.SourceIndex ?? '';
        this.SourceTables = data.SourceTables ?? '';
        this.Modifier = (data.Modifier || []).map((m: any) => {
          const modTable = new ModifierTable();
          modTable.ID = m.ID ?? '';
          modTable.BaseIndex = m.BaseIndex ?? 0;
          modTable.Table = (m.Table || []).map((row: number[]) => [...row]);
          return modTable;
        });
        
        // Update Database.AttribMods
        DatabaseAPI.Database.AttribMods = this;
        return true;
      }
    } catch (ex: any) {
      console.error(`Modifier table file isn't how it should be....\nMessage: ${ex.message}\nStackTrace: ${ex.stack}\nNo modifiers were loaded.`);
    }
    
    // Try binary format if JSON failed
    if (iPath && iPath.trim() !== '') {
      path = AppDataPaths.SelectDataFileLoad(AppDataPaths.MxdbFileModifiers, iPath);
      
      try {
        const response = await fetch(path);
        if (!response.ok) {
          return false;
        }
        
        const data = await response.arrayBuffer();
        const buffer = new Uint8Array(data);
        const reader = new BinaryReader(buffer);
        
        const header = reader.readString();
        if (header !== AppDataPaths.Headers.AttribMod.Start) {
          console.error("Modifier table header wasn't found, file may be corrupt!");
          return false;
        }
        
        this.Revision = reader.readInt();
        this.RevisionDate = new Date(reader.readLong());
        this.SourceIndex = reader.readString();
        this.SourceTables = reader.readString();
        
        // The C# code has a bug - it checks Modifier.Count before populating
        // The loop `for (int index = 0; index <= Modifier.Count - 1; ++index)` will never execute
        // We need to read a count first (standard binary format pattern)
        // Read the number of modifier tables
        const numModifiers = reader.readInt() + 1; // +1 because it's stored as length - 1
        this.Modifier = [];
        
        for (let index = 0; index < numModifiers; index++) {
          const modTable = new ModifierTable();
          modTable.Load(reader);
          this.Modifier.push(modTable);
        }
        
        // Update Database.AttribMods
        DatabaseAPI.Database.AttribMods = this;
        return true;
      } catch (ex: any) {
        console.error(`Modifier table file isn't how it should be (${ex.message})\nNo modifiers loaded.`);
        this.Modifier = [];
        return false;
      }
    }
    
    return false;
  }

  async Store(serializer: any, iPath?: string): Promise<void> {
    const { AppDataPaths } = await import('./AppDataPaths');
    const { DatabaseAPI } = await import('./DatabaseAPI');
    
    let path: string;
    if (!iPath || iPath.trim() === '') {
      path = AppDataPaths.SelectDataFileSave('AttribMod.json');
    } else {
      path = AppDataPaths.SelectDataFileSave('AttribMod.json', iPath);
    }
    
    const jsonText = JSON.stringify(DatabaseAPI.Database.AttribMods, null, 2);
    
    try {
      await fetch(path, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonText,
      });
    } catch (error) {
      console.error('Error saving modifier tables:', error);
      throw error;
    }
  }
}

