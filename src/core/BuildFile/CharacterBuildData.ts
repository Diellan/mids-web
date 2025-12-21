// Converted from C# CharacterBuildData.cs
// Note: This file has dependencies on several utility classes that may need to be implemented:
// - Compression.CompressToBase64, Compression.DecompressFromBase64
// - ModernZlib.BreakString
// - DataClassifier (for BuildManager)
// - MidsCharacterFileFormat.MxDReadSaveData (for BuildManager)

import type { Character } from '../Base/Data_Classes/Character';
import type { PowerEntry } from '../PowerEntry';
import type { I9Slot } from '../I9Slot';
import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { DatabaseAPI } from '../DatabaseAPI';
import { Enums } from '../Enums';
import type { MetaData, Version } from './DataModels/MetaData';
import type { PowerData } from './DataModels/PowerData';
import type { SlotData } from './DataModels/SlotData';
import type { EnhancementData } from './DataModels/EnhancementData';
import type { SubPowerData } from './DataModels/SubPowerData';
import { MetaData as MetaDataClass } from './DataModels/MetaData';
import { PowerData as PowerDataClass } from './DataModels/PowerData';
import { SlotData as SlotDataClass } from './DataModels/SlotData';
import { EnhancementData as EnhancementDataClass } from './DataModels/EnhancementData';
import { SubPowerData as SubPowerDataClass } from './DataModels/SubPowerData';
import { SlotEntry } from '../SlotEntry';
import { PowerSubEntry } from '../PowerSubEntry';
import { IBuildNotifier, BuildNotifier } from './BuildNotifier';
import { Compression } from '../Utils/Compression';
import { ModernZlib } from '../Utils/ModernZlib';

export class CharacterBuildData {
    private readonly _notifier: IBuildNotifier = new BuildNotifier();
    private static _instance: CharacterBuildData | null = null;
    private static readonly InstanceLock: object = {};

    static get Instance(): CharacterBuildData {
        if (CharacterBuildData._instance !== null) return CharacterBuildData._instance;
        synchronized(CharacterBuildData.InstanceLock, () => {
            CharacterBuildData._instance = new CharacterBuildData();
        });
        return CharacterBuildData._instance;
    }

    Id: string | null = null;

    BuiltWith: MetaData | null = null;

    Level: string = '';

    Class: string = '';

    Origin: string = '';

    Alignment: string = '';

    Name: string = '';

    Comment: string | null = null;

    PowerSets: string[] = [];

    LastPower: number = 0;

    PowerEntries: (PowerData | null)[] = [];

    private static InherentPowers: PowerEntry[] = [];

    Update(characterData: Character | null): void {
        synchronized(CharacterBuildData.InstanceLock, () => {
            if (characterData === null) throw new Error('characterData cannot be null');
            if (characterData.Archetype === null) throw new Error('characterData.Archetype cannot be null');
            if (characterData.CurrentBuild === null) throw new Error('characterData.CurrentBuild cannot be null');

            const appVersion: Version = {
                major: MidsContext.AppFileVersion.major,
                minor: MidsContext.AppFileVersion.minor,
                build: MidsContext.AppFileVersion.build,
                revision: MidsContext.AppFileVersion.revision
            };
            const dbVersion: Version = {
                major: DatabaseAPI.Database.Version.major || 0,
                minor: DatabaseAPI.Database.Version.minor || 0,
                build: DatabaseAPI.Database.Version.build || 0,
                revision: DatabaseAPI.Database.Version.revision || 0
            };

            this.BuiltWith = new MetaDataClass(
                MidsContext.AppName,
                appVersion,
                DatabaseAPI.DatabaseName,
                dbVersion
            );
            this.Class = characterData.Archetype.ClassName;
            this.Origin = characterData.Archetype.Origin[characterData.Origin];
            this.Alignment = characterData.Alignment.toString();
            this.Name = characterData.Name;
            this.Level = characterData.Level.toString();
            this.Comment = characterData.Comment;
            this.PowerSets = [];
            this.PowerEntries = [];

            for (const powerSet of characterData.Powersets) {
                this.PowerSets.push(powerSet === null ? '' : powerSet.FullName);
            }

            this.LastPower = characterData.CurrentBuild.LastPower + 1;

            for (const powerEntry of characterData.CurrentBuild.Powers) {
                if (powerEntry === null) continue;

                const powerData = new PowerDataClass();
                if (powerEntry.NIDPower < 0) {
                    this.PowerEntries.push(powerData);
                } else {
                    const power = powerEntry.Power;
                    if (power === null) continue;
                    powerData.PowerName = power.FullName;
                    powerData.Level = powerEntry.Level + 1;
                    powerData.StatInclude = powerEntry.StatInclude;
                    powerData.ProcInclude = powerEntry.ProcInclude;
                    powerData.VariableValue = powerEntry.VariableValue;
                    powerData.InherentSlotsUsed = powerEntry.InherentSlotsUsed;

                    this.PowerEntries.push(powerData);

                    for (const subPowerEntry of powerEntry.SubPowers) {
                        const subPowerData = new SubPowerDataClass();
                        if (subPowerEntry.nIDPower > 1) {
                            const subPower = DatabaseAPI.Database.Power[subPowerEntry.nIDPower];
                            subPowerData.PowerName = subPower.FullName;
                        }

                        subPowerData.StatInclude = subPowerEntry.StatInclude;
                        const lastIndex = this.PowerEntries.length - 1;
                        if (this.PowerEntries[lastIndex] !== null) {
                            this.PowerEntries[lastIndex]!.SubPowerEntries.push(subPowerData);
                        }
                    }

                    for (const slot of powerEntry.Slots) {
                        const slotData = new SlotDataClass();
                        slotData.Level = slot.Level + 1;
                        slotData.IsInherent = slot.IsInherent;
                        CharacterBuildData.WriteSlotData(slotData, slot.Enhancement);
                        CharacterBuildData.WriteAltSlotData(slotData, slot.FlippedEnhancement);
                        const lastIndex = this.PowerEntries.length - 1;
                        if (this.PowerEntries[lastIndex] !== null) {
                            this.PowerEntries[lastIndex]!.SlotEntries.push(slotData);
                        }
                    }
                }
            }
        });
    }

