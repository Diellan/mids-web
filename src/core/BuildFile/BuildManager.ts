// Converted from C# BuildManager.cs
// Note: This file has dependencies on several utility classes that may need to be implemented:
// - DataClassifier.ClassificationResult, DataClassifier.DataType
// - Compression.DecompressFromBase64
// - ModernZlib.HexDecodeBytes, ModernZlib.DecompressChunk
// - MidsCharacterFileFormat.MxDReadSaveData
// - Helpers.IsVersionNewer
// - AppDataPaths.RoamingFolder
// - Application.Restart (Windows Forms specific)

import { CharacterBuildData } from './CharacterBuildData';
import { EnhancementDataConverter } from './EnhancementDataConverter';
import { BuildPreferences } from './BuildPreferences';
import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { DatabaseAPI } from '../DatabaseAPI';
import { AppDataPaths } from '../AppDataPaths';
import { DataClassifier, DataType, ClassificationResult } from '../Utils/DataClassifier';
import { Compression, CompressionResult } from '../Utils/Compression';
import { ModernZlib } from '../Utils/ModernZlib';
import { Helpers } from '../Utils/Helpers';
import { Character } from '../Base/Data_Classes/Character';
import { MidsCharacterFileFormat } from '../MidsCharacterFileFormat';
import { Toon } from '../Toon';

export class BuildManager {
    private static _lazyInstance: BuildManager | null = null;
    static get Instance(): BuildManager {
        if (BuildManager._lazyInstance === null) {
            BuildManager._lazyInstance = new BuildManager();
        }
        return BuildManager._lazyInstance;
    }

    BuildData: CharacterBuildData | null = null;

    private constructor() {
        this.BuildData = CharacterBuildData.Instance;
    }

    async LoadFromFile(fileName: string | null): Promise<Toon> {
        const preferences = await BuildPreferences.Load();
        if (!fileName || fileName.trim() === '') {
            throw new Error('File name is required');
        }

        // File.ReadAllText is C# specific
        // In a web environment, this would use fetch or FileReader API
        let parsed: CharacterBuildData;
        try {
            const response = await fetch(fileName);
            parsed = await response.json();
        } catch (ex: any) {
            throw new Error(`Failed to read file: ${ex.message}`);
        }

        try {
            // Custom JSON deserialization with EnhancementDataConverter
            this.BuildData = this.DeserializeCharacterBuildData(parsed);
            if (this.BuildData === null) {
                throw new Error('Failed to deserialize build data');
            }
        } catch (ex: any) {
            throw new Error(ex.message);
        }

        if (this.BuildData === null) {
            throw new Error(`Cannot load ${fileName} - error reading build data.\r\n\r\nBuildData`);
        }

        const metaData = this.BuildData.BuiltWith;
        if (metaData === null) {
            throw new Error(`Cannot load ${fileName} - error reading build metadata.\r\n\r\nmetaData`);
        }

        // FileInfo is C# specific, using fileName directly
        if (DatabaseAPI.DatabaseName !== metaData.Database) {
            throw new Error(`This build requires the ${metaData.Database} be installed prior to loading it.\r\nPlease install the database and try again.`);
        } else {
            // Compare Database Version if Enabled
            if (MidsContext.Config?.WarnOnOldDbMbd) {
                const outDatedDb = Helpers.IsVersionNewer(
                    { major: metaData.DatabaseVersion.major, minor: metaData.DatabaseVersion.minor, build: metaData.DatabaseVersion.build, revision: metaData.DatabaseVersion.revision },
                    { major: DatabaseAPI.Database.Version.major || 0, minor: DatabaseAPI.Database.Version.minor || 0, build: DatabaseAPI.Database.Version.build || 0, revision: DatabaseAPI.Database.Version.revision || 0 }
                );
                const newerDb = Helpers.IsVersionNewer(
                    { major: DatabaseAPI.Database.Version.major || 0, minor: DatabaseAPI.Database.Version.minor || 0, build: DatabaseAPI.Database.Version.build || 0, revision: DatabaseAPI.Database.Version.revision || 0 },
                    { major: metaData.DatabaseVersion.major, minor: metaData.DatabaseVersion.minor, build: metaData.DatabaseVersion.build, revision: metaData.DatabaseVersion.revision }
                );
                let continueLoad = false;

                if (outDatedDb) {
                    if (preferences.ShouldSkipWarning(fileName)) {
                        continueLoad = true;
                    } else {
                        const result = confirm(
                            `This build was created in an older version of the ${metaData.Database} database.\r\nSome powers and/or enhancements may have changed, you may need to rebuild some of it.`
                        );                        
                        if (result) {
                            continueLoad = true;
                        }
                    }
                }

                if (newerDb) {
                    if (preferences.ShouldSkipWarning(fileName)) {
                        continueLoad = true;
                    } else {
                        const result = confirm(
                            `This build was created in an newer version of the ${metaData.Database} database.\r\nIt is recommended that you update the database.`
                        );
                        if (result) {
                            continueLoad = true;
                        }
                    }
                }

                if (!outDatedDb && !newerDb) continueLoad = true;

                if (continueLoad) {
                    return this.BuildData.LoadBuild();
                }
            } else {
                return this.BuildData.LoadBuild();
            }
        }
        throw new Error('Failed to load build data');
    }

