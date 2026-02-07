import { createStore, type StoreApi } from 'zustand/vanilla';
import { devtools } from 'zustand/middleware';
import { Archetype } from "../core/Base/Data_Classes/Archetype";
import { DatabaseAPI } from "../core/DatabaseAPI";
import { IDatabase } from "../core/IDatabase";
import { Toon } from "../core/Toon";
import { Origin } from "../core/Base/Data_Classes/Origin";
import { IPowerset } from "../core/IPowerset";
import { PowerEntry } from "../core/PowerEntry";
import { IPower } from "../core/IPower";
import { TypeGrade } from "../core/Utils/StructAndEnums";
import { IEnhancement } from "../core/IEnhancement";
import { eEnhGrade, eEnhRelative } from "../core/Enums";
import { EnhancementSetCollection } from "../core/EnhancementSetCollection";
import { I9Slot } from "../core/I9Slot";
import { SlotEntry } from "../core/SlotEntry";
import { TotalStatistics } from "../core/TotalStatistics";
import { BuildManager } from "../core/BuildFile/BuildManager";
import { GroupedFx, PairedListItem } from "../core/GroupedFx";
import { MidsContext } from "../core/Base/Master_Classes/MidsContext";
import { I9SetData } from "@/core/I9SetData";
import { IEffect } from "@/core/IEffect";

export interface DomainStoreState {
  /** Internal version counter - incremented on every mutation to trigger re-renders */
  _version: number;
  toon: Toon;
  database: IDatabase;
  highlightedPower: PowerEntry | null;

  // Derived state (eagerly computed on mutations, replacing closure caches)
  powers: (PowerEntry | null)[];
  primaryOptions: IPowerset[];
  secondaryOptions: IPowerset[];
  poolOptions: IPowerset[];
  epicOptions: IPowerset[];
  archetypeOptions: Archetype[];
  originOptions: Origin[];
  basePower: IPower | null;
  enhancedPower: IPower | null;
  totals: TotalStatistics;

  // Character
  getCharacterName: () => string;
  setCharacterName: (name: string) => Promise<void>;
  getCharacterArchetype: () => Archetype | null;
  setCharacterArchetype: (archetype: Archetype) => Promise<void>;
  getCharacterOrigin: () => Origin | null;
  setCharacterOrigin: (origin: Origin) => Promise<void>;

  // Powersets
  getPowersetByIndex: (index: number) => IPowerset | null;
  setPowerset: (powersetName: string, index: number) => Promise<void>;
  getPrimaryPowerSetOptions: () => IPowerset[];
  getSecondaryPowerSetOptions: () => IPowerset[];
  getPowerPoolOptions: () => IPowerset[];
  getEpicPoolOptions: () => IPowerset[];
  getArchetypeOptions: () => Archetype[];
  getOriginOptions: () => Origin[];

  // Powers
  getPowers: () => (PowerEntry | null)[];
  getPowerEntryById: (id: string) => PowerEntry | null;
  togglePower: (power: IPower) => Promise<void>;
  toggleStatInclude: (powerEntryId: string) => Promise<void>;
  toggleProcInclude: (powerEntryId: string) => Promise<void>;
  getHighlightedPower: () => PowerEntry | null;
  setHighlightedPower: (power: PowerEntry) => Promise<void>;
  getBasePower: () => IPower | null;
  getEnhancedPower: () => IPower | null;
  getPowerEffects: (power: PowerEntry | null) => Array<{ key: GroupedFx; value: PairedListItem }>;

  // Enhancements
  getSpecialTypes: () => TypeGrade[];
  getEnhancement: (enhancementId: number) => IEnhancement;
  getEnhancementImagePath: (enhancementId: number) => string;
  getSetType: (setTypeId: number) => TypeGrade;
  getEnhancementSetsByTypeId: (setTypeId: number) => EnhancementSetCollection;
  pickEnhancement: (enhancementIndex: number, grade: eEnhGrade, powerEntryId: string, slotIndex: number) => Promise<void>;

  // Slots
  canPlaceSlot: () => boolean;
  addSlot: (powerEntryId: string) => Promise<void>;

