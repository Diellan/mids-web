import { Archetype } from "@/core/Base/Data_Classes/Archetype";
import { DatabaseAPI } from "../core/DatabaseAPI";
import { IDatabase } from "../core/IDatabase";
import { Toon } from "../core/Toon";
import { Origin } from "@/core/Base/Data_Classes/Origin";
import { IPowerset } from "@/core/IPowerset";
import { PowerEntry } from "@/core/PowerEntry";
import { IPower } from "@/core/IPower";
import { TypeGrade } from "@/core/Utils/StructAndEnums";
import { IEnhancement } from "@/core/IEnhancement";
import { eEnhGrade, eType, sEnhClass } from "@/core/Enums";
import { EnhancementSetCollection } from "@/core/EnhancementSetCollection";
import { I9Slot } from "@/core/I9Slot";
import { SlotEntry } from "@/core/SlotEntry";

type Listener = () => void;

export class DomainStore {
  private listeners = new Set<Listener>();

  private readonly database: IDatabase;
  private readonly toon: Toon;

  // Cache for computed arrays to prevent infinite re-renders
  private cachedPrimaryOptions: IPowerset[] | null = null;
  private cachedSecondaryOptions: IPowerset[] | null = null;
  private cachedPoolOptions: IPowerset[] | null = null;
  private cachedEpicOptions: IPowerset[] | null = null;
  private cachedArchetypeOptions: Archetype[] | null = null;
  private cachedOriginOptions: Origin[] | null = null;
  private cachedPowers: (PowerEntry | null)[] | null = null;
  private cachedPowersLength: number = -1; // Track array length to detect changes
  private originalPowersRef: (PowerEntry | null)[] | null = null; // Track original array reference
  private lastArchetypeClassName: string | null = null;
  private lastPoolGroup: string | null = null;
  private highlightedPower: PowerEntry | null = null;

  constructor(database?: IDatabase, toon?: Toon) {
    if (!database) {
      database = DatabaseAPI.Database;
    }

    if (!toon) {
      toon = new Toon(database?.Classes[0]);
    }
    this.database = database;
    this.toon = toon;
    
    // Initialize caches on construction
    this.lastArchetypeClassName = this.toon.Archetype?.ClassName ?? null;
    this.lastPoolGroup = this.toon.Archetype?.PoolGroup ?? null;
    this.cachedPowers = this.toon.CurrentBuild?.Powers ?? [];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.toon.GenerateBuffedPowerArray();
    for (const l of this.listeners) l();
  }

  getCharacterName(): string {
    return this.toon.Name;
  }

  setCharacterName(name: string) {
    if (this.toon.Name === name) {
      return;
    }

    this.toon.Name = name;
    this.notify();
  }

  getCharacterArchetype(): Archetype | null {
    return this.toon.Archetype;
  }

  setCharacterArchetype(archetype: Archetype) {
    if (this.toon.Archetype?.ClassName === archetype.ClassName) {
      return;
    }

    this.toon.Reset(archetype);
    // Clear caches when archetype changes
    this.cachedPrimaryOptions = null;
    this.cachedSecondaryOptions = null;
    this.cachedPoolOptions = null;
    this.cachedEpicOptions = null;
    this.cachedPowers = null;
    this.lastArchetypeClassName = archetype.ClassName;
    this.lastPoolGroup = archetype.PoolGroup ?? null;
    this.notify();
  }

  getCharacterOrigin(): Origin | null {
    return this.database.Origins[this.toon.Origin];
  }

  setCharacterOrigin(origin: Origin) {
    if (this.toon.Origin === this.database.Origins.findIndex(o => o.Name === origin.Name)) {
      return;
    }

    this.toon.Origin = this.database.Origins.findIndex(o => o.Name === origin.Name);
    this.notify();
  }

  getPowersetByIndex(index: number): IPowerset | null {
    // Index refers to the toon's Powersets array (0=Primary, 1=Secondary, 3-6=Pools, 7=Epic)
    // not the database's Powersets array
    return this.toon.Powersets[index] ?? null;
  }

  getPowers(): (PowerEntry | null)[] {
    // Return a shallow copy to ensure useSyncExternalStore detects changes
    // when BuildPower modifies the array contents
    const currentPowers = this.toon.CurrentBuild?.Powers;
    if (currentPowers) {
      // Check if the array reference or length has changed
      const currentLength = currentPowers.length;
      // If the original array reference changed OR the length changed, create a new copy
      if (!this.cachedPowers || 
          this.originalPowersRef !== currentPowers || 
          this.cachedPowersLength !== currentLength) {
        // Array has changed - create a new shallow copy
        // This ensures useSyncExternalStore detects the change
        this.cachedPowers = [...currentPowers];
        this.cachedPowersLength = currentLength;
        this.originalPowersRef = currentPowers;
      }
      return this.cachedPowers;
    }
    // Return empty array - create once and reuse
    if (!this.cachedPowers || this.cachedPowers.length > 0) {
      this.cachedPowers = [];
      this.cachedPowersLength = 0;
      this.originalPowersRef = null;
    }
    return this.cachedPowers;
  }