    async LoadFromContent(content: string): Promise<Toon> {
        const preferences = await BuildPreferences.Load();
        let parsed: CharacterBuildData;
        try {
            parsed = JSON.parse(content);
        } catch {
            // Not JSON — try MXD/MBD import format
            return this.LoadFromImportContent(content);
        }

        try {
            this.BuildData = this.DeserializeCharacterBuildData(parsed);
            if (this.BuildData === null) {
                throw new Error('Failed to deserialize build data');
            }
        } catch (ex: any) {
            throw new Error(ex.message);
        }

        if (this.BuildData === null) {
            throw new Error('Cannot load build - error reading build data.');
        }

        const metaData = this.BuildData.BuiltWith;
        if (metaData === null) {
            throw new Error('Cannot load build - error reading build metadata.');
        }

        if (DatabaseAPI.DatabaseName !== metaData.Database) {
            throw new Error(`This build requires the ${metaData.Database} be installed prior to loading it.\r\nPlease install the database and try again.`);
        } else {
            if (MidsContext.Config?.WarnOnOldDbMbd) {
                const outDatedDb = Helpers.IsVersionNewer(
                    { major: metaData.DatabaseVersion.major, minor: metaData.DatabaseVersion.minor, build: metaData.DatabaseVersion.build, revision: metaData.DatabaseVersion.revision },
                    { major: DatabaseAPI.Database.Version.major || 0, minor: DatabaseAPI.Database.Version.minor || 0, build: DatabaseAPI.Database.Version.build || 0, revision: DatabaseAPI.Database.Version.revision || 0 }
                );
                const newerDb = Helpers.IsVersionNewer(
                    { major: DatabaseAPI.Database.Version.major || 0, minor: DatabaseAPI.Database.Version.minor || 0, build: DatabaseAPI.Database.Version.build || 0, revision: DatabaseAPI.Database.Version.revision || 0 },
                    { major: metaData.DatabaseVersion.major, minor: metaData.DatabaseVersion.minor, build: metaData.DatabaseVersion.build, revision: metaData.DatabaseVersion.revision }
                );
                let continueLoad = false;

                if (outDatedDb) {
                    if (preferences.ShouldSkipWarning('import')) {
                        continueLoad = true;
                    } else {
                        const result = confirm(
                            `This build was created in an older version of the ${metaData.Database} database.\r\nSome powers and/or enhancements may have changed, you may need to rebuild some of it.`
                        );
                        if (result) {
                            continueLoad = true;
                        }
                    }
                }

                if (newerDb) {
                    if (preferences.ShouldSkipWarning('import')) {
                        continueLoad = true;
                    } else {
                        const result = confirm(
                            `This build was created in an newer version of the ${metaData.Database} database.\r\nIt is recommended that you update the database.`
                        );
                        if (result) {
                            continueLoad = true;
                        }
                    }
                }

                if (!outDatedDb && !newerDb) continueLoad = true;

                if (continueLoad) {
                    return this.BuildData.LoadBuild();
                }
            } else {
                return this.BuildData.LoadBuild();
            }
        }
        throw new Error('Failed to load build data');
    }

    SerializeBuild(character: Character): string {
        this.BuildData?.Update(character);
        return JSON.stringify(this.BuildData, null, 2);
    }