  // Statistics
  getTotalStatistics: () => TotalStatistics;
  getSetBonuses: () => I9SetData[];
  getSetBonusPower: () => IPower | null;
  getCumulativeSetBonuses: () => IEffect[];

  // Async
  loadBuildFile: (buildFile: string) => Promise<void>;
  loadBuildFromContent: (content: string) => Promise<void>;
  saveBuildFile: () => Promise<void>;
}

export type DomainStoreApi = StoreApi<DomainStoreState>;

// --- Derived state computation helpers ---

function computePowers(toon: Toon): (PowerEntry | null)[] {
  return toon.CurrentBuild?.Powers ? [...toon.CurrentBuild.Powers] : [];
}

function computeTotals(toon: Toon): TotalStatistics {
  const clone = new TotalStatistics();
  clone.Assign(toon.Totals);
  return clone;
}

function computePrimaryOptions(toon: Toon, db: IDatabase): IPowerset[] {
  if (!toon.Archetype) return [];
  return toon.Archetype.Primary.map(i => db.Powersets[i]).filter(Boolean);
}

function computeSecondaryOptions(toon: Toon, db: IDatabase): IPowerset[] {
  if (!toon.Archetype) return [];
  return toon.Archetype.Secondary.map(i => db.Powersets[i]).filter(Boolean);
}

function computePoolOptions(toon: Toon, db: IDatabase): IPowerset[] {
  if (!toon.Archetype) return [];
  const poolGroup = toon.Archetype.PoolGroup ?? '';
  return DatabaseAPI.GetPowersetIndexesByGroupName(poolGroup)
    .map(i => db.Powersets[i]).filter(Boolean);
}

function computeEpicOptions(toon: Toon, db: IDatabase): IPowerset[] {
  if (!toon.Archetype) return [];
  return toon.Archetype.Ancillary.map(i => db.Powersets[i]).filter(Boolean);
}

function computeBasePower(toon: Toon, highlightedPower: PowerEntry | null): IPower | null {
  if (!highlightedPower) return null;
  const powerIndex = toon.CurrentBuild?.Powers.findIndex(e => e.Power === highlightedPower.Power) ?? -1;
  return toon.GetBasePower(powerIndex, highlightedPower.NIDPower);
}

function computeEnhancedPower(toon: Toon, highlightedPower: PowerEntry | null): IPower | null {
  if (!highlightedPower) return null;
  return toon.GetEnhancedPower(highlightedPower.Power);
}

function computeAllPowersetOptions(toon: Toon, db: IDatabase) {
  return {
    primaryOptions: computePrimaryOptions(toon, db),
    secondaryOptions: computeSecondaryOptions(toon, db),
    poolOptions: computePoolOptions(toon, db),
    epicOptions: computeEpicOptions(toon, db),
  };
}