  togglePower(power: IPower) {
    this.toon.BuildPower(power.PowerSetID, power.PowerIndex);
    // Clear powers cache when build changes - getPowers will create a new copy
    // This ensures useSyncExternalStore detects the change
    this.cachedPowers = null;
    this.cachedPowersLength = -1;
    this.originalPowersRef = null;
    this.notify();
  }

  getPrimaryPowerSetOptions(): IPowerset[] {
    const currentClassName = this.toon.Archetype?.ClassName ?? null;
    if (this.cachedPrimaryOptions && currentClassName === this.lastArchetypeClassName && currentClassName !== null) {
      return this.cachedPrimaryOptions;
    }
    if (!this.toon.Archetype) {
      return this.cachedPrimaryOptions ?? [];
    }
    this.cachedPrimaryOptions = this.toon.Archetype.Primary.map(index => this.database.Powersets[index]).filter(Boolean) ?? [];
    this.lastArchetypeClassName = currentClassName;
    return this.cachedPrimaryOptions;
  }

  getSecondaryPowerSetOptions(): IPowerset[] {
    const currentClassName = this.toon.Archetype?.ClassName ?? null;
    if (this.cachedSecondaryOptions && currentClassName === this.lastArchetypeClassName && currentClassName !== null) {
      return this.cachedSecondaryOptions;
    }
    if (!this.toon.Archetype) {
      return this.cachedSecondaryOptions ?? [];
    }
    this.cachedSecondaryOptions = this.toon.Archetype.Secondary.map(index => this.database.Powersets[index]).filter(Boolean) ?? [];
    this.lastArchetypeClassName = currentClassName;
    return this.cachedSecondaryOptions;
  }

  getPowerPoolOptions(): IPowerset[] {
    const currentPoolGroup = this.toon.Archetype?.PoolGroup ?? '';
    if (this.cachedPoolOptions && currentPoolGroup === this.lastPoolGroup && currentPoolGroup !== '') {
      return this.cachedPoolOptions;
    }
    if (!this.toon.Archetype) {
      return this.cachedPoolOptions ?? [];
    }
    this.cachedPoolOptions = DatabaseAPI.GetPowersetIndexesByGroupName(currentPoolGroup).map(index => this.database.Powersets[index]).filter(Boolean) ?? [];
    this.lastPoolGroup = currentPoolGroup;
    return this.cachedPoolOptions;
  }

  getEpicPoolOptions(): IPowerset[] {
    const currentClassName = this.toon.Archetype?.ClassName ?? null;
    if (this.cachedEpicOptions && currentClassName === this.lastArchetypeClassName && currentClassName !== null) {
      return this.cachedEpicOptions;
    }
    if (!this.toon.Archetype) {
      return this.cachedEpicOptions ?? [];
    }
    this.cachedEpicOptions = this.toon.Archetype.Ancillary.map(index => this.database.Powersets[index]).filter(Boolean) ?? [];
    this.lastArchetypeClassName = currentClassName;
    return this.cachedEpicOptions;
  }

  getArchetypeOptions(): Archetype[] {
    if (this.cachedArchetypeOptions) {
      return this.cachedArchetypeOptions;
    }
    this.cachedArchetypeOptions = this.database.Classes.filter(at => at.Playable);
    return this.cachedArchetypeOptions;
  }

  getOriginOptions(): Origin[] {
    if (this.cachedOriginOptions) {
      return this.cachedOriginOptions;
    }
    this.cachedOriginOptions = this.database.Origins;
    return this.cachedOriginOptions;
  }

  getHighlightedPower(): PowerEntry | null {
    return this.highlightedPower;
  }

  setHighlightedPower(power: PowerEntry) {
    this.highlightedPower = power;
    this.notify();
  }

  getSpecialTypes(): TypeGrade[] {
    return this.database.SpecialEnhancements;
  }

  getEnhancement(enhancementId: number): IEnhancement {
    return this.database.Enhancements[enhancementId];
  }

  getSetType(setTypeId: number): TypeGrade {
    return this.database.SetTypes[setTypeId];
  }

  getEnhancementSetsByTypeId(setTypeId: number): EnhancementSetCollection {
    return this.database.EnhancementSets.filter(set => set.SetType === setTypeId) as EnhancementSetCollection;
  }

  pickEnhancement(enhancementIndex: number, grade: eEnhGrade, powerIndex: number, slotIndex: number) {
    const enhancement = this.database.Enhancements[enhancementIndex];
    if (!enhancement) {
      throw new Error('Enhancement not found');
    }

    if (!this.toon.CurrentBuild?.EnhancementTest(slotIndex, powerIndex, enhancement.StaticIndex)) {
      throw new Error('Enhancement test failed');
    }

    const power = this.toon.CurrentBuild?.Powers[powerIndex];
    if (!power) {
      throw new Error('Power not found');
    }

    const i9Slot = new I9Slot();
    i9Slot.Enh = enhancement.StaticIndex;
    i9Slot.Grade = grade;
    i9Slot.RelativeLevel = 0;
    i9Slot.IOLevel = 0;
    power.Slots[slotIndex] = new SlotEntry();
    power.Slots[slotIndex].Enhancement = i9Slot;
    this.notify();
  }
}