    async SaveToFile(character: Character | null, fileName: string | null): Promise<boolean> {
        if (!fileName || fileName.trim() === '') return false;
        if (character === null || character.CurrentBuild === null) return false;
        const powerEntries = character.CurrentBuild.Powers.slice(0, 24);
        if (powerEntries.every(x => x?.Power === null)) {
            throw new Error("Unable to save build, you haven't selected any powers.");
        }

        this.BuildData?.Update(character);
        const serialized = JSON.stringify(this.BuildData, null, 2);

        // File.WriteAllText is C# specific
        // In a web environment, this would use FileWriter API or download
        try {
            const blob = new Blob([serialized], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (ex: any) {
            throw new Error(`Failed to save file: ${ex.message}`);
        }
    }

    async GetShareData(): Promise<string> {
        return this.BuildData !== null ? await this.BuildData.GenerateShareData() : '';
    }

    async GetDataChunk(): Promise<string> {
        return this.BuildData !== null ? await this.BuildData.GenerateChunkData() : '';
    }

    private LoadShareData(data: string | null, id: string | null = null): Character {
        if (!data || data.trim() === '') {
            throw new Error('Data is required');
        }
        try {
            const parsed = JSON.parse(data);
            this.BuildData = this.DeserializeCharacterBuildData(parsed);
            if (this.BuildData === null) {
                throw new Error('Failed to deserialize build data');
            }
            if (id !== null) this.BuildData.Id = id;
        } catch (ex: any) {
            throw new Error(ex.message);
        }

        if (this.BuildData === null) {
            throw new Error(`Cannot load share data - An error occurred during reading build data.\r\n\r\nBuildData`);
        }

        const metaData = this.BuildData.BuiltWith;
        if (metaData === null) {
            throw new Error(`Cannot load share data - An error occurred during reading build metadata.\r\n\r\nmetaData`);
        }

        if (DatabaseAPI.DatabaseName !== metaData.Database) {
            // Directory.EnumerateDirectories is C# specific
            throw new Error(`This build requires the ${metaData.Database} be installed prior to loading it.\r\nPlease install the database and try again.`);
        }

        // Compare Database Version if Enabled
        if (MidsContext.Config?.WarnOnOldDbMbd) {
            const outDatedDb = Helpers.IsVersionNewer(DatabaseAPI.Database.Version, metaData.DatabaseVersion);
            const newerDb = Helpers.IsVersionNewer(metaData.DatabaseVersion, DatabaseAPI.Database.Version);
            let continueLoad = false;

            if (outDatedDb) {
                const result = confirm(
                    `This build was created in an older version of the ${metaData.Database} database.\r\nSome powers and/or enhancements may have changed, you may need to rebuild some of it.`,
                );
                continueLoad = result;
            }

            if (newerDb) {
                const result = confirm(
                    `This build was created in an newer version of the ${metaData.Database} database.\r\nIt is recommended that you update the database.`,
                );
                continueLoad = result;
            }

            if (!outDatedDb && !newerDb) continueLoad = true;

            if (continueLoad) {
                return this.BuildData.LoadBuild();
            }
        } else {
            return this.BuildData.LoadBuild();
        }
        throw new Error('Failed to load share data');
    }

    async ValidateAndLoadImportData(classificationResult: ClassificationResult): Promise<Character> {
        if (!classificationResult.IsValid) {
            throw new Error('Invalid or unknown data format.');
        }

        let uncompressedSize = -1;
        let compressedSize = -1;
        let data = '';

        switch (classificationResult.Type) {
            case DataType.Mbd:
            case DataType.Mxd:
                // Split input to separate header and data
                const lines = classificationResult.Content.split(/[\r\n]+/).filter(l => l.trim() !== '');
                if (lines.length < 2) {
                    throw new Error('Input format is incorrect. No data found after header.');
                }

                if (lines.length <= 0) {
                    throw new Error('Input format is incorrect. No data found after header.');
                }
                // Clean the header by removing surrounding pipes and trimming whitespace
                const header = lines[0].trim().replace(/^\|+|\|+$/g, '').trim();
                const headerItems = header.split(';').filter(item => item.trim() !== '');
                if (headerItems.length !== 5) {
                    throw new Error('Header format is incorrect.');
                }

                try {
                    uncompressedSize = parseInt(headerItems[1], 10);
                    compressedSize = parseInt(headerItems[2], 10);
                } catch (ex: any) {
                    throw new Error('Header contains invalid size information.');
                }

                data = lines.slice(1).join('').replace(/\|/g, '');
                break;
            case DataType.UnkBase64:
                data = classificationResult.Content.trim();
                break;
            case DataType.Unknown:
            default:
                break;
        }

        // Process data based on the type determined by the classification
        switch (classificationResult.Type) {
            case DataType.Mxd:
                // Process as HEX
                if (!/^[0-9A-F]+$/i.test(data)) {
                    throw new Error('Data does not contain valid HEX values.');
                }

                try {
                    const decodedBytes = ModernZlib.HexDecodeBytes(new TextEncoder().encode(data));
                    if (decodedBytes.length !== compressedSize) {
                        throw new Error('Compressed size mismatch.');
                    }

                    const decompressedBytes = ModernZlib.DecompressChunk(decodedBytes, uncompressedSize);
                    // Now use the decompressed bytes with the MxDReadSaveData method
                    return MidsCharacterFileFormat.MxDReadSaveData(decompressedBytes, false);
                } catch (ex: any) {
                    throw new Error(`Failed to process MxD data: ${ex.message}`);
                }

            case DataType.Mbd:
                // Process as Base64
                if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
                    throw new Error('Data is not valid BASE64.');
                }

                try {
                    const decoded = await Compression.DecompressFromBase64(data);
                    if (decoded.CompressedSize === compressedSize) {
                        return this.LoadShareData(decoded.OutString);
                    }
                    throw new Error('Compressed size mismatch.');
                } catch (ex: any) {
                    throw new Error(`Failed to process MBD data: ${ex.message}`);
                }

            case DataType.UnkBase64:
                if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
                    throw new Error('Data is not valid BASE64.');
                }

                try {
                    const unkDecoded = await Compression.DecompressFromBase64(data);
                    return this.LoadShareData(unkDecoded.OutString);
                } catch (ex: any) {
                    throw new Error('An unknown error occurred.');
                }

            case DataType.Unknown:
                break;
            default:
                throw new Error('Unsupported data type detected.');
        }

        throw new Error('Failed to load import data');
    }