    private static WriteSlotData(slotData: SlotData, slot: I9Slot): void {
        if (slot.Enh < 0) {
            slotData.Enhancement = null;
        } else {
            slotData.Enhancement = new EnhancementDataClass();
            slotData.Enhancement.Uid = DatabaseAPI.Database.Enhancements[slot.Enh].UID;
            slotData.Enhancement.Obtained = slot.Obtained;

            const enhType = DatabaseAPI.Database.Enhancements[slot.Enh].TypeID;
            if (enhType === Enums.eType.Normal || enhType === Enums.eType.SpecialO) {
                slotData.Enhancement.RelativeLevel = Enums.eEnhRelative[slot.RelativeLevel];
                slotData.Enhancement.Grade = Enums.eEnhGrade[slot.Grade];
            } else if (enhType === Enums.eType.InventO || enhType === Enums.eType.SetO) {
                slotData.Enhancement.IoLevel = slot.IOLevel;
                slotData.Enhancement.RelativeLevel = Enums.eEnhRelative[slot.RelativeLevel];
            }
        }
    }

    private static WriteAltSlotData(slotData: SlotData, slot: I9Slot): void {
        if (slot.Enh < 0) {
            slotData.FlippedEnhancement = null;
        } else {
            slotData.FlippedEnhancement = new EnhancementDataClass();
            slotData.FlippedEnhancement.Uid = DatabaseAPI.Database.Enhancements[slot.Enh].UID;
            slotData.FlippedEnhancement.Obtained = slot.Obtained;

            const enhType = DatabaseAPI.Database.Enhancements[slot.Enh].TypeID;
            if (enhType === Enums.eType.Normal || enhType === Enums.eType.SpecialO) {
                slotData.FlippedEnhancement.RelativeLevel = Enums.eEnhRelative[slot.RelativeLevel];
                slotData.FlippedEnhancement.Grade = Enums.eEnhGrade[slot.Grade];
            } else if (enhType === Enums.eType.InventO || enhType === Enums.eType.SetO) {
                slotData.FlippedEnhancement.IoLevel = slot.IOLevel;
                slotData.FlippedEnhancement.RelativeLevel = Enums.eEnhRelative[slot.RelativeLevel];
            }
        }
    }

    private static SortGridPowers(powerList: PowerEntry[], iType: Enums.eGridType): PowerEntry[] {
        const tList = powerList.filter(x => x.Power !== null && x.Power.InherentType === iType);
        const tempList: (PowerEntry | null)[] = new Array(tList.length).fill(null);
        for (let eIndex = 0; eIndex < tList.length; eIndex++) {
            const power = tList[eIndex];
            if (power.Power !== null) {
                switch (power.Power.InherentType) {
                    case Enums.eGridType.Class:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Inherent:
                        switch (power.Power.PowerName) {
                            case 'Brawl':
                                tempList[0] = power;
                                break;
                            case 'Sprint':
                                tempList[1] = power;
                                break;
                            case 'Rest':
                                tempList[2] = power;
                                break;
                            case 'Swift':
                                tempList[3] = power;
                                break;
                            case 'Hurdle':
                                tempList[4] = power;
                                break;
                            case 'Health':
                                tempList[5] = power;
                                break;
                            case 'Stamina':
                                tempList[6] = power;
                                break;
                        }
                        break;
                    case Enums.eGridType.Powerset:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Power:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Prestige:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Incarnate:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Accolade:
                        power.Level = 49;
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Pet:
                        tempList[eIndex] = power;
                        break;
                    case Enums.eGridType.Temp:
                        tempList[eIndex] = power;
                        break;
                }
            }
        }

        return tempList.filter((p): p is PowerEntry => p !== null);
    }