export function createDomainStore(database?: IDatabase, toon?: Toon): DomainStoreApi {
  const db = database ?? DatabaseAPI.Database;
  const initialToon = toon ?? new Toon(db?.Classes[0]);

  MidsContext.Character = initialToon;
  MidsContext.Archetype = initialToon.Archetype;
  MidsContext.Build = initialToon.CurrentBuild;

  // Pre-compute initial derived state
  const initialPowers = computePowers(initialToon);
  const initialPowersetOptions = computeAllPowersetOptions(initialToon, db);
  const initialArchetypeOptions = db.Classes.filter(at => at.Playable);
  const initialOriginOptions = db.Origins;

  return createStore<DomainStoreState>()(
    devtools(
      (set, get) => {
        const notify = async (action?: string, extraState?: Partial<DomainStoreState>) => {
          const state = get();
          const toon = extraState?.toon ?? state.toon;
          await toon.GenerateBuffedPowerArray();
          const hp = extraState && 'highlightedPower' in extraState
            ? extraState.highlightedPower
            : state.highlightedPower;

          set(s => ({
            ...extraState,
            _version: s._version + 1,
            powers: computePowers(toon),
            basePower: computeBasePower(toon, hp ?? null),
            enhancedPower: computeEnhancedPower(toon, hp ?? null),
            totals: computeTotals(toon),
          }), false, action);
        };

        return {
          _version: 0,
          toon: initialToon,
          database: db,
          highlightedPower: null,

          // Derived state
          powers: initialPowers,
          primaryOptions: initialPowersetOptions.primaryOptions,
          secondaryOptions: initialPowersetOptions.secondaryOptions,
          poolOptions: initialPowersetOptions.poolOptions,
          epicOptions: initialPowersetOptions.epicOptions,
          archetypeOptions: initialArchetypeOptions,
          originOptions: initialOriginOptions,
          basePower: null,
          enhancedPower: null,
          totals: computeTotals(initialToon),

          // --- Character ---

          getCharacterName: () => get().toon.Name,

          setCharacterName: async (name: string) => {
            const { toon } = get();
            if (toon.Name === name) return;
            toon.Name = name;
            await notify('setCharacterName');
          },

          getCharacterArchetype: () => get().toon.Archetype,

          setCharacterArchetype: async (archetype: Archetype) => {
            const { toon, database } = get();
            if (toon.Archetype?.ClassName === archetype.ClassName) return;
            toon.Reset(archetype);
            await notify('setCharacterArchetype', computeAllPowersetOptions(toon, database));
          },

          getCharacterOrigin: () => {
            const { toon, database } = get();
            return database.Origins[toon.Origin];
          },

          setCharacterOrigin: async (origin: Origin) => {
            const { toon, database } = get();
            const newIndex = database.Origins.findIndex(o => o.Name === origin.Name);
            if (toon.Origin === newIndex) return;
            toon.Origin = newIndex;
            await notify('setCharacterOrigin');
          },

          // --- Powersets ---

          getPowersetByIndex: (index: number) => get().toon.Powersets[index] ?? null,

          setPowerset: async (powersetName: string, index: number) => {
            const { toon, database } = get();
            if (toon.Powersets[index]?.SetName === powersetName) return;
            const powerset = database.Powersets.find(p => p.SetName === powersetName);
            if (!powerset) throw new Error('Powerset not found');
            if (index < 2 && toon.Powersets[index]) {
              toon.SwitchSets(powerset, toon.Powersets[index]);
            }
            toon.Powersets[index] = powerset;
            toon.Validate();
            await notify('setPowerset');
          },

          getPrimaryPowerSetOptions: () => get().primaryOptions,
          getSecondaryPowerSetOptions: () => get().secondaryOptions,
          getPowerPoolOptions: () => get().poolOptions,
          getEpicPoolOptions: () => get().epicOptions,
          getArchetypeOptions: () => get().archetypeOptions,
          getOriginOptions: () => get().originOptions,

          // --- Powers ---

          getPowers: () => get().powers,

          getPowerEntryById: (id: string) => {
            return get().powers.find(p => p && p.id === id) ?? null;
          },

          togglePower: async (power: IPower) => {
            get().toon.BuildPower(power.PowerSetID, power.PowerIndex);
            await notify('togglePower');
          },

          toggleStatInclude: async (powerEntryId: string) => {
            const pe = get().powers.find(p => p && p.id === powerEntryId);
            if (pe && pe.CanIncludeForStats()) {
              pe.StatInclude = !pe.StatInclude;
              await notify('toggleStatInclude');
            }
          },

          toggleProcInclude: async (powerEntryId: string) => {
            const pe = get().powers.find(p => p && p.id === powerEntryId);
            if (pe && pe.HasProc()) {
              pe.ProcInclude = !pe.ProcInclude;
              await notify('toggleProcInclude');
            }
          },

          getHighlightedPower: () => get().highlightedPower,

          setHighlightedPower: async (power: PowerEntry) => {
            await notify('setHighlightedPower', { highlightedPower: power });
          },

          getBasePower: () => get().basePower,

          getEnhancedPower: () => get().enhancedPower,

          getPowerEffects: (power: PowerEntry | null) => {
            if (!power) return [];
            const basePower = get().basePower;
            if (!basePower) return [];
            const enhancedPower = get().enhancedPower ?? basePower;
            const groupedRankedEffects = GroupedFx.AssembleGroupedEffects(enhancedPower ?? basePower ?? null);
            const rankedEffects = enhancedPower?.GetRankedEffects(true) ?? basePower?.GetRankedEffects(true) ?? [];
            return GroupedFx.GenerateListItems(groupedRankedEffects, basePower, enhancedPower ?? basePower, rankedEffects, 10);
          },

          // --- Enhancements ---

          getSpecialTypes: () => get().database.SpecialEnhancements,

          getEnhancement: (enhancementId: number) => get().database.Enhancements[enhancementId],

          getSetType: (setTypeId: number) => get().database.SetTypes[setTypeId],

          getEnhancementSetsByTypeId: (setTypeId: number) => {
            return get().database.EnhancementSets.filter(s => s.SetType === setTypeId) as EnhancementSetCollection;
          },

          pickEnhancement: async (enhancementIndex: number, grade: eEnhGrade, powerEntryId: string, slotIndex: number) => {
            const { toon, database } = get();
            console.debug(`Picking enhancement ${enhancementIndex} (grade ${eEnhGrade[grade]}) for power index ${powerEntryId}, slot index ${slotIndex}`);
            const enhancement = database.Enhancements[enhancementIndex];
            if (!enhancement) throw new Error('Enhancement not found');
            if (!toon.CurrentBuild?.EnhancementTest(slotIndex, powerEntryId, enhancement.StaticIndex)) {
              throw new Error('Enhancement test failed');
            }
            const power = toon.CurrentBuild?.Powers.find(p => p && p.id === powerEntryId);
            if (!power) throw new Error('Power not found');
            const i9Slot = new I9Slot();
            i9Slot.Enh = enhancement.StaticIndex;
            i9Slot.Grade = grade;
            i9Slot.RelativeLevel = eEnhRelative.Even;
            i9Slot.IOLevel = 0;
            power.Slots[slotIndex] = new SlotEntry();
            power.Slots[slotIndex].Enhancement = i9Slot;
            await notify('pickEnhancement');
          },

          // --- Slots ---

          canPlaceSlot: () => get().toon.CanPlaceSlot,

          addSlot: async (powerEntryId: string) => {
            get().toon.BuildSlot(powerEntryId);
            await notify('addSlot');
          },

          // --- Statistics ---

          getTotalStatistics: () => get().totals,

          getSetBonuses: () => get().toon.CurrentBuild?.SetBonuses ?? [],

          getSetBonusPower: () => get().toon.CurrentBuild?.SetBonusVirtualPower ?? null,

          getCumulativeSetBonuses: () => get().toon.CurrentBuild?.GetCumulativeSetBonuses() ?? [],

          // --- Async ---

          loadBuildFile: async (buildFile: string) => {
            const { database } = get();
            const newToon = await BuildManager.Instance.LoadFromFile(buildFile);
            MidsContext.Character = newToon;
            MidsContext.Archetype = newToon.Archetype;
            MidsContext.Build = newToon.CurrentBuild;
            await newToon.GenerateBuffedPowerArray();
            set(s => ({
              toon: newToon,
              _version: s._version + 1,
              highlightedPower: null,
              powers: computePowers(newToon),
              basePower: null,
              enhancedPower: null,
              totals: computeTotals(newToon),
              ...computeAllPowersetOptions(newToon, database),
            }), false, 'loadBuildFile');
          },

          loadBuildFromContent: async (content: string) => {
            const { database } = get();
            const newToon = await BuildManager.Instance.LoadFromContent(content);
            MidsContext.Character = newToon;
            MidsContext.Archetype = newToon.Archetype;
            MidsContext.Build = newToon.CurrentBuild;
            await newToon.GenerateBuffedPowerArray();
            set(s => ({
              toon: newToon,
              _version: s._version + 1,
              highlightedPower: null,
              powers: computePowers(newToon),
              basePower: null,
              enhancedPower: null,
              totals: computeTotals(newToon),
              ...computeAllPowersetOptions(newToon, database),
            }), false, 'loadBuildFromContent');
          },

          saveBuildFile: async () => {
            const { toon } = get();
            const content = BuildManager.Instance.SerializeBuild(toon);
            const defaultName = (toon.Name || 'build') + '.mbd';
            await (window as any).ipcRenderer.invoke('dialog:save-file', { content, defaultName });
          },
        };
      },
      { name: 'DomainStore' }
    )
  );
}