    async ValidateAndLoadSchemaData(data: string, id: string | null = null): Promise<Character> {
        if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
            throw new Error('Data is not valid BASE64.');
        }
        try {
            const decoded = await Compression.DecompressFromBase64(data);
            return this.LoadShareData(decoded.OutString, id);
        } catch (ex: any) {
            throw new Error(`Failed to process schema data: ${ex.message}`);
        }
    }

    private async LoadFromImportContent(content: string): Promise<Toon> {
        const data = this.ExtractImportData(content);

        const classification = DataClassifier.ClassifyAndExtractData(data);
        if (!classification.IsValid) {
            throw new Error('Failed to parse build data: unrecognized format');
        }

        // Ensure MidsContext.Character is initialized for MxDReadSaveData
        if (!MidsContext.Character) {
            MidsContext.Character = new Toon();
        }

        const character = await this.ValidateAndLoadImportData(classification);
        return character as Toon;
    }

    private ExtractImportData(content: string): string {
        const lines = content.split(/\r?\n/);
        const startIdx = lines.findIndex(
            (l) => l.startsWith('|MxDz;') || l.startsWith('|MBD;')
        );
        if (startIdx === -1) {
            return content;
        }

        const separator = '|-------------------------------------------------------------------|';
        const endIdx = lines.indexOf(separator, startIdx + 1);
        if (endIdx === -1) {
            return lines.slice(startIdx).join('\r\n');
        }

        return lines.slice(startIdx, endIdx).join('\r\n');
    }

    private DeserializeCharacterBuildData(parsed: CharacterBuildData): CharacterBuildData | null {
        try {
            const buildData = new CharacterBuildData();
            buildData.Id = parsed.Id || null;
            buildData.Level = parsed.Level || '';
            buildData.Class = parsed.Class || '';
            buildData.Origin = parsed.Origin || '';
            buildData.Alignment = parsed.Alignment || '';
            buildData.Name = parsed.Name || '';
            buildData.Comment = parsed.Comment || null;
            buildData.PowerSets = parsed.PowerSets || [];
            buildData.LastPower = parsed.LastPower || 0;
            buildData.BuiltWith = parsed.BuiltWith || null;

            buildData.PowerEntries = (parsed.PowerEntries || []).map(powerEntry => {
                if (powerEntry === null) return null;
                return {
                    ...powerEntry,
                    SlotEntries: (powerEntry.SlotEntries || []).map(slot => ({
                        ...slot,
                        Enhancement: EnhancementDataConverter.ReadJson(slot.Enhancement),
                        FlippedEnhancement: EnhancementDataConverter.ReadJson(slot.FlippedEnhancement),
                    })),
                };
            });

            return buildData;
        } catch (ex: any) {
            console.error('Failed to deserialize CharacterBuildData:', ex);
            return null;
        }
    }
}

