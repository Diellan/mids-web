// Converted from C# MidsCharacterFileFormat.cs
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { DatabaseAPI } from './DatabaseAPI';
import { ModernZlib } from './Utils/ModernZlib';
import { AppDataPaths } from './AppDataPaths';
import { PowerEntry } from './PowerEntry';
import { SlotEntry } from './SlotEntry';
import { PowerSubEntry } from './PowerSubEntry';
import { I9Slot } from './I9Slot';
import { Alignment, eGridType, eType, eEnhRelative, eEnhGrade } from './Enums';
import { Character } from './Base/Data_Classes/Character';

export enum eLoadReturnCode {
    Failure = 0,
    Success = 1,
    IsOldFormat = 2
}

enum Formats {
    Current,
    Prior,
    Legacy
}

interface CompressionData {
    SzUncompressed: number;
    SzCompressed: number;
    SzEncoded: number;
}

export class MidsCharacterFileFormat {
    private static DisplayIndex: number = -1;
    private static InherentPowers: PowerEntry[] = [];

    private static readonly MagicCompressed = "MxDz";
    private static readonly MagicUncompressed = "MxDu";
    private static readonly PriorVersion = Math.fround(3.10);
    private static readonly ThisVersion = Math.fround(3.20);
    private static readonly DataLinkMaxLength = 2048;
    private static readonly UseQualifiedNames = false;
    private static readonly UseOldSubpowerFields = true;

    private static readonly MagicNumber: number[] = [
        'M'.charCodeAt(0),
        'x'.charCodeAt(0),
        'D'.charCodeAt(0),
        12
    ];

