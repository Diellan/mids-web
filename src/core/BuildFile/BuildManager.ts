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
import { IBuildNotifier, BuildNotifier, DialogResult } from './BuildNotifier';
import { BuildPreferences } from './BuildPreferences';
import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { DatabaseAPI } from '../DatabaseAPI';
import { AppDataPaths } from '../AppDataPaths';
import { DataClassifier, DataType, ClassificationResult } from '../Utils/DataClassifier';
import { Compression, CompressionResult } from '../Utils/Compression';
import { ModernZlib } from '../Utils/ModernZlib';
import { Helpers } from '../Utils/Helpers';
// TODO: Import when available
// import { MidsCharacterFileFormat } from '../MidsCharacterFileFormat';

// Placeholder for MidsCharacterFileFormat
namespace MidsCharacterFileFormat {
    export function MxDReadSaveData(bytes: Uint8Array, flag: boolean): boolean {
        // TODO: Implement actual MxD file reading
        throw new Error('MidsCharacterFileFormat.MxDReadSaveData needs to be implemented');
    }
}

export class BuildManager {
    private static _lazyInstance: BuildManager | null = null;
    static get Instance(): BuildManager {
        if (BuildManager._lazyInstance === null) {
            BuildManager._lazyInstance = new BuildManager();
        }
        return BuildManager._lazyInstance;
    }

    BuildData: CharacterBuildData | null = null;
    private readonly _notifier: IBuildNotifier;
    private readonly _preferences: BuildPreferences;

    private constructor() {
        this.BuildData = CharacterBuildData.Instance;
        this._notifier = new BuildNotifier();
        this._preferences = BuildPreferences.Load();
    }