    LoadBuild(): boolean {
        CharacterBuildData.InherentPowers = [];

        const atNiD = DatabaseAPI.NidFromUidClass(this.Class);
        const atOrigin = DatabaseAPI.NidFromUidOrigin(this.Origin, atNiD);
        MidsContext.Character!.Reset(DatabaseAPI.Database.Classes[atNiD], atOrigin);
        MidsContext.Character!.Alignment = Enums.eAlignment[this.Alignment as keyof typeof Enums.eAlignment] || Enums.eAlignment.Hero;
        MidsContext.Character!.Name = this.Name;
        MidsContext.Character!.Comment = this.Comment ?? '';
        MidsContext.Character!.LoadPowerSetsByName(this.PowerSets);
        MidsContext.Character!.CurrentBuild!.LastPower = this.LastPower;

        try {
            for (let powerIndex = 0; powerIndex < this.PowerEntries.length; powerIndex++) {
                const powerEntryData = this.PowerEntries[powerIndex];

                let powerId = -1;

                if (powerEntryData?.PowerName && powerEntryData.PowerName.trim() !== '') {
                    powerId = DatabaseAPI.PiDFromUidPower(powerEntryData.PowerName);
                }

                let flagged = false;
                let powerEntry: PowerEntry | null;

                if (powerIndex < MidsContext.Character!.CurrentBuild!.Powers.length) {
                    powerEntry = MidsContext.Character!.CurrentBuild!.Powers[powerIndex];
                } else {
                    powerEntry = new PowerEntry();
                    flagged = true;
                }

                if (powerEntry === null) continue;
                if (powerEntryData === null) continue;

                if (powerId > -1) {
                    powerEntry.Level = powerEntryData.Level - 1;
                    powerEntry.StatInclude = powerEntryData.StatInclude;
                    powerEntry.ProcInclude = powerEntryData.ProcInclude;
                    powerEntry.VariableValue = powerEntryData.VariableValue;
                    powerEntry.InherentSlotsUsed = powerEntryData.InherentSlotsUsed;

                    if (powerEntryData.SubPowerEntries.length > 0) {
                        powerEntry.SubPowers = new Array(powerEntryData.SubPowerEntries.length + 1).fill(null).map(() => new PowerSubEntry());
                        for (let subPowerIndex = 0; subPowerIndex < powerEntryData.SubPowerEntries.length; subPowerIndex++) {
                            const subEntry = powerEntryData.SubPowerEntries[subPowerIndex];
                            const powerSubEntry = powerEntry.SubPowers[subPowerIndex];
                            powerSubEntry.nIDPower = DatabaseAPI.PiDFromUidPower(subEntry.PowerName);
                            const subPower = DatabaseAPI.Database.Power[powerSubEntry.nIDPower];

                            if (powerSubEntry.nIDPower > -1) {
                                powerSubEntry.Powerset = subPower.PowerSetID;
                                powerSubEntry.Power = subPower.PowerSetIndex;
                            }

                            powerSubEntry.StatInclude = subEntry.StatInclude;
                            if (!(powerSubEntry.nIDPower > -1 && powerSubEntry.StatInclude)) continue;

                            const powerEntry2 = new PowerEntry(subPower);
                            powerEntry2.StatInclude = true;

                            MidsContext.Character!.CurrentBuild!.Powers.push(powerEntry2);
                        }
                    }
                }

                if (powerId < 0 && powerIndex < DatabaseAPI.Database.Levels_MainPowers.length) {
                    powerEntry.Level = DatabaseAPI.Database.Levels_MainPowers[powerIndex];
                }

                powerEntry.Slots = new Array(powerEntryData.SlotEntries.length).fill(null).map(() => new SlotEntry());
                for (let slotIndex = 0; slotIndex < powerEntry.Slots.length; slotIndex++) {
                    const slotEntry = powerEntryData.SlotEntries[slotIndex];
                    const i9Enhancement = new I9Slot();
                    this.LoadEnhancementData(i9Enhancement, slotEntry.Enhancement);

                    const i9Flipped = new I9Slot();
                    this.LoadEnhancementData(i9Flipped, slotEntry.FlippedEnhancement);

                    powerEntry.Slots[slotIndex] = new SlotEntry();
                    powerEntry.Slots[slotIndex].Level = slotEntry.Level - 1;
                    powerEntry.Slots[slotIndex].IsInherent = slotEntry.IsInherent;
                    powerEntry.Slots[slotIndex].Enhancement = i9Enhancement;
                    powerEntry.Slots[slotIndex].FlippedEnhancement = i9Flipped;
                }

                if (powerEntry.SubPowers.length > 0) {
                    powerId = -1;
                }

                if (powerId <= -1) continue;

                powerEntry.NIDPower = powerId;
                const power = DatabaseAPI.Database.Power[powerId];

                powerEntry.NIDPowerset = power.PowerSetID;
                powerEntry.IDXPower = power.PowerSetIndex;

                const powerSet = powerEntry.Power?.GetPowerSet();
                if (powerIndex < MidsContext.Character!.CurrentBuild!.Powers.length) {
                    const cPower = MidsContext.Character!.CurrentBuild!.Powers[powerIndex];
                    if (cPower === null) continue;
                    if (powerEntry.Power !== null && !(!cPower.Chosen && (powerSet !== null && powerSet.nArchetype > -1 || powerEntry.Power.GroupName === 'Pool'))) {
                        flagged = !cPower.Chosen;
                    } else {
                        continue;
                    }
                }

                if (flagged) {
                    if (powerEntry.Power !== null && powerEntry.Power.InherentType !== Enums.eGridType.None) {
                        CharacterBuildData.InherentPowers.push(powerEntry);
                    }
                } else if (powerEntry.Power !== null && (powerSet !== null && powerSet.nArchetype > -1 || powerEntry.Power.GroupName === 'Pool')) {
                    MidsContext.Character!.CurrentBuild!.Powers[powerIndex] = powerEntry;
                }
            }

            const newPowerList: PowerEntry[] = [];
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Class));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Inherent));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Powerset));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Power));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Prestige));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Incarnate));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Accolade));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Pet));
            newPowerList.push(...CharacterBuildData.SortGridPowers(CharacterBuildData.InherentPowers, Enums.eGridType.Temp));
            for (const entry of newPowerList) {
                MidsContext.Character!.CurrentBuild!.Powers.push(entry);
            }
        } catch (ex: any) {
            this._notifier.ShowError(`An error occurred while attempting to read the build data.\r\n${ex.message}\r\n${ex.stack}`);
            return false;
        }
        MidsContext.Archetype = MidsContext.Character!.Archetype;
        MidsContext.Character!.Validate();
        MidsContext.Character!.Lock();
        return true;
    }

    private LoadEnhancementData(i9Enhancement: I9Slot, enhData: EnhancementData | null): void {
        if (enhData === null) {
            return;
        }
        let enh = -1; // Default to an invalid index
        i9Enhancement.IOLevel = enhData.IoLevel;
        i9Enhancement.Obtained = enhData.Obtained;

        if (enhData.Uid && enhData.Uid.trim() !== '') {
            enh = DatabaseAPI.GetEnhancementByUIDName(enhData.Uid);
        }

        if (enh >= 0) { // Ensure that a valid enhancement was found
            i9Enhancement.Enh = enh;

            if (enhData.Grade && enhData.Grade.trim() !== '') {
                i9Enhancement.Grade = Enums.eEnhGrade[enhData.Grade as keyof typeof Enums.eEnhGrade] || Enums.eEnhGrade.None;
            }

            if (enhData.RelativeLevel && enhData.RelativeLevel.trim() !== '') {
                i9Enhancement.RelativeLevel = Enums.eEnhRelative[enhData.RelativeLevel as keyof typeof Enums.eEnhRelative] || Enums.eEnhRelative.Even;
            }
        }
    }

    async GenerateChunkData(): Promise<string> {
        this.Update(MidsContext.Character!);
        const serialized = JSON.stringify(this);
        const iBytes = new TextEncoder().encode(serialized);
        const compressionResult = await Compression.CompressToBase64(iBytes);
        const output = ModernZlib.BreakString(compressionResult.OutString, 67, true);
        return `|MBD;${compressionResult.UncompressedSize};${compressionResult.CompressedSize};${compressionResult.EncodedSize};BASE64;|\r\n${output}`;
    }

    async GenerateShareData(): Promise<string> {
        this.Update(MidsContext.Character!);
        const serialized = JSON.stringify(this);
        const iBytes = new TextEncoder().encode(serialized);
        const compressionResult = await Compression.CompressToBase64(iBytes);
        return compressionResult.OutString;
    }
}

// Helper function to simulate lock synchronization
function synchronized(lock: object, action: () => void): void {
    // In a real implementation, this would use proper locking mechanisms
    // For now, just execute the action
    action();
}

