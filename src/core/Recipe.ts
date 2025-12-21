// Converted from C# Recipe.cs
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';

export enum RecipeRarity {
  Common,
  Uncommon,
  Rare,
  UltraRare
}

export class RecipeEntry {
  BuyCost: number = 0;
  BuyCostM: number = 0;
  Count: number[] = [];
  CraftCost: number = 0;
  CraftCostM: number = 0;
  Level: number = 0;
  Salvage: string[] = [];
  SalvageIdx: number[] = [];

  constructor(iRe?: RecipeEntry) {
    if (iRe) {
      this.Level = iRe.Level;
      this.BuyCost = iRe.BuyCost;
      this.CraftCost = iRe.CraftCost;
      this.BuyCostM = iRe.BuyCostM;
      this.CraftCostM = iRe.CraftCostM;
      this.Salvage = [...iRe.Salvage];
      this.SalvageIdx = [...iRe.SalvageIdx];
      this.Count = [...iRe.Count];
    } else {
      // Initialize arrays with 7 elements
      this.Salvage = new Array(7).fill('');
      this.SalvageIdx = new Array(7).fill(-1);
      this.Count = new Array(7).fill(0);
    }
  }

  Clone(): RecipeEntry {
    return new RecipeEntry(this);
  }
}

export class Recipe {
  Enhancement: string = '';
  EnhIdx: number = -1;
  ExternalName: string = '';
  InternalName: string = '';
  Item: RecipeEntry[] = [];
  Rarity: RecipeRarity = RecipeRarity.Common;
  IsVirtual: boolean = false;
  IsGeneric: boolean = false;
  IsHidden: boolean = false;

  constructor(iRecipeOrReader?: Recipe | BinaryReader, legacy?: boolean) {
    if (iRecipeOrReader instanceof BinaryReader) {
      const reader = iRecipeOrReader;
      if (!legacy) {
        this.Rarity = reader.readInt() as RecipeRarity;
        this.InternalName = reader.readString();
        this.ExternalName = reader.readString();
        this.Enhancement = reader.readString();
        const itemCount = reader.readInt() + 1;
        this.Item = new Array(itemCount);
        for (let index1 = 0; index1 < itemCount; index1++) {
          const entry = new RecipeEntry();
          entry.Level = reader.readInt();
          entry.BuyCost = reader.readInt();
          entry.CraftCost = reader.readInt();
          entry.BuyCostM = reader.readInt();
          entry.CraftCostM = reader.readInt();
          const num = reader.readInt();
          entry.Salvage = new Array(num + 1);
          entry.Count = new Array(num + 1);
          entry.SalvageIdx = new Array(num + 1);
          for (let index2 = 0; index2 < entry.Salvage.length; index2++) {
            entry.Salvage[index2] = reader.readString();
            entry.Count[index2] = reader.readInt();
            entry.SalvageIdx[index2] = reader.readInt();
          }
          this.Item[index1] = entry;
        }
        this.IsGeneric = reader.readBoolean();
        this.IsVirtual = reader.readBoolean();
        this.IsHidden = reader.readBoolean();
      } else {
        // Legacy format
        this.Rarity = reader.readInt() as RecipeRarity;
        this.InternalName = reader.readString();
        this.ExternalName = reader.readString();
        this.Enhancement = reader.readString();
        const itemCount = reader.readInt() + 1;
        this.Item = new Array(itemCount);
        for (let index1 = 0; index1 < itemCount; index1++) {
          const entry = new RecipeEntry();
          entry.Level = reader.readInt();
          entry.BuyCost = reader.readInt();
          entry.CraftCost = reader.readInt();
          entry.BuyCostM = reader.readInt();
          entry.CraftCostM = reader.readInt();
          const num = reader.readInt();
          entry.Salvage = new Array(num + 1);
          entry.Count = new Array(num + 1);
          entry.SalvageIdx = new Array(num + 1);
          for (let index2 = 0; index2 < entry.Salvage.length; index2++) {
            entry.Salvage[index2] = reader.readString();
            entry.Count[index2] = reader.readInt();
            entry.SalvageIdx[index2] = reader.readInt();
            reader.readInt(); // Skip legacy field
          }
          this.Item[index1] = entry;
        }
      }
    } else if (iRecipeOrReader) {
      const iRecipe = iRecipeOrReader;
      this.Rarity = iRecipe.Rarity;
      this.InternalName = iRecipe.InternalName;
      this.ExternalName = iRecipe.ExternalName;
      this.Enhancement = iRecipe.Enhancement;
      this.EnhIdx = iRecipe.EnhIdx;
      this.Item = iRecipe.Item.map(item => new RecipeEntry(item));
      this.IsVirtual = iRecipe.IsVirtual;
      this.IsGeneric = iRecipe.IsGeneric;
      this.IsHidden = iRecipe.IsHidden;
    }
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeInt(this.Rarity);
    writer.writeString(this.InternalName);
    writer.writeString(this.ExternalName);
    writer.writeString(this.Enhancement);
    writer.writeInt(this.Item.length - 1);
    for (const recipeEntry of this.Item) {
      writer.writeInt(recipeEntry.Level);
      writer.writeInt(recipeEntry.BuyCost);
      writer.writeInt(recipeEntry.CraftCost);
      writer.writeInt(recipeEntry.BuyCostM);
      writer.writeInt(recipeEntry.CraftCostM);
      writer.writeInt(recipeEntry.Salvage.length - 1);
      for (let index = 0; index < recipeEntry.Salvage.length; index++) {
        writer.writeString(recipeEntry.Salvage[index]);
        writer.writeInt(recipeEntry.Count[index]);
        writer.writeInt(recipeEntry.SalvageIdx[index]);
      }
    }
    writer.writeBoolean(this.IsGeneric);
    writer.writeBoolean(this.IsVirtual);
    writer.writeBoolean(this.IsHidden);
  }
}

