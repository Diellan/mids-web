// Converted from C# Character.cs
// This is a large file (1,944 lines in C#). Converting systematically.

import { Archetype } from './Archetype';
import { IPowerset } from '../../IPowerset';
import { Build } from '../../Build';
import { TotalStatistics } from '../../TotalStatistics';
import { Statistics } from '../../Statistics';
import * as Enums from '../../Enums';
import { DatabaseAPI } from '../../DatabaseAPI';
import { MidsContext } from '../Master_Classes/MidsContext';
import { InherentDisplayItem } from '../Display/InherentDisplayItem';
import { MidsCharacterFileFormat } from '../../MidsCharacterFileFormat';
import { I9Slot } from '../../I9Slot';
import { PowerEntry } from '../../PowerEntry';
import { PopUp, PopupData, Section } from '../Display/PopUp';
import { Enhancement } from '../../Enhancement';
import { Recipe, RecipeRarity } from '../../Recipe';
import { clsRewardCurrency } from '../../clsRewardCurrency';
import { SlotEntry } from '../../SlotEntry';

export class Character {
    private _completeCache: boolean | null = null;
    private LevelCache: number = -1;
    private PerfectionType: string | null = null;

    // Properties
    Name: string = '';
    Comment: string = '';
    Powersets: (IPowerset | null)[] = new Array(8).fill(null);
    PoolLocked: boolean[] = new Array(5).fill(false);
    Totals: TotalStatistics = new TotalStatistics();
    TotalsCapped: TotalStatistics = new TotalStatistics();
    DisplayStats: Statistics;
    Builds: (Build | null)[] = [];
    PEnhancementsList: string[] = [];
    setName: string | null = null;
    RequestedLevel: number = 0;
    Origin: number = 0;
    Locked: boolean = false;
    ActiveComboLevel: number = 0;
    AcceleratedActive: boolean = false;
    DelayedActive: boolean = false;
    DisintegrateActive: boolean = false;
    TargetDroneActive: boolean = false;
    Assassination: boolean = false;
    Domination: boolean = false;
    Containment: boolean = false;
    Scourge: boolean = false;
    CriticalHits: boolean = false;
    FastModeActive: boolean = false;
    Defiance: boolean = false;
    DefensiveAdaptation: boolean = false;
    EfficientAdaptation: boolean = false;
    OffensiveAdaptation: boolean = false;
    NotDefensiveAdaptation: boolean = false;
    NotDefensiveNorOffensiveAdaptation: boolean = false;
    BoxingBuff: boolean = false;
    NotBoxingBuff: boolean = false;
    KickBuff: boolean = false;
    NotKickBuff: boolean = false;
    CrossPunchBuff: boolean = false;
    NotCrossPunchBuff: boolean = false;
    Supremacy: boolean = false;
    SupremacyAndBuffPwr: boolean = false;
    PetTier2: boolean = false;
    PetTier3: boolean = false;
    PackMentality: boolean = false;
    NotPackMentality: boolean = false;
    FastSnipe: boolean = false;
    NotFastSnipe: boolean = false;
    ModifyEffects: Map<string, number> | null = null;
    InherentDisplayList: InherentDisplayItem[] | null = null;
    Archetype: Archetype | null = null;
    Alignment: Enums.Alignment = Enums.Alignment.Hero;

    constructor(archetype: Archetype | null = null, alignment: Enums.Alignment = Enums.Alignment.Hero) {
        this.Archetype = archetype;
        this.Alignment = alignment;
        this.Name = '';
        this.Comment = '';
        this.Powersets = new Array(8).fill(null);
        this.PoolLocked = new Array(5).fill(false);
        this.Totals = new TotalStatistics();
        this.TotalsCapped = new TotalStatistics();
        this.DisplayStats = new Statistics(this);
        this.Builds = [new Build(this, DatabaseAPI.Database.Levels)];
        this.PEnhancementsList = [];
        this.Reset();
    }

    // Computed properties
    get Level(): number {
        if (this.LevelCache > -1) {
            return this.LevelCache;
        }

        let num2: number;
        if (MidsContext.Config?.BuildMode === Enums.dmModes.Normal || MidsContext.Config?.BuildMode === Enums.dmModes.Respec) {
            const currentBuild = this.CurrentBuild;
            if (!currentBuild) {
                return 0;
            }
            num2 = currentBuild.GetMaxLevel();
        } else {
            const currentBuild = this.CurrentBuild;
            if (!currentBuild) {
                return 0;
            }
            const val1 = this.GetFirstAvailablePowerLevel(currentBuild);
            const adjustedVal1 = val1 < 0 ? 49 : val1;
            const val2 = this.GetFirstAvailableSlotLevel();
            const adjustedVal2 = val2 < 0 ? 49 : val2;
            num2 = Math.min(adjustedVal1, adjustedVal2);
        }

        if (num2 < 0) {
            num2 = 49;
        }
        this.LevelCache = num2;
        return num2;
    }

    static get MaxLevel(): number {
        return 49;
    }

    get CurrentBuild(): Build | null {
        return this.Builds[0];
    }

    get Complete(): boolean {
        if (this._completeCache !== null) {
            return this._completeCache;
        }
        const currentBuild = this.CurrentBuild;
        if (!currentBuild) {
            return false;
        }
        const num1 = Build.TotalSlotsAvailable - currentBuild.SlotsPlaced;
        const num2 = currentBuild.LastPower + 1 - currentBuild.PowersPlaced;
        this._completeCache = num1 < 1 && num2 < 1;
        return this._completeCache;
    }

    set Complete(value: boolean) {
        this._completeCache = value ? this._completeCache : null;
    }

    get PerfectionOfBodyLevel(): number {
        return (this.IsStalker || this.PerfectionType === 'body') ? this.ActiveComboLevel : 0;
    }

    get PerfectionOfMindLevel(): number {
        return (!this.IsStalker && this.PerfectionType === 'mind') ? this.ActiveComboLevel : 0;
    }

    get PerfectionOfSoulLevel(): number {
        return (!this.IsStalker && this.PerfectionType === 'soul') ? this.ActiveComboLevel : 0;
    }

    get SlotsRemaining(): number {
        const currentBuild = this.CurrentBuild;
        if (!currentBuild) {
            return 0;
        }
        return Build.TotalSlotsAvailable - currentBuild.SlotsPlaced;
    }

    get CanPlaceSlot(): boolean {
        if (MidsContext.Config?.BuildMode === Enums.dmModes.Normal || MidsContext.Config?.BuildMode === Enums.dmModes.Respec) {
            const currentBuild = this.CurrentBuild;
            if (!currentBuild) {
                return false;
            }
            if (Build.TotalSlotsAvailable - currentBuild.SlotsPlaced > 0 && MidsContext.Config?.BuildOption !== Enums.dmItem.Power) {
                return true;
            }
        } else if ((this.Level > -1) && (this.Level < DatabaseAPI.Database.Levels.length) && DatabaseAPI.Database.Levels[this.Level].LevelType() === Enums.dmItem.Slot && this.SlotsRemaining > 0) {
            return true;
        } else if ((this.Level > -1) && (this.Level < DatabaseAPI.Database.Levels.length) && DatabaseAPI.Database.Levels[this.Level].LevelType() === Enums.dmItem.Power && this.SlotsRemaining > 0 && DatabaseAPI.ServerData.EnableInherentSlotting) {
            if (this.Level === DatabaseAPI.ServerData.HealthSlot1Level) {
                return true;
            }
            if (this.Level === DatabaseAPI.ServerData.HealthSlot2Level) {
                return true;
            }
            if (this.Level === DatabaseAPI.ServerData.StaminaSlot1Level) {
                return true;
            }
            if (this.Level === DatabaseAPI.ServerData.StaminaSlot2Level) {
                return true;
            }
        }
        return false;
    }

    get IsVillain(): boolean {
        return this.Alignment === Enums.Alignment.Rogue || this.Alignment === Enums.Alignment.Villain;
    }

    get IsPraetorian(): boolean {
        return this.Alignment === Enums.Alignment.Loyalist || this.Alignment === Enums.Alignment.Resistance;
    }

    get IsBlaster(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'blaster';
    }

    get IsController(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'controller';
    }