    private static DecodeEntities(s: string): string {
        return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    private static EncodeEntities(s: string): string {
        return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    public static ReadMetadata(tagNames: string[], s: string): Map<string, string> {
        const ret = new Map<string, string>();

        for (const tag of tagNames) {
            const regex = new RegExp(`<${tag}>(.+?)</${tag}>`);
            const match = s.match(regex);
            if (match && match[1]) {
                ret.set(tag, this.DecodeEntities(match[1].trim()));
            }
        }

        return ret;
    }

    private static MxDBuildSaveBuffer(includeAltEnh: boolean): Uint8Array | null {
        try {
            const binWriter = new BinaryWriter();

            for (const byte of this.MagicNumber) {
                binWriter.writeByte(byte);
            }
            binWriter.writeFloat(this.ThisVersion);
            binWriter.writeBoolean(this.UseQualifiedNames);
            binWriter.writeBoolean(this.UseOldSubpowerFields);
            binWriter.writeString(MidsContext.Character?.Archetype?.ClassName || '');
            binWriter.writeString(MidsContext.Character?.Archetype?.Origin[MidsContext.Character?.Origin || 0] || '');
            binWriter.writeInt(MidsContext.Character?.Alignment || Alignment.Hero);
            binWriter.writeString(MidsContext.Character?.Name || '');
            binWriter.writeInt((MidsContext.Character?.Powersets.length || 0) - 1);
            
            if (MidsContext.Character?.Powersets) {
                for (const index of MidsContext.Character.Powersets) {
                    binWriter.writeString(index != null ? index.FullName : '');
                }
            }

            const lastPower = MidsContext.Character?.CurrentBuild?.LastPower ?? -1;
            binWriter.writeInt(lastPower + 1);
            const powerCount = MidsContext.Character?.CurrentBuild?.Powers?.length ?? 0;
            binWriter.writeInt(powerCount - 1);

            if (MidsContext.Character?.CurrentBuild?.Powers) {
                for (const power of MidsContext.Character.CurrentBuild.Powers) {
                    if (power.NIDPower < 0) {
                        binWriter.writeInt(-1);
                    } else {
                        const dbPower = DatabaseAPI.Database.Power[power.NIDPower];
                        binWriter.writeInt(dbPower?.StaticIndex ?? -1);
                        binWriter.writeInt(power.Level);
                        binWriter.writeBoolean(power.StatInclude);
                        binWriter.writeBoolean(power.ProcInclude);
                        binWriter.writeInt(power.VariableValue);
                        binWriter.writeInt(power.InherentSlotsUsed);
                        binWriter.writeInt(power.SubPowers.length - 1);
                        
                        for (const index2 of power.SubPowers) {
                            if (index2.nIDPower > -1) {
                                const subPower = DatabaseAPI.Database.Power[index2.nIDPower];
                                binWriter.writeInt(subPower?.StaticIndex ?? -1);
                            } else {
                                binWriter.writeInt(-1);
                            }
                            binWriter.writeBoolean(index2.StatInclude);
                        }
                    }

                    binWriter.writeInt(power.Slots.length - 1);
                    for (let index2 = 0; index2 < power.Slots.length; index2++) {
                        binWriter.writeInt(power.Slots[index2].Level);
                        binWriter.writeBoolean(power.Slots[index2].IsInherent);
                        this.WriteSlotData(binWriter, power.Slots[index2].Enhancement);
                        binWriter.writeBoolean(includeAltEnh);
                        if (includeAltEnh) {
                            this.WriteSlotData(binWriter, power.Slots[index2].FlippedEnhancement);
                        }
                    }
                }
            }

            const arrayBuffer = (binWriter as any).toArrayBuffer?.() || (binWriter as any).buffer || (binWriter as any).getBuffer?.();
            return arrayBuffer ? new Uint8Array(arrayBuffer) : new Uint8Array(0);
        } catch (ex: any) {
            console.error(`Save Failed!\n${ex.message}`);
            return null;
        }
    }

    public static MxDBuildSaveHyperlink(justLink: boolean = false, useMarkdown: boolean = false, useBbCode: boolean = false): string {
        const cData: CompressionData = { SzUncompressed: 0, SzCompressed: 0, SzEncoded: 0 };
        const str1 = this.MxDBuildSaveStringShared(cData, false, false);
        if (!str1) return '';

        const hyperlink = `https://api.midsreborn.com/legacy/download?uc=${cData.SzUncompressed}&c=${cData.SzCompressed}&a=${cData.SzEncoded}&f=HEX&dc=${str1}`;

        if (hyperlink.length > this.DataLinkMaxLength) return '';

        if (justLink) return hyperlink;

        if (useMarkdown) return `[-->Click Here To Download This Legacy Build<--](${hyperlink})`;

        return useBbCode 
            ? `[url=${hyperlink}]Click this legacy DataLink to open the build![/url]`
            : `<a href="${hyperlink}">Click this legacy DataLink to open the build!</a>`;
    }

    private static MxDBuildSaveStringShared(cData: CompressionData, includeAltEnh: boolean, breakString: boolean): string {
        const buffer = this.MxDBuildSaveBuffer(includeAltEnh);
        if (!buffer) {
            return '';
        }

        cData.SzUncompressed = buffer.length;
        const compressedBytes = ModernZlib.CompressChunk(buffer);
        cData.SzCompressed = compressedBytes.length;
        const encodedBytes = ModernZlib.HexEncodeBytes(compressedBytes);
        cData.SzEncoded = encodedBytes.length;
        const resultString = new TextDecoder('ascii').decode(encodedBytes);

        return breakString ? ModernZlib.BreakString(resultString, 67, true) : resultString;
    }

    public static MxDBuildSaveString(includeAltEnh: boolean, forumMode: boolean): string {
        const cData: CompressionData = { SzUncompressed: 0, SzCompressed: 0, SzEncoded: 0 };
        const str1 = this.MxDBuildSaveStringShared(cData, includeAltEnh, true);

        let str4 = '';

        // Save metadata
        let comment = MidsContext.Character?.Comment?.trim() || '';
        if (!comment) {
            comment = '';
        }
        if (comment) {
            str4 += `\r\n<comment>${this.EncodeEntities(comment)}</comment>`;
        }

        let enhObtainedBin = '';
        let featureUsed = false;
        if (MidsContext.Character?.CurrentBuild?.Powers) {
            for (const pe of MidsContext.Character.CurrentBuild.Powers) {
                if (!pe.Power) {
                    continue;
                }

                for (let j = 0; j < pe.Slots.length; j++) {
                    const obtained = pe.Slots[j].Enhancement.Obtained || pe.Slots[j].FlippedEnhancement.Obtained;

                    enhObtainedBin += obtained ? '1' : '0';

                    if (obtained) {
                        featureUsed = true;
                    }
                }
            }
        }

        if (enhObtainedBin && featureUsed) {
            str4 += `\r\n<enhobtained>${enhObtainedBin}</enhobtained>`;
        }

        str4 += '\r\n\r\n\r\n';

        if (!str1) return '';

        let str3 = '\n';
        if (forumMode) {
            const flag1 = MidsContext.Config?.Export?.FormatCode?.[MidsContext.Config?.ExportTarget ?? 0]?.Notes?.indexOf('HTML') ?? -1 > -1;
            const flag2 = MidsContext.Config?.Export?.FormatCode?.[MidsContext.Config?.ExportTarget ?? 0]?.Notes?.indexOf('no <br /> tags') ?? -1 > -1;
            if (flag1 && !flag2) {
                str3 = '<br />';
            }

            const str5 = '| Copy & Paste this data into Mids Reborn to view the build |' + str3;
            const str5Processed = flag1 ? str5.replace(/ /g, '&nbsp;') : str5;
            str4 += str5Processed + '|-------------------------------------------------------------------|' + str3;
        } else {
            str4 += '|              Do not modify anything below this line!              |' + str3 +
                    '|-------------------------------------------------------------------|' + str3;
        }

        const str6 = ';HEX';
        return str4 + '|' + this.MagicCompressed + ';' + cData.SzUncompressed + ';' + cData.SzCompressed + ';' +
               cData.SzEncoded + str6 + ';|' + str3 + str1 + str3 +
               '|-------------------------------------------------------------------|';
    }

    private static SortGridPowers(powerList: PowerEntry[], iType: eGridType): PowerEntry[] {
        const tList = powerList.filter(x => x.Power?.InherentType === iType);
        const tempList: (PowerEntry | null)[] = new Array(tList.length).fill(null);
        
        for (let eIndex = 0; eIndex < tList.length; eIndex++) {
            const power = tList[eIndex];
            switch (power.Power?.InherentType) {
                case eGridType.Class:
                    tempList[eIndex] = power;
                    break;
                case eGridType.Inherent:
                    switch (power.Power?.PowerName) {
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
                case eGridType.Powerset:
                case eGridType.Power:
                case eGridType.Prestige:
                case eGridType.Incarnate:
                case eGridType.Pet:
                case eGridType.Temp:
                    tempList[eIndex] = power;
                    break;
                case eGridType.Accolade:
                    power.Level = 49;
                    tempList[eIndex] = power;
                    break;
            }
        }

        return tempList.filter((p): p is PowerEntry => p !== null);
    }

    public static MxDReadSaveData(buffer: Uint8Array, silent: boolean = false): Character {
        let formatUsed = Formats.Current;
        this.InherentPowers = [];
        this.DisplayIndex = -1;
        
        if (buffer.length < 1) {
            throw new Error('Unable to read data - Empty Buffer.');
        }

        let memoryStream: Uint8Array;
        let r: BinaryReader;
        try {
            memoryStream = buffer;
            r = new BinaryReader(memoryStream);
        } catch (ex: any) {
            throw new Error(`Unable to read data - ${ex.message}`);
        }

        try {
            let streamIndex = 0;
            let magicFound = false;
            
            // try to find magic number
            do {
                // Create a new reader at the current position to read magic bytes
                const readerAtPos = new BinaryReader(buffer.slice(streamIndex));
                const numArray = readerAtPos.readBytes(4);
                
                if (numArray.length >= 4) {
                    magicFound = true;
                    for (let index = 0; index < this.MagicNumber.length; index++) {
                        if (this.MagicNumber[index] !== numArray[index]) {
                            magicFound = false;
                        }
                    }

                    if (magicFound) {
                        // Create a new reader starting after the magic number
                        r = new BinaryReader(buffer.slice(streamIndex + 4));
                        break;
                    }

                    streamIndex++;
                } else {
                    throw new Error('Unable to read data - Magic Number not found.');
                }
            } while (!magicFound);

            const fVersion = r.readFloat();
            
            if (fVersion > this.ThisVersion) {
                console.error('File was saved by a newer version of the application. Please obtain the most recent release in order to open this file.');
                throw new Error('File was saved by a newer version of the application. Please obtain the most recent release in order to open this file.');
            } else if (fVersion < this.PriorVersion) {
                formatUsed = Formats.Legacy;
            } else if (fVersion < this.ThisVersion && fVersion >= this.PriorVersion) {
                formatUsed = Formats.Prior;
            } else if (fVersion === this.ThisVersion) {
                formatUsed = Formats.Current;
            }

            const qualifiedNames = r.readBoolean();
            const hasSubPower = r.readBoolean();
            const nIdClass = DatabaseAPI.NidFromUidClass(r.readString());
            if (nIdClass < 0) {
                throw new Error('Unable to read data - Invalid Class UID.');
            }

            const iOrigin = DatabaseAPI.NidFromUidOrigin(r.readString(), nIdClass);
            const charClass = DatabaseAPI.Database.Classes[nIdClass];
            if (!charClass) {
                throw new Error('Unable to read data - Invalid Class UID.');
            }

            if (MidsContext.Character) {
                MidsContext.Character.Reset(charClass, iOrigin);
                if (fVersion > 1) {
                    const align = r.readInt();
                    MidsContext.Character.Alignment = align as Alignment;
                }

                MidsContext.Character.Name = r.readString();
                const powerSetCount = r.readInt();
                const names: string[] = [];
                
                for (let index = 0; index < powerSetCount + 1; index++) {
                    let iName = r.readString();
                    iName = iName === 'Pool.Leadership_beta' ? 'Pool.Leadership' :
                            iName === 'Blaster_Support.Atomic_Manipulation' ? 'Blaster_Support.Radiation_Manipulation' :
                            iName === 'Pool.Fitness' ? 'Pool.Invisibility' :
                            iName;
                    names.push(iName);
                }

                const errors = MidsContext.Character.LoadPowersetsByName(names);
                for (const [i, n] of errors) {
                    console.error(`Failed to load powerset by name: ${n} at ${i} on ${DatabaseAPI.DatabaseName} DB version ${DatabaseAPI.Database.Version}`);
                }

                if (MidsContext.Character.CurrentBuild) {
                    MidsContext.Character.CurrentBuild.LastPower = r.readInt() - 1;

                    const powerCount = r.readInt() + 1;
                    try {
                        for (let powerIndex = 0; powerIndex < powerCount; powerIndex++) {
                            let nId = -1;
                            let name1 = '';
                            let sidPower1 = -1;
                            
                            if (qualifiedNames) {
                                name1 = r.readString();
                                if (name1) {
                                    nId = DatabaseAPI.NidFromUidPower(name1);
                                }
                            } else {
                                sidPower1 = r.readInt();
                                const newId = DatabaseAPI.Database.ReplTable?.FetchAlternate(sidPower1, charClass.ClassName);
                                if (newId !== undefined && newId >= 0) {
                                    sidPower1 = newId;
                                }
                                nId = DatabaseAPI.NidFromStaticIndexPower(sidPower1);
                            }

                            let flag5 = false;
                            let powerEntry1: PowerEntry;
                            if (powerIndex < MidsContext.Character.CurrentBuild.Powers.length) {
                                powerEntry1 = MidsContext.Character.CurrentBuild.Powers[powerIndex];
                            } else {
                                powerEntry1 = new PowerEntry();
                                flag5 = true;
                            }

                            if (!powerEntry1) {
                                continue;
                            }

                            if (sidPower1 > -1 || name1) {
                                powerEntry1.Level = r.readSignedByte();
                                switch (formatUsed) {
                                    case Formats.Current:
                                        powerEntry1.StatInclude = r.readBoolean();
                                        powerEntry1.ProcInclude = r.readBoolean();
                                        powerEntry1.VariableValue = r.readInt();
                                        powerEntry1.InherentSlotsUsed = r.readInt();
                                        break;
                                    case Formats.Prior:
                                        powerEntry1.StatInclude = r.readBoolean();
                                        powerEntry1.ProcInclude = r.readBoolean();
                                        powerEntry1.VariableValue = r.readInt();
                                        break;
                                    case Formats.Legacy:
                                        powerEntry1.StatInclude = r.readBoolean();
                                        powerEntry1.VariableValue = r.readInt();
                                        break;
                                }

                                if (hasSubPower) {
                                    const subPowerCount = r.readSignedByte() + 1;
                                    powerEntry1.SubPowers = new Array(subPowerCount).fill(null).map(() => new PowerSubEntry());
                                    
                                    for (let subPowerIndex = 0; subPowerIndex < powerEntry1.SubPowers.length; subPowerIndex++) {
                                        const powerSub = powerEntry1.SubPowers[subPowerIndex];
                                        if (qualifiedNames) {
                                            const name2 = r.readString();
                                            if (name2) {
                                                powerSub.nIDPower = DatabaseAPI.NidFromUidPower(name2);
                                            }
                                        } else {
                                            const sidPower2 = r.readInt();
                                            powerSub.nIDPower = DatabaseAPI.NidFromStaticIndexPower(sidPower2);
                                        }

                                        const subPower = DatabaseAPI.Database.Power[powerSub.nIDPower];
                                        if (powerSub.nIDPower > -1) {
                                            if (!subPower) {
                                                continue;
                                            }
                                            powerSub.Powerset = subPower.PowerSetID;
                                            powerSub.Power = subPower.PowerSetIndex;
                                        }

                                        powerSub.StatInclude = r.readBoolean();
                                        if (!(powerSub.nIDPower > -1 && powerSub.StatInclude)) {
                                            continue;
                                        }

                                        const powerEntry2 = new PowerEntry(DatabaseAPI.Database.Power[powerSub.nIDPower]);
                                        powerEntry2.StatInclude = true;
                                        MidsContext.Character.CurrentBuild.Powers.push(powerEntry2);
                                    }
                                }
                            }

                            if (nId < 0 && powerIndex < DatabaseAPI.Database.Levels_MainPowers.length) {
                                powerEntry1.Level = DatabaseAPI.Database.Levels_MainPowers[powerIndex];
                            }

                            const slotCount = r.readSignedByte() + 1;
                            powerEntry1.Slots = new Array(slotCount).fill(null).map(() => {
                                const slot = new SlotEntry();
                                slot.Level = 0;
                                slot.IsInherent = false;
                                slot.Enhancement = new I9Slot();
                                slot.FlippedEnhancement = new I9Slot();
                                return slot;
                            });
                            
                            for (let index3 = 0; index3 < powerEntry1.Slots.length; index3++) {
                                powerEntry1.Slots[index3].Level = r.readSignedByte();
                                powerEntry1.Slots[index3].IsInherent = formatUsed === Formats.Current && r.readBoolean();
                                this.ReadSlotData(r, powerEntry1.Slots[index3].Enhancement, qualifiedNames, fVersion);
                                if (r.readBoolean()) {
                                    this.ReadSlotData(r, powerEntry1.Slots[index3].FlippedEnhancement, qualifiedNames, fVersion);
                                }
                            }

                            if (powerEntry1.SubPowers.length > 0) {
                                nId = -1;
                            }

                            if (nId <= -1) {
                                continue;
                            }

                            powerEntry1.NIDPower = nId;
                            const power = DatabaseAPI.Database.Power[nId];
                            if (!power) {
                                continue;
                            }

                            powerEntry1.NIDPowerset = power.PowerSetID;
                            powerEntry1.IDXPower = power.PowerSetIndex;
                            
                            if (powerEntry1.Level === 0 && powerEntry1.Power?.FullSetName === 'Pool.Fitness') {
                                const oldNIDPower = powerEntry1.NIDPower;
                                powerEntry1.NIDPower = oldNIDPower === 2553 ? 1521 :
                                                      oldNIDPower === 2554 ? 1523 :
                                                      oldNIDPower === 2555 ? 1522 :
                                                      oldNIDPower === 2556 ? 1524 :
                                                      oldNIDPower;
                                const updatedPower = DatabaseAPI.Database.Power[powerEntry1.NIDPower];
                                if (updatedPower) {
                                    powerEntry1.NIDPowerset = updatedPower.PowerSetID;
                                    powerEntry1.IDXPower = updatedPower.PowerSetIndex;
                                }
                            }

                            if (DatabaseAPI.DatabaseName.toLowerCase() === 'homecoming') {
                                if ((powerEntry1.Power?.FullName === 'Pool.Flight.Afterburner') ||
                                    (powerEntry1.Power?.FullName === 'Inherent.Inherent.Afterburner' && powerIndex < 24)) {
                                    nId = DatabaseAPI.NidFromUidPower('Pool.Flight.Evasive_Maneuvers');
                                    if (nId >= 0) {
                                        powerEntry1.NIDPower = nId;
                                        const updatedPower = DatabaseAPI.Database.Power[nId];
                                        if (updatedPower) {
                                            powerEntry1.NIDPowerset = updatedPower.PowerSetID;
                                            powerEntry1.IDXPower = updatedPower.PowerSetIndex;
                                        }
                                    }
                                }
                            }

                            const ps = powerEntry1.Power?.GetPowerSet();
                            if (powerIndex < MidsContext.Character.CurrentBuild.Powers.length) {
                                const cPower = MidsContext.Character.CurrentBuild.Powers[powerIndex];
                                if (!cPower) {
                                    continue;
                                }
                                if (powerEntry1.Power && !(!cPower.Chosen && (ps?.nArchetype !== undefined && ps.nArchetype > -1 || powerEntry1.Power.GroupName === 'Pool'))) {
                                    flag5 = !cPower.Chosen;
                                } else {
                                    continue;
                                }
                            }

                            if (flag5) {
                                if (powerEntry1.Power && powerEntry1.Power.InherentType !== eGridType.None) {
                                    this.InherentPowers.push(powerEntry1);
                                }
                            } else if (powerEntry1.Power && (ps?.nArchetype !== undefined && ps.nArchetype > -1 || powerEntry1.Power.GroupName === 'Pool')) {
                                MidsContext.Character.CurrentBuild.Powers[powerIndex] = powerEntry1;
                            }
                        }

                        const newPowerList: PowerEntry[] = [];
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Class));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Inherent));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Powerset));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Power));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Prestige));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Incarnate));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Accolade));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Pet));
                        newPowerList.push(...this.SortGridPowers(this.InherentPowers, eGridType.Temp));
                        
                        for (const entry of newPowerList) {
                            MidsContext.Character.CurrentBuild.Powers.push(entry);
                        }
                    } catch (ex: any) {
                        throw new Error(`Error reading some power data with the ${DatabaseAPI.DatabaseName} database, will attempt to build character with known data.\r\n${ex.message}\r\n\r\n${ex.stack}`);
                    }
                }

                if (MidsContext.Archetype) {
                    MidsContext.Archetype = MidsContext.Character.Archetype;
                }
                MidsContext.Character.Validate();
                MidsContext.Character.Lock();
                
                return MidsContext.Character;
            }
            throw new Error('Failed to load character data');
        } catch (ex: any) {
            throw new Error(`Unable to read data - ${ex.message}\r\n\r\n${ex.stack}`);
        }
    }

    public static MxDExtractAndLoad(data: string): eLoadReturnCode {
        if (!data) {
            console.error('Input data is null');
            return eLoadReturnCode.Failure;
        }

        const processedData = data.replace(/\|\|/g, '|\n|');
        const lines = processedData.split('\n');
        let headers: string[] = ['ABCD', '0', '0', '0'];
        let header = '';
        const dataIndex = this.FindDataIndex(lines, headers, header);

        if (dataIndex < 0) {
            console.error('Unable to locate data header - Magic Number not found!');
            return eLoadReturnCode.Failure;
        }

        if (lines.length <= dataIndex + 1) {
            console.error('Unable to locate data - Nothing beyond header!');
            return eLoadReturnCode.Failure;
        }

        const payload = lines.slice(dataIndex + 1).join('\n');
        const isHex = headers.length > 4 && headers[4].toUpperCase() === 'HEX';
        let bytes = new TextEncoder().encode(isHex
            ? ModernZlib.UnbreakHex(payload)
            : ModernZlib.UnbreakString(payload, true));

        if (bytes.length < parseInt(headers[3])) {
            console.error('Data chunk was incomplete! Check that the entire chunk was copied to the clipboard.');
            return eLoadReturnCode.Failure;
        }

        if (bytes.length > parseInt(headers[3])) {
            bytes = bytes.slice(0, parseInt(headers[3]));
        }

        const bytesArray = new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        let processedBytes: Uint8Array = isHex ? ModernZlib.HexDecodeBytes(bytesArray) : ModernZlib.UuDecodeBytes(bytesArray);

        if (processedBytes.length === 0) {
            return eLoadReturnCode.Failure;
        }

        if (header === this.MagicCompressed) {
            processedBytes = ModernZlib.DecompressChunk(processedBytes, parseInt(headers[1]));
        }

        return this.MxDReadSaveData(processedBytes, false) ? eLoadReturnCode.Success : eLoadReturnCode.Failure;
    }

    private static FindDataIndex(lines: string[], headers: string[], header: string): number {
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            let startIndex = line.indexOf(this.MagicUncompressed);
            if (startIndex < 0) {
                startIndex = line.indexOf(this.MagicCompressed);
            }
            if (startIndex < 0) {
                startIndex = line.indexOf(AppDataPaths.Headers.Save.Compressed);
            }
            if (startIndex <= -1) continue;
            headers = line.substring(startIndex).split(';');
            header = headers.length > 0 ? headers[0] : '';
            return index;
        }
        return -1;
    }

    private static WriteSlotData(writer: BinaryWriter, slot: I9Slot): void {
        if (slot.Enh < 0) {
            writer.writeInt(-1);
        } else {
            if (slot.Enh <= -1) return;
            const enhancement = DatabaseAPI.Database.Enhancements[slot.Enh];
            writer.writeInt(enhancement?.StaticIndex ?? -1);
            if ((enhancement?.StaticIndex ?? -1) < 0) return;
            if (enhancement?.TypeID === eType.Normal || enhancement?.TypeID === eType.SpecialO) {
                writer.writeInt(slot.RelativeLevel);
                writer.writeInt(slot.Grade);
            } else if (enhancement?.TypeID === eType.InventO || enhancement?.TypeID === eType.SetO) {
                writer.writeInt(slot.IOLevel);
                writer.writeInt(slot.RelativeLevel);
            }
        }
    }

    private static ReadSlotData(reader: BinaryReader, slot: I9Slot, qualifiedNames: boolean, fVersion: number): void {
        let num = -1;
        if (qualifiedNames) {
            const uidEnh = reader.readString();
            if (uidEnh) {
                num = DatabaseAPI.NidFromUidEnh(uidEnh);
            }
        } else {
            num = DatabaseAPI.NidFromStaticIndexEnh(reader.readInt());
        }

        if (num <= -1) {
            return;
        }

        slot.Enh = num;
        const enhancement = DatabaseAPI.Database.Enhancements[slot.Enh];
        
        switch (enhancement?.TypeID) {
            case eType.Normal:
            case eType.SpecialO:
                slot.RelativeLevel = reader.readSignedByte() as eEnhRelative;
                slot.Grade = reader.readSignedByte() as eEnhGrade;
                break;
            case eType.InventO:
            case eType.SetO:
                slot.IOLevel = reader.readSignedByte();
                if (slot.IOLevel > 49) {
                    slot.IOLevel = 49;
                }
                if (fVersion > 1.0) {
                    slot.RelativeLevel = reader.readSignedByte() as eEnhRelative;
                }
                break;
            case eType.None:
                break;
        }
    }
}