    async LoadFromFile(fileName: string | null): Promise<boolean> {
        if (!fileName || fileName.trim() === '') return false;
        let returnedVal = false;

        // File.ReadAllText is C# specific
        // In a web environment, this would use fetch or FileReader API
        let data: string;
        try {
            const response = await fetch(fileName);
            data = await response.text();
        } catch (ex: any) {
            this._notifier.ShowError(`Failed to read file: ${ex.message}`);
            return false;
        }

        try {
            // Custom JSON deserialization with EnhancementDataConverter
            const parsed = JSON.parse(data);
            this.BuildData = this.DeserializeCharacterBuildData(parsed);
            if (this.BuildData === null) {
                throw new Error('Failed to deserialize build data');
            }
        } catch (ex: any) {
            this._notifier.ShowError(ex.message);
        }

        if (this.BuildData === null) {
            this._notifier.ShowError(`Cannot load ${fileName} - error reading build data.\r\n\r\nBuildData`);
            return false;
        }

        const metaData = this.BuildData.BuiltWith;
        if (metaData === null) {
            this._notifier.ShowError(`Cannot load ${fileName} - error reading build metadata.\r\n\r\nmetaData`);
            return false;
        }

        // FileInfo is C# specific, using fileName directly
        if (DatabaseAPI.DatabaseName !== metaData.Database) {
            // Directory.EnumerateDirectories is C# specific
            // In a web environment, this would need to be handled differently
            // For now, show an error
            this._notifier.ShowError(`This build requires the ${metaData.Database} be installed prior to loading it.\r\nPlease install the database and try again.`);
            return false;

            // Application.Restart is Windows Forms specific and not available in web
            // const result = this._notifier.ShowWarningDialog(
            //     `This build was created using the ${metaData.Database} database.\r\nDo you want to reload and switch to this database, then attempt to load the build?`,
            //     fileName
            // );
            // if (result !== DialogResult.Yes) return returnedVal;
            // MidsContext.Config.LastFileName = fileName;
            // MidsContext.Config.DataPath = selected;
            // MidsContext.Config.SavePath = selected;
            // MidsContext.Config.SaveConfig();
            // Application.Restart();
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
                    if (this._preferences.ShouldSkipWarning(fileName)) {
                        continueLoad = true;
                    } else {
                        const result = this._notifier.ShowWarningDialog(
                            `This build was created in an older version of the ${metaData.Database} database.\r\nSome powers and/or enhancements may have changed, you may need to rebuild some of it.`,
                            'Warning',
                            true
                        );
                        switch (result) {
                            case DialogResult.Ignore:
                                this._preferences.AddIgnoredBuild(fileName);
                                continueLoad = true;
                                break;
                            case DialogResult.OK:
                                continueLoad = true;
                                break;
                        }
                    }
                }

                if (newerDb) {
                    if (this._preferences.ShouldSkipWarning(fileName)) {
                        continueLoad = true;
                    } else {
                        const result = this._notifier.ShowWarningDialog(
                            `This build was created in an newer version of the ${metaData.Database} database.\r\nIt is recommended that you update the database.`,
                            'Warning',
                            true
                        );
                        switch (result) {
                            case DialogResult.Ignore:
                                this._preferences.AddIgnoredBuild(fileName);
                                continueLoad = true;
                                break;
                            case DialogResult.OK:
                                continueLoad = true;
                                break;
                        }
                    }
                }

                if (!outDatedDb && !newerDb) continueLoad = true;

                if (continueLoad) {
                    returnedVal = this.BuildData.LoadBuild();
                }
            } else {
                returnedVal = this.BuildData.LoadBuild();
            }
        }

        return returnedVal;
    }

    async SaveToFile(fileName: string | null): Promise<boolean> {
        if (!fileName || fileName.trim() === '') return false;
        if (MidsContext.Character?.CurrentBuild === null) return false;
        const powerEntries = MidsContext.Character.CurrentBuild.Powers.slice(0, 24);
        if (powerEntries.every(x => x?.Power === null)) {
            this._notifier.ShowError("Unable to save build, you haven't selected any powers.");
            return false;
        }

        this.BuildData?.Update(MidsContext.Character);
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
            this._notifier.ShowError(`Failed to save file: ${ex.message}`);
            return false;
        }
    }

    async GetShareData(): Promise<string> {
        return this.BuildData !== null ? await this.BuildData.GenerateShareData() : '';
    }

    async GetDataChunk(): Promise<string> {
        return this.BuildData !== null ? await this.BuildData.GenerateChunkData() : '';
    }

    private LoadShareData(data: string | null, id: string | null = null): boolean {
        if (!data || data.trim() === '') return false;
        let returnedVal = false;
        try {
            const parsed = JSON.parse(data);
            this.BuildData = this.DeserializeCharacterBuildData(parsed);
            if (this.BuildData === null) {
                throw new Error('Failed to deserialize build data');
            }
            if (id !== null) this.BuildData.Id = id;
        } catch (ex: any) {
            this._notifier.ShowError(ex.message);
        }

        if (this.BuildData === null) {
            this._notifier.ShowError(`Cannot load share data - An error occurred during reading build data.\r\n\r\nBuildData`);
            return false;
        }

        const metaData = this.BuildData.BuiltWith;
        if (metaData === null) {
            this._notifier.ShowError(`Cannot load share data - An error occurred during reading build metadata.\r\n\r\nmetaData`);
            return false;
        }

        if (DatabaseAPI.DatabaseName !== metaData.Database) {
            // Directory.EnumerateDirectories is C# specific
            this._notifier.ShowError(`This build requires the ${metaData.Database} be installed prior to loading it.\r\nPlease install the database and try again.`);
            this._notifier.ShowWarning(`This build requires the ${metaData.Database}, however you are currently using the ${DatabaseAPI.DatabaseName} database. Please load the correct database and try again.`);
            return false;
        }

        // Compare Database Version if Enabled
        if (MidsContext.Config?.WarnOnOldDbMbd) {
            const outDatedDb = Helpers.IsVersionNewer(DatabaseAPI.Database.Version, metaData.DatabaseVersion);
            const newerDb = Helpers.IsVersionNewer(metaData.DatabaseVersion, DatabaseAPI.Database.Version);
            let continueLoad = false;

            if (outDatedDb) {
                const result = this._notifier.ShowWarningDialog(
                    `This build was created in an older version of the ${metaData.Database} database.\r\nSome powers and/or enhancements may have changed, you may need to rebuild some of it.`,
                    'Warning'
                );
                continueLoad = result === DialogResult.OK;
            }

            if (newerDb) {
                const result = this._notifier.ShowWarningDialog(
                    `This build was created in an newer version of the ${metaData.Database} database.\r\nIt is recommended that you update the database.`,
                    'Warning'
                );
                continueLoad = result === DialogResult.OK;
            }

            if (!outDatedDb && !newerDb) continueLoad = true;

            if (continueLoad) {
                returnedVal = this.BuildData.LoadBuild();
            }
        } else {
            returnedVal = this.BuildData.LoadBuild();
        }

        return returnedVal;
    }

    async ValidateAndLoadImportData(classificationResult: ClassificationResult): Promise<boolean> {
        if (!classificationResult.IsValid) {
            this._notifier.ShowError('Invalid or unknown data format.');
            return false;
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
                    this._notifier.ShowError('Input format is incorrect. No data found after header.');
                    return false;
                }

                if (lines.length <= 0) return false;
                // Clean the header by removing surrounding pipes and trimming whitespace
                const header = lines[0].trim().replace(/^\|+|\|+$/g, '').trim();
                const headerItems = header.split(';').filter(item => item.trim() !== '');
                if (headerItems.length !== 5) {
                    this._notifier.ShowError('Header format is incorrect.');
                    return false;
                }

                try {
                    uncompressedSize = parseInt(headerItems[1], 10);
                    compressedSize = parseInt(headerItems[2], 10);
                } catch (ex: any) {
                    this._notifier.ShowError('Header contains invalid size information.');
                    return false;
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
                    this._notifier.ShowError('Data does not contain valid HEX values.');
                    return false;
                }

                try {
                    const decodedBytes = ModernZlib.HexDecodeBytes(new TextEncoder().encode(data));
                    if (decodedBytes.length !== compressedSize) {
                        this._notifier.ShowError('Compressed size mismatch.');
                        return false;
                    }

                    const decompressedBytes = ModernZlib.DecompressChunk(decodedBytes, uncompressedSize);
                    // Now use the decompressed bytes with the MxDReadSaveData method
                    const loadSuccess = MidsCharacterFileFormat.MxDReadSaveData(decompressedBytes, false);
                    return loadSuccess;
                } catch (ex: any) {
                    this._notifier.ShowError(`Failed to process MxD data: ${ex.message}`);
                    return false;
                }

            case DataType.Mbd:
                // Process as Base64
                if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
                    this._notifier.ShowError('Data is not valid BASE64.');
                    return false;
                }

                try {
                    const decoded = await Compression.DecompressFromBase64(data);
                    if (decoded.CompressedSize === compressedSize) return this.LoadShareData(decoded.OutString);
                    this._notifier.ShowError('Compressed size mismatch.');
                    return false;
                } catch (ex: any) {
                    this._notifier.ShowError(`Failed to process MBD data: ${ex.message}`);
                    return false;
                }

            case DataType.UnkBase64:
                if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
                    this._notifier.ShowError('Data is not valid BASE64.');
                    return false;
                }

                try {
                    const unkDecoded = await Compression.DecompressFromBase64(data);
                    return this.LoadShareData(unkDecoded.OutString);
                } catch (ex: any) {
                    this._notifier.ShowError('An unknown error occurred.');
                    return false;
                }

            case DataType.Unknown:
                break;
            default:
                this._notifier.ShowError('Unsupported data type detected.');
                return false;
        }

        return false;
    }

    async ValidateAndLoadSchemaData(data: string, id: string | null = null): Promise<boolean> {
        if (!/^[a-zA-Z0-9+/]*={0,3}$/.test(data)) {
            this._notifier.ShowError('Data is not valid BASE64.');
            return false;
        }
        try {
            const decoded = await Compression.DecompressFromBase64(data);
            return this.LoadShareData(decoded.OutString, id);
        } catch (ex: any) {
            this._notifier.ShowError(`Failed to process schema data: ${ex.message}`);
            return false;
        }
    }

    private DeserializeCharacterBuildData(parsed: any): CharacterBuildData | null {
        // Custom deserialization with EnhancementDataConverter
        // This is a simplified version - full implementation would need proper JSON converter handling
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
            buildData.PowerEntries = (parsed.PowerEntries || []).map((pe: any) => {
                if (pe === null) return null;
                // Use EnhancementDataConverter for slot entries
                // This is simplified - full implementation would properly convert EnhancementData
                return pe;
            });
            // BuiltWith would need proper deserialization
            if (parsed.BuiltWith) {
                // buildData.BuiltWith = ...;
            }
            return buildData;
        } catch (ex: any) {
            console.error('Failed to deserialize CharacterBuildData:', ex);
            return null;
        }
    }
}

