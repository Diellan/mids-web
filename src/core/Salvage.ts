// Converted from C# Salvage.cs
import { RecipeRarity } from './Recipe';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';

export enum SalvageOrigin {
  Tech,
  Magic,
  Special
}

export class Salvage {
  ExternalName: string = '';
  InternalName: string = '';
  LevelMax: number = 0;
  LevelMin: number = 0;
  Origin: SalvageOrigin = SalvageOrigin.Tech;
  Rarity: RecipeRarity = RecipeRarity.Common;

  constructor(iSalvageOrReader?: Salvage | BinaryReader) {
    if (iSalvageOrReader instanceof BinaryReader) {
      const reader = iSalvageOrReader;
      this.InternalName = reader.readString();
      this.ExternalName = reader.readString();
      this.Rarity = reader.readInt() as RecipeRarity;
      this.LevelMin = reader.readInt();
      this.LevelMax = reader.readInt();
      this.Origin = reader.readInt() as SalvageOrigin;
    } else if (iSalvageOrReader) {
      const iSalvage = iSalvageOrReader;
      this.InternalName = iSalvage.InternalName;
      this.ExternalName = iSalvage.ExternalName;
      this.Rarity = iSalvage.Rarity;
      this.LevelMin = iSalvage.LevelMin;
      this.LevelMax = iSalvage.LevelMax;
      this.Origin = iSalvage.Origin;
    }
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeString(this.InternalName);
    writer.writeString(this.ExternalName);
    writer.writeInt(this.Rarity);
    writer.writeInt(this.LevelMin);
    writer.writeInt(this.LevelMax);
    writer.writeInt(this.Origin);
  }
}