    get IsDefender(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'defender';
    }

    get IsScrapper(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'scrapper';
    }

    get IsTanker(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'tank';
    }

    get IsKheldian(): boolean {
        return this.Archetype?.ClassType === Enums.eClassType.HeroEpic;
    }

    get IsBrute(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'brute';
    }

    get IsCorruptor(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'corruptor';
    }

    get IsDominator(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'dominator';
    }

    get IsMastermind(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'mastermind';
    }

    get IsStalker(): boolean {
        return this.Archetype?.DisplayName.toLowerCase() === 'stalker';
    }

    get IsArachnos(): boolean {
        return this.Archetype?.ClassType === Enums.eClassType.VillainEpic;
    }

    // Methods
    ResetLevel(): void {
        this.LevelCache = -1;
    }

    SetLevelTo(level: number): void {
        this.LevelCache = level;
    }

    // Methods
    Reset(iArchetype: Archetype | null = null, iOrigin: number = 0): void {
        this.Name = '';
        const flag1 = this.Archetype !== null && iArchetype !== null && this.Archetype.Idx === iArchetype.Idx;
        const archetype = iArchetype || DatabaseAPI.Database.Classes[0];
        if (!archetype) {
            return; // Cannot proceed without archetype
        }
        this.Archetype = archetype;
        MidsContext.Archetype = archetype;
        this.Origin = iOrigin > archetype.Origin.length - 1 ? archetype.Origin.length - 1 : iOrigin;
        
        if (flag1) {
            const flag2 = this.Powersets[0] !== null && this.Powersets[0]?.nArchetype === archetype.Idx;
            if (!flag2) {
                const primarySets = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Primary);
                this.Powersets[0] = primarySets.length > 0 ? primarySets[0] : null;
            }
            const flag3 = this.Powersets[1] !== null && this.Powersets[1]?.nArchetype === archetype.Idx;
            if (!flag3) {
                const secondarySets = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Secondary);
                this.Powersets[1] = secondarySets.length > 0 ? secondarySets[0] : null;
            }
        } else {
            const primarySets = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Primary);
            this.Powersets[0] = primarySets.length > 0 ? primarySets[0] : null;
            const secondarySets = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Secondary);
            this.Powersets[1] = secondarySets.length > 0 ? secondarySets[0] : null;
        }

        const powersetIndexes1 = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Pool);
        let index = 0;
        this.Powersets[3] = powersetIndexes1.length > index ? powersetIndexes1[index] : null;
        if (powersetIndexes1.length - 1 > index) {
            index++;
        }
        this.Powersets[4] = powersetIndexes1.length > index ? powersetIndexes1[index] : null;
        if (powersetIndexes1.length - 1 > index) {
            index++;
        }
        this.Powersets[5] = powersetIndexes1.length > index ? powersetIndexes1[index] : null;
        if (powersetIndexes1.length - 1 > index) {
            index++;
        }
        this.Powersets[6] = powersetIndexes1.length > index ? powersetIndexes1[index] : null;
        const powersetIndexes2 = DatabaseAPI.GetPowersetIndexes(archetype, Enums.ePowerSetType.Ancillary);
        this.Powersets[7] = powersetIndexes2.length > 0 ? powersetIndexes2[0] : null;
        this.ModifyEffects = new Map<string, number>();
        this.PoolLocked = new Array(5).fill(false);
        this.NewBuild();
        this.Locked = false;
        this.LevelCache = -1;
    }

    protected NewBuild(): void {
        this.Builds[0] = new Build(this, DatabaseAPI.Database.Levels);
        this.AcceleratedActive = false;
        this.ActiveComboLevel = 0;
        this.DelayedActive = false;
        this.DisintegrateActive = false;
        this.TargetDroneActive = false;
        this.FastModeActive = false;
        this.Assassination = false;
        this.CriticalHits = false;
        this.Containment = false;
        this.Domination = false;
        this.Scourge = false;
        this.DefensiveAdaptation = false;
        this.EfficientAdaptation = false;
        this.OffensiveAdaptation = false;
        this.NotDefensiveAdaptation = true;
        this.NotDefensiveNorOffensiveAdaptation = true;
        this.PerfectionType = null;
        this.BoxingBuff = false;
        this.NotBoxingBuff = true;
        this.KickBuff = false;
        this.NotKickBuff = true;
        this.CrossPunchBuff = false;
        this.NotCrossPunchBuff = true;
        this.Supremacy = false;
        this.SupremacyAndBuffPwr = false;
        this.PetTier2 = false;
        this.PetTier3 = false;
        this.PackMentality = false;
        this.NotPackMentality = true;
        this.FastSnipe = false;
        this.NotFastSnipe = true;
        this.Totals.Init();
        this.TotalsCapped.Init();
        this.RequestedLevel = -1;
        this.PEnhancementsList = [];
    }

    Lock(): void {
        const currentBuild = this.CurrentBuild;
        if (!currentBuild) {
            return;
        }
        const powersPlaced = currentBuild.PowersPlaced;
        const ps1 = (this.Powersets[1] === null || this.Powersets[1].nID < 0)
            ? DatabaseAPI.Database.Powersets.find((ps): ps is NonNullable<typeof ps> =>
                ps !== null &&
                ps.ATClass === (MidsContext.Character?.Archetype?.ClassName || '') &&
                ps.SetType === Enums.ePowerSetType.Secondary) || null
            : this.Powersets[1];
        
        if ((powersPlaced === 1) && ps1 && ps1.Powers && ps1.Powers[0] && currentBuild.PowerUsed(ps1.Powers[0] as any)) {
            this.Locked = false;
            this.ResetLevel();
        } else if (powersPlaced > 0) {
            this.Locked = true;
        } else {
            if (powersPlaced !== 0) {
                return;
            }
            this.Locked = false;
            this.ResetLevel();
        }
    }

    IsHero(): boolean {
        return this.Alignment === Enums.Alignment.Hero || this.Alignment === Enums.Alignment.Vigilante;
    }

    PoolTaken(poolID: number): boolean {
        return this.Powersets[poolID] !== null && poolID >= 3 && poolID <= 7 && this.PoolLocked[poolID - 3];
    }

    LoadPowersetsByName2(names: string[], blameName: { value: string }): void {
        this.Powersets = new Array(8).fill(null);
        let m = 0;
        let k = 3;
        for (const e of names) {
            if (!e || e.trim() === '') continue;
            if (e.indexOf('Epic.') === 0 || e.toLowerCase().indexOf('epic.') === 0) {
                this.Powersets[7] = DatabaseAPI.GetPowersetByName(e);
                if (this.Powersets[7] === null) {
                    blameName.value = e;
                }
            } else if (e.indexOf('Pool.') === 0 || e.toLowerCase().indexOf('pool.') === 0) {
                this.Powersets[k] = DatabaseAPI.GetPowersetByName(e);
                if (this.Powersets[k] === null) {
                    blameName.value = e;
                }
                k++;
            } else {
                this.Powersets[m] = DatabaseAPI.GetPowersetByName(e);
                if (this.Powersets[m] === null) {
                    blameName.value = e;
                }
                m++;
            }
        }
    }

    LoadPowersetsByName(names: string[]): Array<[number, string]> {
        this.Powersets = names.map(n => {
            if (!n || n.trim() === '') {
                return null;
            } else {
                return DatabaseAPI.GetPowersetByName(n);
            }
        });
        return this.Powersets
            .map((ps, i) => ({ I: i, Ps: ps?.FullName, N: names[i] }))
            .filter(x => x.N && x.N.trim() !== '' && x.Ps === null)
            .map(x => [x.I, x.N] as [number, string]);
    }

    LoadPowerSetsByName(sets: string[]): void {
        this.Powersets = sets.map(set => 
            DatabaseAPI.Database.Powersets.find(ps => ps?.FullName === set) || null
        );
    }

    GetFirstAvailablePowerLevel(build: Build, iLevel: number = 0): number {
        if (!build) {
            return -1;
        }
        const maxIndex = Math.min(build.Powers.length, build.LastPower + 1);
        for (let index = 0; index < maxIndex; index++) {
            const power = build.Powers[index];
            if (power && power.NIDPowerset < 0 && power.Level >= iLevel) {
                return power.Level;
            }
        }
        return -1;
    }

    GetFirstAvailableSlotLevel(iLevel: number = 0): number {
        if (iLevel < 0) {
            iLevel = 0;
        }

        if (!this.CurrentBuild) {
            return -1;
        }

        for (let level = iLevel; level < DatabaseAPI.Database.Levels.length; level++) {
            const levelMap = DatabaseAPI.Database.Levels[level];
            if (levelMap.Slots > 0 && levelMap.Slots - this.CurrentBuild.SlotsPlacedAtLevel(level) > 0) {
                return level;
            }
        }

        return -1;
    }

    GetFirstAvailablePowerIndex(iLevel: number = 0): number {
        if (!this.CurrentBuild) {
            return -1;
        }
        for (var index = 0; index < Math.min(this.CurrentBuild.Powers.length, this.CurrentBuild.LastPower + 1); index++)
        {
            const power = this.CurrentBuild.Powers[index];
            if (
                power.NIDPowerset < 0 &&
                power.Level >= iLevel)
            {
                return index;
            }
        }
        return -1;
    }

    protected ReadMetadata(buildText: string): void {
        const tags = ['comment', 'enhobtained'];
        const metadata = MidsCharacterFileFormat.ReadMetadata(tags, buildText);

        for (const tag of tags) {
            if (!metadata.has(tag)) {
                continue;
            }

            switch (tag) {
                case 'comment':
                    this.Comment = metadata.get(tag) || '';
                    break;
                case 'enhobtained':
                    const obtainedSlots = metadata.get(tag) || '';
                    const n = obtainedSlots.length;
                    let k = 0;

                    if (this.CurrentBuild) {
                        for (let i = 0; i < this.CurrentBuild.Powers.length; i++) {
                            const power = this.CurrentBuild.Powers[i];
                            if (!power || !power.Power) {
                                continue;
                            }

                            for (let j = 0; j < power.Slots.length; j++) {
                                if (k < n) {
                                    const obtained = obtainedSlots[k] === '1';
                                    power.Slots[j].Enhancement.Obtained = obtained;
                                    power.Slots[j].FlippedEnhancement.Obtained = obtained;
                                    k++;
                                } else {
                                    power.Slots[j].Enhancement.Obtained = false;
                                    power.Slots[j].FlippedEnhancement.Obtained = false;
                                }
                            }
                        }
                    }
                    break;
            }
        }
    }

    Validate(): void {
        this.CheckAncillaryPowerSet();
        this.CurrentBuild?.Validate();
        this.RefreshActiveSpecial();
    }

    protected CheckAncillaryPowerSet(): void {
        const powersetIndexes = DatabaseAPI.GetPowersetIndexes(this.Archetype, Enums.ePowerSetType.Ancillary);
        if (powersetIndexes.length === 0) {
            this.Powersets[7] = null;
        } else if (this.Powersets[7] === null) {
            this.Powersets[7] = powersetIndexes[0];
        } else {
            let flag = false;
            for (const p of powersetIndexes) {
                if (p && this.Powersets[7] && this.Powersets[7].nID === p.nID) {
                    flag = true;
                    break;
                }
            }

            if (!flag && powersetIndexes.length > 0 && powersetIndexes[0]) {
                this.Powersets[7] = powersetIndexes[0];
            }
        }
    }

    protected PowersetMutexClash(nIDPower: number): boolean {
        const power = DatabaseAPI.Database.Power[nIDPower];
        if (!power) {
            return false;
        }

        const powerSetId = power.PowerSetID;
        const powerset = DatabaseAPI.Database.Powersets[powerSetId];
        if (!powerset) {
            return false;
        }

        let powersetType: number;
        switch (powerset.SetType) {
            case Enums.ePowerSetType.Primary:
                powersetType = 1; // Secondary
                break;
            case Enums.ePowerSetType.Secondary:
                powersetType = 0; // Primary
                break;
            case Enums.ePowerSetType.Ancillary:
                powersetType = 7; // Ancillary
                break;
            default:
                return false;
        }

        const psID = this.Powersets[powersetType] === null ? -1 : (this.Powersets[powersetType]?.nID ?? -1);

        if (powerset.nIDMutexSets.includes(psID)) {
            return true;
        }

        const powersetAtType = this.Powersets[powersetType];
        if (powersetAtType === null) {
            return false;
        }

        return powersetAtType.nIDMutexSets.includes(powerset.nID);
    }

    async ClearInvalidInherentSlots(): Promise<void> {
        this.ResetLevel();
        if (!this.CurrentBuild || !this.CurrentBuild.Powers) {
            return;
        }
        
        for (const power of this.CurrentBuild.Powers) {
            if (!power || !power.Power) {
                continue;
            }
            
            switch (power.Power.FullName) {
                case 'Inherent.Fitness.Health':
                    if (this.Level < DatabaseAPI.ServerData.HealthSlot1Level) {
                        if (power.InherentSlotsUsed > 0) {
                            for (let i = 0; i < power.Slots.length; i++) {
                                const slot = power.Slots[i];
                                if (!slot.IsInherent) continue;
                                power.RemoveSlot(i);
                                power.InherentSlotsUsed -= 1;
                                break;
                            }
                        }
                    }
                    if (this.Level < DatabaseAPI.ServerData.HealthSlot2Level) {
                        if (power.InherentSlotsUsed > 0) {
                            for (let i = 0; i < power.Slots.length; i++) {
                                const slot = power.Slots[i];
                                if (!slot.IsInherent) continue;
                                power.RemoveSlot(i);
                                power.InherentSlotsUsed -= 1;
                                break;
                            }
                        }
                    }
                    break;
                case 'Inherent.Fitness.Stamina':
                    if (this.Level < DatabaseAPI.ServerData.StaminaSlot1Level) {
                        if (power.InherentSlotsUsed > 0) {
                            for (let i = 0; i < power.Slots.length; i++) {
                                const slot = power.Slots[i];
                                if (!slot.IsInherent) continue;
                                power.RemoveSlot(i);
                                power.InherentSlotsUsed -= 1;
                                break;
                            }
                        }
                    }
                    if (this.Level < DatabaseAPI.ServerData.StaminaSlot2Level) {
                        if (power.InherentSlotsUsed > 0) {
                            for (let i = 0; i < power.Slots.length; i++) {
                                const slot = power.Slots[i];
                                if (!slot.IsInherent) continue;
                                power.RemoveSlot(i);
                                power.InherentSlotsUsed -= 1;
                                break;
                            }
                        }
                    }
                    break;
            }
        }
    }

    private RefreshActiveSpecial(): void {
        this.ActiveComboLevel = 0;
        this.AcceleratedActive = false;
        this.DelayedActive = false;
        this.DisintegrateActive = false;
        this.TargetDroneActive = false;
        this.FastModeActive = false;
        this.Assassination = false;
        this.Domination = false;
        this.Containment = false;
        this.Scourge = false;
        this.CriticalHits = false;
        this.Defiance = false;
        this.DefensiveAdaptation = false;
        this.EfficientAdaptation = false;
        this.OffensiveAdaptation = false;
        this.NotDefensiveAdaptation = true;
        this.NotDefensiveNorOffensiveAdaptation = true;
        this.PerfectionType = null;
        this.BoxingBuff = false;
        this.NotBoxingBuff = true;
        this.KickBuff = false;
        this.NotKickBuff = true;
        this.CrossPunchBuff = false;
        this.NotCrossPunchBuff = true;
        this.Supremacy = false;
        this.SupremacyAndBuffPwr = false;
        this.PetTier2 = false;
        this.PetTier3 = false;
        this.PackMentality = false;
        this.NotPackMentality = true;
        this.FastSnipe = false;
        this.NotFastSnipe = true;
        this.InherentDisplayList = [];
        this.PEnhancementsList = [];
        
        if (!this.CurrentBuild?.Powers) {
            return;
        }

        for (const power of this.CurrentBuild.Powers) {
            if (!power?.Power) continue;
            const powName = power.Power.PowerName;
            
            if (power.HasProc()) {
                power.Power.HasProcSlotted = true;
            } else if (!power.HasProc()) {
                power.Power.HasProcSlotted = false;
            }

            if (power.Chosen || (!power.Chosen && this.CurrentBuild.PowerUsed(power.Power))) {
                power.Power.Taken = true;
            }

            power.Power.Active = power.StatInclude;

            for (let slotIndex = 0; slotIndex < power.SlotCount; slotIndex++) {
                const pSlotEnh = power.Slots[slotIndex].Enhancement.Enh;
                if (pSlotEnh === -1) continue;
                const enhancement = DatabaseAPI.Database.Enhancements[pSlotEnh];
                if (!this.PEnhancementsList.includes(enhancement.UID)) {
                    this.PEnhancementsList.push(enhancement.UID);
                }
            }

            if (power.Power.HasAttribModEffects()) {
                for (const effect of power.Power.Effects) {
                    effect.UpdateAttrib();
                }
            }
        }

        for (const power of this.CurrentBuild.Powers) {
            if (!power?.Power || !power.StatInclude) continue;

            switch (power.Power.PowerName.toUpperCase()) {
                case 'TIME_CRAWL':
                    this.DelayedActive = true;
                    break;
                case 'TARGETING_DRONE':
                    this.TargetDroneActive = true;
                    break;
                case 'TEMPORAL_SELECTION':
                    this.AcceleratedActive = true;
                    break;
                case 'DISINTEGRATE':
                    this.DisintegrateActive = true;
                    break;
                case 'COMBO_LEVEL_1':
                    this.ActiveComboLevel = 1;
                    break;
                case 'COMBO_LEVEL_2':
                    this.ActiveComboLevel = 2;
                    break;
                case 'COMBO_LEVEL_3':
                    this.ActiveComboLevel = 3;
                    break;
                case 'FAST_MODE':
                    this.FastModeActive = true;
                    break;
                case 'DEFIANCE':
                    this.Defiance = true;
                    break;
                case 'DOMINATION':
                    this.Domination = true;
                    break;
                case 'CONTAINMENT':
                    this.Containment = true;
                    break;
                case 'SCOURGE':
                    this.Scourge = true;
                    break;
                case 'CRITICAL_HIT':
                    this.CriticalHits = true;
                    break;
                case 'ASSASSINATION':
                    this.Assassination = true;
                    break;
                case 'DEFENSIVE_ADAPTATION':
                    this.DefensiveAdaptation = true;
                    this.NotDefensiveAdaptation = false;
                    this.NotDefensiveNorOffensiveAdaptation = false;
                    break;
                case 'EFFICIENT_ADAPTATION':
                    this.EfficientAdaptation = true;
                    break;
                case 'OFFENSIVE_ADAPTATION':
                    this.OffensiveAdaptation = true;
                    this.NotDefensiveNorOffensiveAdaptation = false;
                    break;
                case 'PERFECTION_OF_BODY':
                    this.PerfectionType = 'body';
                    break;
                case 'PERFECTION_OF_MIND':
                    this.PerfectionType = 'mind';
                    break;
                case 'PERFECTION_OF_SOUL':
                    this.PerfectionType = 'soul';
                    break;
                case 'BOXING':
                    this.BoxingBuff = true;
                    this.NotBoxingBuff = false;
                    break;
                case 'KICK':
                    this.KickBuff = true;
                    this.NotKickBuff = false;
                    break;
                case 'CROSS_PUNCH':
                    this.CrossPunchBuff = true;
                    this.NotCrossPunchBuff = false;
                    break;
                case 'SUPREMACY':
                    this.Supremacy = true;
                    break;
                case 'SUPREMACY_AND_BUFF_PWR':
                    this.SupremacyAndBuffPwr = true;
                    break;
                case 'PET_TIER_2':
                    this.PetTier2 = true;
                    break;
                case 'PET_TIER_3':
                    this.PetTier3 = true;
                    break;
                case 'PACK_MENTALITY':
                    this.PackMentality = true;
                    this.NotPackMentality = false;
                    break;
                case 'FAST_SNIPE':
                    this.FastSnipe = true;
                    this.NotFastSnipe = false;
                    break;
                case 'EQUIP_MERCENARY':
                    this.PetTier2 = true;
                    break;
                case 'TACTICAL_UPGRADE':
                    this.PetTier3 = true;
                    break;
                case 'ENCHANT_UNDEAD':
                    this.PetTier2 = true;
                    break;
                case 'DARK_EMPOWERMENT':
                    this.PetTier3 = true;
                    break;
                case 'TRAIN_NINJAS':
                    this.PetTier2 = true;
                    break;
                case 'KUJI_IN_ZEN':
                    this.PetTier3 = true;
                    break;
                case 'EQUIP_ROBOT':
                    this.PetTier2 = true;
                    break;
                case 'UPGRADE_ROBOT':
                    this.PetTier3 = true;
                    break;
                case 'EQUIP_THUGS':
                    this.PetTier2 = true;
                    break;
                case 'UPGRADE_EQUIPMENT':
                    this.PetTier3 = true;
                    break;
            }
        }

        // Build inherent display list
        if (this.CurrentBuild) {
            const currentBuild = this.CurrentBuild;
            const inherentPowersList = currentBuild.Powers
                .filter((p): p is NonNullable<typeof p> => p !== null && !p.Chosen && p.Power !== null && currentBuild.PowerUsed(p.Power))
                .map(p => p.Power)
                .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);

            for (const inherent of inherentPowersList) {
                if (inherent.InherentType === Enums.eGridType.None) {
                    continue;
                }

                // Convert InherentType to priority (simplified - may need enum mapping)
                const priority = inherent.InherentType as number; // This should use proper enum parsing
                this.InherentDisplayList.push(new InherentDisplayItem(priority, inherent));
            }

            // Sort by priority
            this.InherentDisplayList.sort((a, b) => a.Priority - b.Priority);
        }

        // Set display locations for powers
        if (this.CurrentBuild) {
            const currentBuild = this.CurrentBuild;
            for (const power of currentBuild.Powers) {
                if (!power?.Power) continue;

                switch (power.Power.PowerName.toUpperCase()) {
                    case 'BOXING':
                        this.BoxingBuff = true;
                        this.NotBoxingBuff = false;
                        break;
                    case 'KICK':
                        this.KickBuff = true;
                        this.NotKickBuff = false;
                        break;
                    case 'CROSS_PUNCH':
                        this.CrossPunchBuff = true;
                        this.NotCrossPunchBuff = false;
                        break;
                }

                if (power.Chosen || !currentBuild.PowerUsed(power.Power)) continue;
                const displayItem = this.InherentDisplayList?.find(x => x.Power.FullName === power.Power?.FullName);
                if (displayItem && power.Power) {
                    power.Power.DisplayLocation = this.InherentDisplayList?.indexOf(displayItem) ?? -1;
                }
            }
        }
    }

    // Private helper methods
    private PoolGetAvailable(iPool: number): number[] {
        const powersetIndexes = DatabaseAPI.GetPowersetIndexes(this.Archetype, Enums.ePowerSetType.Pool);
        const intList: number[] = [];
        for (const powersetIndex of powersetIndexes) {
            if (!powersetIndex) continue;
            let available = false;
            for (let index2 = 3; index2 <= 6; ++index2) {
                if (index2 === iPool || !(this.PoolLocked[index2 - 3] && powersetIndex.nID === (this.Powersets[index2]?.nID ?? -1))) {
                    available = true;
                }
            }
            if (available) {
                intList.push(powersetIndex.nID);
            }
        }
        return intList;
    }

    PoolToComboID(iPool: number, index: number): number {
        const available = this.PoolGetAvailable(iPool);
        let num1 = -1;
        for (const num2 of available) {
            ++num1;
            if (num2 === index) {
                return num1;
            }
        }
        return 0;
    }

    static PopEnhInfo(iSlot: I9Slot, iLevel: number = -1, powerEntry?: PowerEntry): PopupData {
        const popupData1 = new PopupData();
        let index1: number | null = popupData1.Add();
        if (index1 === null || index1 < 0 || index1 >= popupData1.Sections.length) return popupData1;
        const section1 = popupData1.Sections[index1];
        if (!section1) return popupData1;
        
        if (iSlot.Enh < 0) {
            section1.Add("Empty Slot", PopUp.Colors.Disabled, 1.25);
            if (iLevel > -1) {
                section1.Add(`Slot placed at level: ${iLevel + 1}`, PopUp.Colors.Text);
                if (powerEntry) {
                    const slot = powerEntry.Slots.find(x => x.Enhancement === iSlot);
                    if (slot?.IsInherent) {
                        section1.Add("This slot is an Inherent slot.", PopUp.Colors.Text);
                    }
                }
            }

            const index2 = popupData1.Add();
            if (index2 !== null && index2 >= 0 && index2 < popupData1.Sections.length) {
                const section2 = popupData1.Sections[index2];
                if (section2) {
                    section2.Add("Right-Click to place an enhancement.", PopUp.Colors.Disabled, 1, 'Bold');
                    section2.Add("Shift-Click to move this slot.", PopUp.Colors.Disabled, 1, 'Bold');
                }
            }
            
            return popupData1;
        }

        const enhancement = DatabaseAPI.Database.Enhancements[iSlot.Enh];
        switch (enhancement.TypeID) {
            case Enums.eType.Normal:
            case Enums.eType.SpecialO:
                section1.Add(enhancement.Name, PopUp.Colors.Title, 1.25);
                break;
            case Enums.eType.InventO:
                section1.Add(`Invention: ${enhancement.Name}`, PopUp.Colors.Title, 1.25);
                break;
            case Enums.eType.SetO:
                let iColor = PopUp.Colors.Title;
                if (enhancement.RecipeIDX > -1) {
                    iColor = DatabaseAPI.Database.Recipes[enhancement.RecipeIDX].Rarity === RecipeRarity.Uncommon ? PopUp.Colors.Uncommon :
                             DatabaseAPI.Database.Recipes[enhancement.RecipeIDX].Rarity === RecipeRarity.Rare ? PopUp.Colors.Rare :
                             DatabaseAPI.Database.Recipes[enhancement.RecipeIDX].Rarity === RecipeRarity.UltraRare ? PopUp.Colors.UltraRare :
                             iColor;
                }
                section1.Add(`${DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet].DisplayName}: ${enhancement.Name}`, iColor, 1.25);
                break;
        }

        switch (enhancement.TypeID) {
            case Enums.eType.Normal:
                section1.Add(iSlot.GetEnhancementString(), '#00FF00');
                break;
            case Enums.eType.InventO:
                section1.Add(`Invention Level: ${iSlot.IOLevel + 1}${iSlot.GetRelativeString(false)} - ${iSlot.GetEnhancementString()}`, PopUp.Colors.Invention);
                break;
            case Enums.eType.SpecialO:
                section1.Add(iSlot.GetEnhancementString(), '#FFFF00');
                break;
            case Enums.eType.SetO:
                if (!DatabaseAPI.EnhIsNaturallyAttuned(iSlot.Enh)) {
                    section1.Add(`Invention Level: ${iSlot.IOLevel + 1}${iSlot.GetRelativeString(false)}`, PopUp.Colors.Invention);
                }
                break;
        }

        if (iLevel > -1) {
            section1.Add(`Slot placed at level: ${iLevel + 1}`, PopUp.Colors.Text);
        }

        if (enhancement.Unique) {
            const uniqueIndex = popupData1.Add();
            if (uniqueIndex !== null && uniqueIndex >= 0 && uniqueIndex < popupData1.Sections.length) {
                const uniqueSection = popupData1.Sections[uniqueIndex];
                if (uniqueSection) {
                    uniqueSection.Add("This enhancement is Unique. No more than one enhancement of this type can be slotted by a character.", PopUp.Colors.Text, 0.9);
                }
            }
        }

        switch (enhancement.TypeID) {
            case Enums.eType.Normal:
            case Enums.eType.InventO:
                if (enhancement.Desc && enhancement.Desc.trim() !== '') {
                    section1.Add(enhancement.Desc, PopUp.Colors.Title);
                    break;
                }

                const index2 = popupData1.Add();
                const section2 = popupData1.Sections[index2];
                if (section2) {
                    const strArray1 = Character.BreakByNewLine(iSlot.GetEnhancementStringLong());
                    for (const s of strArray1) {
                        const strArray2 = Character.BreakByBracket(s);
                        (section2.Add as any)(strArray2[0], '#00FF00', strArray2[1], '#00FF00', 0.9, 'Bold', 0);
                    }
                }
                break;
            case Enums.eType.SpecialO:
            case Enums.eType.SetO:
                if (enhancement.Desc && enhancement.Desc.trim() !== '') {
                    section1.Add(enhancement.Desc, PopUp.Colors.Title);
                }

                const index4 = popupData1.Add();
                const section4 = popupData1.Sections[index4];
                if (section4) {
                    let enhStringLong = iSlot.GetEnhancementStringLong();
                    if (enhancement.UID.includes("Assassins_Mark")) {
                        enhStringLong = enhStringLong.replace(/(([\s]*)([0-9\.\%]+) RechargePower([0-9a-zA-Z\%\.\(\) ]+)[\r\n]*)+/g, "\r\n$2RechargePower(Stalker's Build Ups)\r\n");
                    }
                    const strArray3 = Character.BreakByNewLine(enhStringLong);

                    for (const s of strArray3) {
                        const strArray2 = !enhancement.HasPowerEffect
                            ? Character.BreakByBracket(s)
                            : [s, ''];
                        (section4.Add as any)(strArray2[0], '#00FF00', strArray2[1], '#00FF00', 0.9, 'Bold', 0);
                    }
                }
                break;
        }

        if (!MidsContext.Config?.PopupRecipes) {
            if (enhancement.TypeID !== Enums.eType.SetO) {
                return popupData1;
            }

            const index3 = popupData1.Add();
            if (index3 !== null && index3 >= 0 && index3 < popupData1.Sections.length) {
                const section3 = popupData1.Sections[index3];
                if (section3) {
                    const setType = DatabaseAPI.GetSetTypeByIndex(DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet].SetType);
                    if (setType) {
                        section3.Add(`Set Type: ${setType.Name}`, PopUp.Colors.Invention);
                    }
                    const levelMin = DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet].LevelMin + 1;
                    const levelMax = DatabaseAPI.Database.EnhancementSets[enhancement.nIDSet].LevelMax + 1;
                    section3.Add(
                        levelMin === levelMax
                            ? `Set Level: ${levelMin}`
                            : `Set Level Range: ${levelMin} to ${levelMax}`,
                        PopUp.Colors.Text);
                }
            }
            popupData1.Add(Character.PopSetEnhList(enhancement.nIDSet, powerEntry));
            popupData1.Add(Character.PopSetBonusListing(enhancement.nIDSet, powerEntry));
        } else if (enhancement.TypeID === Enums.eType.SetO || enhancement.TypeID === Enums.eType.InventO) {
            popupData1.Add(Character.PopRecipeInfo(enhancement.RecipeIDX, iSlot.IOLevel, iSlot.RelativeLevel));
        }

        return popupData1;
    }

    SlotCheck(powerEntry: PowerEntry): number {
        if (!powerEntry || !powerEntry.Power || !this.CanPlaceSlot || powerEntry.SlotCount > 5) {
            return -1;
          }
      
          if (powerEntry.NIDPower < 0 || powerEntry.NIDPower >= DatabaseAPI.Database.Power.length) {
            return -1;
          }
      
          const power = DatabaseAPI.Database.Power[powerEntry.NIDPower];
          if (!power || !power.Slottable) {
            return -1;
          }
      
          let iLevel = powerEntry.Level;
          if (power.AllowFrontLoading) {
            iLevel = 0;
          }
      
          const firstAvailable = this.GetFirstAvailableSlotLevel(iLevel);
          return firstAvailable;
    }

    GetSlotCounts(): number[] {
        const numArray = new Array(2).fill(0);
        for (let level = 0; level < DatabaseAPI.Database.Levels.length; ++level) {
            if (DatabaseAPI.Database.Levels[level].Slots <= 0) {
                continue;
            }
            const num = this.CurrentBuild?.SlotsPlacedAtLevel(level) ?? 0;
            numArray[0] += DatabaseAPI.Database.Levels[level].Slots - num;
            numArray[1] += num;
        }
        return numArray;
    }

    private static BreakByNewLine(iString: string): string[] {
        return iString.replace(/\n/g, '^').split('^');
    }

    private static BreakByBracket(iString: string): [string, string] {
        const strArray1: [string, string] = [iString, ''];
        const length = iString.indexOf(" (");
        if (length < 0) {
            return strArray1;
        }
        strArray1[0] = iString.substring(0, length) + ":";
        if (iString.length - (length + 1) > 0) {
            strArray1[1] = iString.substring(length + 1).replace(/\(/g, '').replace(/\)/g, '');
        }
        return strArray1;
    }

    private static PopSetBonusListing(sIdx: number, power?: PowerEntry): Section {
        const section1 = new Section();
        section1.Add("Set Bonus:", PopUp.Colors.Title);
        let num = 0;
        if (power) {
            for (let index = 0; index < power.Slots.length; index++) {
                if (power.Slots[index].Enhancement.Enh > -1 &&
                    DatabaseAPI.Database.Enhancements[power.Slots[index].Enhancement.Enh].nIDSet === sIdx) {
                    ++num;
                }
            }
        }

        if (sIdx < 0 || sIdx > DatabaseAPI.Database.EnhancementSets.length - 1) {
            return section1;
        }

        const enhancementSet = DatabaseAPI.Database.EnhancementSets[sIdx];
        for (let index = 0; index < enhancementSet.Bonus.length; index++) {
            const effectString = enhancementSet.GetEffectString(index, false, true, true, true);
            if (!effectString || effectString.trim() === '') {
                continue;
            }

            let displayString = effectString;
            if (enhancementSet.Bonus[index].PvMode === Enums.ePvX.PvP) {
                displayString += " [PvP]";
            }

            const meetsRequirement = num >= enhancementSet.Bonus[index].Slotted && 
                (enhancementSet.Bonus[index].PvMode === Enums.ePvX.PvE && !MidsContext.Config?.Inc.DisablePvE ||
                 enhancementSet.Bonus[index].PvMode === Enums.ePvX.PvP && MidsContext.Config?.Inc.DisablePvE ||
                 enhancementSet.Bonus[index].PvMode === Enums.ePvX.Any);

            if (meetsRequirement) {
                section1.Add(`(${enhancementSet.Bonus[index].Slotted}) ${displayString}`, PopUp.Colors.Effect, 0.9);
            } else if (!power) {
                section1.Add(`(${enhancementSet.Bonus[index].Slotted}) ${displayString}`, PopUp.Colors.Effect, 0.9);
            } else {
                section1.Add(`(${enhancementSet.Bonus[index].Slotted}) ${displayString}`, PopUp.Colors.Disabled, 0.9);
            }
        }

        for (let index = 0; index < enhancementSet.SpecialBonus.length; index++) {
            let checkStatus = false;
            let specialPowers: any[] | null = null;
            if (enhancementSet.SpecialBonus.length > 0) {
                specialPowers = enhancementSet.SpecialBonus[enhancementSet.SpecialBonus.length - 1].Index.length === 0
                    ? enhancementSet.GetEnhancementSetLinkedPowers(enhancementSet.SpecialBonus.length - 2, true)
                    : enhancementSet.GetEnhancementSetLinkedPowers(enhancementSet.SpecialBonus.length - 1, true);
            }

            if (specialPowers && specialPowers.length === 1) {
                if (specialPowers[0].FullName.includes("Skin") || specialPowers[0].FullName.includes("Aegis")) {
                    checkStatus = true;
                }
            }

            const effectString = enhancementSet.GetEffectString(index, true, true, true, true, checkStatus);
            if (!effectString || effectString.trim() === '') {
                continue;
            }

            let flag = false;
            if (power) {
                for (const slot of power.Slots) {
                    if (slot.Enhancement.Enh > -1 && enhancementSet.SpecialBonus[index].Special > -1 && 
                        slot.Enhancement.Enh === enhancementSet.Enhancements[enhancementSet.SpecialBonus[index].Special]) {
                        flag = true;
                    }
                }
            }

            if (flag) {
                section1.Add(`(Enh) ${effectString}`, PopUp.Colors.Effect, 0.9);
            } else if (!power) {
                section1.Add(`(Enh) ${effectString}`, PopUp.Colors.Effect, 0.9);
            } else {
                section1.Add(`(Enh) ${effectString}`, PopUp.Colors.Disabled, 0.9);
            }
        }

        return section1;
    }

    private static GetSalvageCostOuter(costList: Map<Enums.RewardCurrency, number>, s: any, amount: number): void {
        const sCost = clsRewardCurrency.GetSalvageCost(s, MidsContext.Config?.PreferredCurrency ?? Enums.RewardCurrency.Influence, amount);
        if (sCost !== null && sCost !== undefined) {
            const currency = MidsContext.Config?.PreferredCurrency ?? Enums.RewardCurrency.Influence;
            costList.set(currency, (costList.get(currency) ?? 0) + sCost);
        } else {
            const sCost2 = clsRewardCurrency.GetSalvageCost(s, Enums.RewardCurrency.RewardMerit, amount);
            if (sCost2 !== null && sCost2 !== undefined) {
                costList.set(Enums.RewardCurrency.RewardMerit, (costList.get(Enums.RewardCurrency.RewardMerit) ?? 0) + sCost2);
            }
        }
    }

    static PopRecipeInfo(rIdx: number, iLevel: number, relLevel: Enums.eEnhRelative = Enums.eEnhRelative.Even): Section {
        const section1 = new Section();
        if (rIdx < 0) return section1;

        const recipe = DatabaseAPI.Database.Recipes[rIdx];
        let index1 = -1;
        let lvlUbound = 52;
        let lvlLbound = 0;
        for (let index2 = 0; index2 < recipe.Item.length; index2++) {
            if (recipe.Item[index2].Level > lvlLbound) {
                lvlLbound = recipe.Item[index2].Level;
            }
            if (recipe.Item[index2].Level < lvlUbound) {
                lvlUbound = recipe.Item[index2].Level;
            }
            if (recipe.Item[index2].Level !== iLevel) {
                continue;
            }
            index1 = index2;
            break;
        }

        if (index1 < 0) {
            iLevel = Enhancement.GranularLevelZb(iLevel, 0, 49);
            for (let index2 = 0; index2 < recipe.Item.length; index2++) {
                if (recipe.Item[index2].Level !== iLevel) {
                    continue;
                }
                index1 = index2;
                break;
            }
        }

        if (index1 < 0) return section1;

        const recipeEntry = recipe.Item[index1];
        if (recipe.EnhIdx > -1 && !recipe.IsGeneric && !recipe.InternalName.startsWith("G_")) {
            section1.Add(`Recipe - ${DatabaseAPI.Database.Enhancements[recipe.EnhIdx].LongName}`, PopUp.Colors.Title);
        } else {
            section1.Add("Materials:", PopUp.Colors.Title);
        }

        if (recipeEntry.BuyCost > 0) {
            (section1.Add as any)("Buy Cost:", PopUp.Colors.Invention, `${recipeEntry.BuyCost.toLocaleString()}`, PopUp.Colors.Invention, 0.9, 'Bold', 0);
        }
        if (recipeEntry.CraftCost > 0) {
            (section1.Add as any)("Craft Cost:", PopUp.Colors.Invention, `${recipeEntry.CraftCost.toLocaleString()}`, PopUp.Colors.Invention, 0.9, 'Bold', 0);
        }
        if (recipeEntry.CraftCostM > 0) {
            (section1.Add as any)("Craft Cost (Memorized):", PopUp.Colors.Effect, `${recipeEntry.CraftCostM.toLocaleString()}`, PopUp.Colors.Effect, 0.9, 'Bold', 0);
        }

        const subRecipesCost = new Map<Enums.RewardCurrency, number>();
        for (const currency of Object.values(Enums.RewardCurrency)) {
            if (typeof currency === 'number') {
                subRecipesCost.set(currency, 0);
            }
        }

        for (let index2 = 0;
            index2 < recipeEntry.Salvage.length &&
            (index2 === 0 || recipeEntry.SalvageIdx[index2] !== recipeEntry.SalvageIdx[0]);
            index2++) {
            if (recipeEntry.SalvageIdx[index2] < 0) continue;

            const salvage = DatabaseAPI.Database.Salvage[recipeEntry.SalvageIdx[index2]];
            if (!salvage) continue;
            
            const iColor = salvage.Rarity === RecipeRarity.Uncommon ? PopUp.Colors.Uncommon :
                          salvage.Rarity === RecipeRarity.Rare ? PopUp.Colors.Rare :
                          salvage.Rarity === RecipeRarity.UltraRare ? PopUp.Colors.UltraRare :
                          PopUp.Colors.Common;

            if (recipeEntry.Count[index2] <= 0) continue;

            (section1.Add as any)(salvage.ExternalName,
                iColor, recipeEntry.Count[index2].toString(), PopUp.Colors.Title,
                0.9, 'Bold', 0);
            Character.GetSalvageCostOuter(subRecipesCost, DatabaseAPI.Database.Salvage[recipeEntry.SalvageIdx[index2]],
                recipeEntry.Count[index2]);
        }

        const numBoosters = relLevel === Enums.eEnhRelative.PlusOne ? 1 :
                           relLevel === Enums.eEnhRelative.PlusTwo ? 2 :
                           relLevel === Enums.eEnhRelative.PlusThree ? 3 :
                           relLevel === Enums.eEnhRelative.PlusFour ? 4 :
                           relLevel === Enums.eEnhRelative.PlusFive ? 5 :
                           0;

        if (numBoosters > 0) {
            (section1.Add as any)("Enhancement Booster",
                PopUp.Colors.Rare, numBoosters.toString(), PopUp.Colors.Title,
                0.9, 'Bold', 0);
            const boosterSalvage = DatabaseAPI.Database.Salvage.find(s => s.ExternalName === "Enhancement Booster");
            if (boosterSalvage) {
                Character.GetSalvageCostOuter(subRecipesCost, boosterSalvage, numBoosters);
            }
        }

        let subCostTotal = 0;
        for (const value of subRecipesCost.values()) {
            subCostTotal += value;
        }
        if (subRecipesCost.size > 0 && subCostTotal > 0) {
            section1.Add("", PopUp.Colors.Title);
            section1.Add("Salvage detailed cost:", PopUp.Colors.Title);
            for (const c of subRecipesCost) {
                if (c[1] <= 0) continue;
                const cAmt = c[0] === Enums.RewardCurrency.Influence
                    ? `${c[1].toLocaleString()}`
                    : `${c[1]}`;
                (section1.Add as any)(clsRewardCurrency.GetCurrencyName(c[0], c[1]),
                    clsRewardCurrency.GetCurrencyRarityColor(c[0]), cAmt, PopUp.Colors.Title,
                    0.9, 'Bold', 0);
            }
        }

        return section1;
    }

    static PopSetInfo(sIdx: number, powerEntry?: PowerEntry): PopupData {
        if (sIdx < 0) {
            return new PopupData();
        }
        
        const enhancementSet = DatabaseAPI.Database.EnhancementSets[sIdx];
        let iColor = PopUp.Colors.Uncommon;
        for (let index = 0; index < enhancementSet.Enhancements.length; index++) {
            const enhancement = DatabaseAPI.Database.Enhancements[enhancementSet.Enhancements[index]];
            if (enhancement.RecipeIDX <= -1) {
                continue;
            }

            iColor = DatabaseAPI.Database.Recipes[enhancement.RecipeIDX].Rarity === RecipeRarity.Rare ? PopUp.Colors.Rare :
                     DatabaseAPI.Database.Recipes[enhancement.RecipeIDX].Rarity === RecipeRarity.UltraRare ? PopUp.Colors.UltraRare :
                     iColor;

            if (index > 2) {
                break;
            }
        }

        const popupData1 = new PopupData();
        const index1 = popupData1.Add();
        if (index1 < 0 || index1 >= popupData1.Sections.length) return popupData1;
        const section1 = popupData1.Sections[index1];
        if (!section1) return popupData1;
        
        section1.Add(enhancementSet.DisplayName, iColor, 1.25);
        const setType = DatabaseAPI.GetSetTypeByIndex(enhancementSet.SetType);
        if (setType) {
            section1.Add(`Set Type: ${setType.Name}`, PopUp.Colors.Invention);
        }
        const lvlRange = enhancementSet.LevelMin !== enhancementSet.LevelMax 
            ? `${enhancementSet.LevelMin + 1} to ${enhancementSet.LevelMax + 1}` 
            : `${enhancementSet.LevelMin + 1}`;

        section1.Add(`Level Range: ${lvlRange}`, PopUp.Colors.Text);
        popupData1.Add(Character.PopSetEnhList(sIdx, powerEntry));
        popupData1.Add(Character.PopSetBonusListing(sIdx, powerEntry));
        
        return popupData1;
    }

    private static PopSetEnhList(sIdx: number, powerEntry?: PowerEntry): Section {
        if (sIdx < 0 || sIdx >= DatabaseAPI.Database.EnhancementSets.length) {
            return new Section();
        }

        let enhUsedInSet = 0;
        const enhancementSet = DatabaseAPI.Database.EnhancementSets[sIdx];
        const setEnhUsed: number[] = [];
        const setEnhObtained: number[] = [];

        if (powerEntry) {
            for (const slot of powerEntry.Slots) {
                if (slot.Enhancement.Enh < 0 || DatabaseAPI.Database.Enhancements[slot.Enhancement.Enh].nIDSet !== sIdx) {
                    continue;
                }

                enhUsedInSet++;
                for (let index = 0; index < enhancementSet.Enhancements.length; index++) {
                    if (slot.Enhancement.Enh !== enhancementSet.Enhancements[index]) {
                        continue;
                    }

                    setEnhUsed.push(index);
                    if (slot.Enhancement.Obtained) {
                        setEnhObtained.push(index);
                    }
                }
            }
        }

        const section1 = new Section();
        if (powerEntry) {
            section1.Add(`Set: ${enhancementSet.DisplayName} (${enhUsedInSet}/${enhancementSet.Enhancements.length})`, PopUp.Colors.Title);
        }

        // [index in set => enhancement nID]
        const setEnhancements = new Map<number, number>();
        for (let i = 0; i < enhancementSet.Enhancements.length; i++) {
            setEnhancements.set(i, enhancementSet.Enhancements[i]);
        }

        // Sort by UID
        const sortedEntries = Array.from(setEnhancements.entries()).sort((a, b) => {
            const uidA = a[1] < 0 ? "" : DatabaseAPI.Database.Enhancements[a[1]].UID;
            const uidB = b[1] < 0 ? "" : DatabaseAPI.Database.Enhancements[b[1]].UID;
            return uidA.localeCompare(uidB);
        });

        for (const enhEntry of sortedEntries) {
            const enhUsed = setEnhUsed.includes(enhEntry[0]) || !powerEntry;
            const color = !MidsContext.EnhCheckMode && enhUsed ? PopUp.Colors.Invention :
                         MidsContext.EnhCheckMode && enhUsed && setEnhObtained.includes(enhEntry[0]) ? PopUp.Colors.Invention :
                         MidsContext.EnhCheckMode && enhUsed ? PopUp.Colors.UltraRare :
                         PopUp.Colors.Disabled;

            const enh = DatabaseAPI.Database.Enhancements[enhEntry[1]];
            if (enh) {
                section1.Add(`${enhancementSet.DisplayName}: ${enh.Name}`, color, 0.9);
            }
        }

        return section1;
    }

    PoolShuffle(): void {
        const poolOrder = new Array(4).fill(0);
        const poolIndex = new Array(4).fill(0);
        for (let i = 3; i < 7; i++) {
            if (this.Powersets[i] === null) {
                if (i === 3) {
                    const poolIndexes = DatabaseAPI.GetPowersetIndexesByGroupName("Pool");
                    if (poolIndexes.length > 0) {
                        this.Powersets[i] = DatabaseAPI.GetPowersetByIndex(poolIndexes[0]);
                    }
                } else {
                    // Clone powerset - in TypeScript we'll just reference it
                    this.Powersets[i] = this.Powersets[i - 1] ?? null;
                }
            }
            const ps = this.Powersets[i];
            poolIndex[i - 3] = ps?.nID ?? -1;
            if (ps) {
                poolOrder[i - 3] = this.GetEarliestPowerIndex(ps.nID);
            } else {
                poolOrder[i - 3] = -1;
            }
        }

        for (let i = 0; i < 4; i++) {
            let minO = 255;
            let minI = -1;
            for (let x = 0; x < poolOrder.length; x++) {
                if (minO <= poolOrder[x]) {
                    continue;
                }
                minO = poolOrder[x];
                minI = x;
            }

            if (minI <= -1 || poolIndex[minI] <= -1) {
                continue;
            }

            const powerset = DatabaseAPI.Database.Powersets[poolIndex[minI]];
            if (powerset) {
                this.Powersets[i + 3] = powerset;
            }
            poolOrder[minI] = 512;
        }

        for (let i = 3; i < 7; i++) {
            if (this.Powersets[i]?.SetName === "Leadership_beta") {
                this.Powersets[i] = DatabaseAPI.GetPowersetByName("Leadership");
            }
        }

        // HACK: this assumes at least 8 powersets exist, but the database is fully editable.
        this.PoolLocked[0] = (this.Powersets[3] ? this.PowersetUsed(this.Powersets[3]) : false) && this.PoolUnique(Enums.PowersetType.Pool0);
        this.PoolLocked[1] = (this.Powersets[4] ? this.PowersetUsed(this.Powersets[4]) : false) && this.PoolUnique(Enums.PowersetType.Pool1);
        this.PoolLocked[2] = (this.Powersets[5] ? this.PowersetUsed(this.Powersets[5]) : false) && this.PoolUnique(Enums.PowersetType.Pool2);
        this.PoolLocked[3] = (this.Powersets[6] ? this.PowersetUsed(this.Powersets[6]) : false) && this.PoolUnique(Enums.PowersetType.Pool3);
        this.PoolLocked[4] = this.Powersets[7] ? this.PowersetUsed(this.Powersets[7]) : false;
    }

    private GetEarliestPowerIndex(iSet: number): number {
        if (!this.CurrentBuild) {
            return 0;
        }
        const lastPower = this.CurrentBuild.LastPower ?? 0;
        for (let index = 0; index < Math.min(this.CurrentBuild.Powers.length, lastPower); index++) {
            if (this.CurrentBuild.Powers[index]?.NIDPowerset === iSet) {
                return index;
            }
        }
        return lastPower + 1;
    }

    private PoolUnique(pool: Enums.PowersetType): boolean {
        const ps = this.Powersets[pool as number];
        if (!ps) {
            return false;
        }

        for (let index = 3; index < (pool as number); index++) {
            if (this.Powersets[index] && this.Powersets[index]!.nID === ps.nID) {
                return false;
            }
        }

        return true;
    }

    private PowersetUsed(powerset: IPowerset | null): boolean {
        return powerset !== null && (this.CurrentBuild?.Powers.some(t => t?.NIDPowerset === powerset.nID && t?.IDXPower > -1) ?? false);
    }

    protected CanRemovePower(index: number, allowSecondary: boolean): { canRemove: boolean; message: string } {
        let message = '';
        const power = this.CurrentBuild?.Powers[index];
        if (!power) {
            return { canRemove: false, message: 'Power not found' };
        }
        if (!power.Chosen) {
            message = "You can't remove inherent powers.\nIf the power is a Kheldian form power, you can remove it by removing the shapeshift power which grants it.";
            return { canRemove: false, message };
        }

        if (!((power.NIDPowerset === this.Powersets[1]?.nID) && (power.IDXPower === 0) && !allowSecondary)) {
            return { canRemove: power.NIDPowerset >= 0, message };
        }

        if ((this.CurrentBuild?.PowersPlaced ?? 0) <= 1) {
            return { canRemove: true, message };
        }

        message = "The first power from your secondary set is non-optional and can't be removed.";
        return { canRemove: false, message };
    }

    SwitchSets(newPowerset: IPowerset, oldPowerset: IPowerset): void {
        let oldTrunk: number;
        let oldBranch: number;
        let newTrunk: number;
        let newBranch: number;
        if (oldPowerset.nIDTrunkSet > -1) {
            oldTrunk = oldPowerset.nIDTrunkSet;
            oldBranch = oldPowerset.nID;
        } else {
            oldTrunk = oldPowerset.nID;
            oldBranch = -1;
        }

        if (newPowerset.nIDTrunkSet > -1) {
            newTrunk = newPowerset.nIDTrunkSet;
            newBranch = newPowerset.nID;
        } else {
            newTrunk = newPowerset.nID;
            newBranch = -1;
        }

        for (let index4 = 0; index4 < this.Powersets.length; index4++) {
            if (this.Powersets[index4] && this.Powersets[index4]!.nID === oldPowerset.nID) {
                this.Powersets[index4] = newPowerset;
            }
        }

        if (!this.CurrentBuild) {
            return;
        }

        for (const power of this.CurrentBuild.Powers) {
            if (!power || power.NIDPowerset < 0) {
                continue;
            }

            let idxPower = power.IDXPower;
            if (power.NIDPowerset === oldTrunk) {
                const oldPowerset = DatabaseAPI.Database.Powersets[oldTrunk];
                if (oldPowerset) {
                    for (let index4 = 0;
                        index4 < oldPowerset.Power.length &&
                        oldPowerset.Powers[index4]?.Level === 0;
                        ++index4) {
                        --idxPower;
                    }
                }

                const newPowerset = DatabaseAPI.Database.Powersets[newTrunk];
                if (newPowerset) {
                    for (let index4 = 0;
                        index4 < newPowerset.Power.length &&
                        newPowerset.Powers[index4]?.Level === 0;
                        ++index4) {
                        ++idxPower;
                    }
                }

                if (newTrunk < 0) {
                    power.Reset();
                } else {
                    const newPowerset2 = DatabaseAPI.Database.Powersets[newTrunk];
                    if (!newPowerset2 || idxPower > newPowerset2.Power.length - 1 || idxPower < 0) {
                        power.Reset();
                    } else {
                        power.NIDPowerset = newTrunk;
                        power.NIDPower = newPowerset2.Power[idxPower];
                        power.IDXPower = idxPower;
                    }
                }
            } else if (power.NIDPowerset === oldBranch) {
                const oldPowerset = DatabaseAPI.Database.Powersets[oldTrunk];
                if (oldPowerset) {
                    for (let index4 = 0;
                        index4 < oldPowerset.Power.length &&
                        oldPowerset.Powers[index4]?.Level === 0;
                        ++index4) {
                        --idxPower;
                    }
                }

                const newPowerset = DatabaseAPI.Database.Powersets[newTrunk];
                if (newPowerset) {
                    for (let index4 = 0;
                        index4 < newPowerset.Power.length &&
                        newPowerset.Powers[index4]?.Level === 0;
                        ++index4) {
                        ++idxPower;
                    }
                }

                if (newBranch < 0) {
                    power.Reset();
                } else {
                    const newBranchPowerset = DatabaseAPI.Database.Powersets[newBranch];
                    if (!newBranchPowerset || idxPower > newBranchPowerset.Power.length - 1) {
                        power.Reset();
                    } else {
                        power.NIDPowerset = newBranch;
                        power.NIDPower = newBranchPowerset.Power[idxPower];
                        power.IDXPower = idxPower;
                    }
                }
            }

            if (!power.Power?.Slottable) {
                power.Slots = [];
            } else if (power.Slots.length === 0) {
                const newSlot = new SlotEntry();
                newSlot.Enhancement = new I9Slot();
                newSlot.FlippedEnhancement = new I9Slot();
                newSlot.Level = power.Level;
                power.Slots = [newSlot];
            } else if (idxPower > -1 && power.PowerSet?.Powers && power.PowerSet.Powers[idxPower]) {
                const powerSetPower = power.PowerSet.Powers[idxPower];
                if (powerSetPower) {
                    for (let index4 = 0; index4 < power.SlotCount; index4++) {
                        if (power.Slots[index4] && !powerSetPower.IsEnhancementValid(power.Slots[index4].Enhancement.Enh)) {
                            power.Slots[index4].Enhancement = new I9Slot();
                        }
                    }
                }
            }
        }

        this.CurrentBuild.FullMutexCheck();
    }
}

