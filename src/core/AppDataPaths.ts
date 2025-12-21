// Converted from C# AppDataPaths.cs
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { DatabaseAPI } from './DatabaseAPI';

const path = {
  join: (...paths: string[]) => paths.join('/'),
};

export class AppDataPaths {
  static readonly MxdbFileDb = 'I12.mhd';
  static readonly MxdbFileNLevels = 'NLevels.mhd';
  static readonly MxdbFileRLevels = 'RLevels.mhd';
  static readonly MxdbFileMaths = 'Maths.mhd';
  static readonly MxdbFileEClasses = 'EClasses.mhd';
  static readonly MxdbFileOrigins = 'Origins.mhd';
  static readonly MxdbFileSalvage = 'Salvage.mhd';
  static readonly MxdbFileRecipe = 'Recipe.mhd';
  static readonly MxdbFileEnhDb = 'EnhDB.mhd';
  static readonly MxdbFileOverrides = 'Compare.mhd';
  static readonly MxdbFileModifiers = 'AttribMod.mhd';
  static readonly MxdbFileEffectIds = 'GlobalMods.mhd';
  static readonly MxdbFileSd = 'SData.mhd';

  static readonly ServerDataFile = 'SData.json';
  static readonly JsonFileModifiers = 'AttribMod.json';
  static readonly JsonFileTypeGrades = 'TypeGrades.json';
  private static readonly JsonFileConfig = 'appSettings.json';

  static readonly MxdbPowersReplTable = 'PowersReplTable.mhd';
  static readonly MxdbCrypticReplTable = 'CrypticPowerNames.mhd';

  static readonly RoamingFolder = 'Databases';
  static readonly BuildsFolder = 'Hero & Villain Builds';

  static FileData: string = '';

  /**
   * Gets the application base directory.
   * In Electron: uses app.getAppPath() if available
   * In Node.js: uses process.cwd() or __dirname
   */
  private static getBaseDirectory(): string {
    // Try to use Electron app.getAppPath() if available
    try {
      // Check if we're in Electron context
      if (typeof window !== 'undefined' && (window as any).electron) {
        // In renderer process, would need IPC call
        // For now, fall back to process.cwd()
      }
      // In main process or Node.js, try to get app path
      if (typeof process !== 'undefined' && (process as any).type === 'browser') {
        // Electron main process - would need to import electron.app
        // For now, use process.cwd() or __dirname
      }
    } catch {
      // Not in Electron context
    }
    
    // Fallback to process.cwd() or use __dirname equivalent
    // In Node.js/Electron, __dirname is available in CommonJS
    // In ES modules, we need to use import.meta.url
    if (typeof __dirname !== 'undefined') {
      return __dirname;
    }
    
    // For ES modules, try to get directory from import.meta.url
    // But since this is a class, we'll use process.cwd() as fallback
    return process.cwd();
  }

  /**
   * Gets the user's Documents folder path
   */
  private static getDocumentsPath(): string {
    // Try Electron app.getPath('documents') if available
    try {
      if (typeof process !== 'undefined' && (process as any).type === 'browser') {
        // Would need: const { app } = require('electron');
        // return app.getPath('documents');
      }
    } catch {
      // Not in Electron context
    }
    
    // Fallback to os.homedir() + Documents
    const homeDir = '';
    if (process?.platform === 'win32') {
      return path.join(homeDir, 'Documents');
    } else if (process?.platform === 'darwin') {
      return path.join(homeDir, 'Documents');
    } else {
      // Linux - Documents folder
      return path.join(homeDir, 'Documents');
    }
  }

  /**
   * Checks if debugger is attached (equivalent to Debugger.IsAttached in C#)
   */
  private static isDebugMode(): boolean {
    if (typeof process === 'undefined') {
      return false;
    }
    return process?.env?.NODE_ENV === 'development' || 
           process?.env?.VSCODE_DEBUG === 'true' ||
           !!process?.env?.DEBUG;
  }

  static get FNameJsonConfig(): string {
    return this.JsonFileConfig;
  }

  static get FDefaultPath(): string | null {
    return this.RoamingFolder + '/Homecoming';
    // const baseDir = this.getBaseDirectory();
    // const roamingPath = path.join(baseDir, this.RoamingFolder, 'Homecoming');
    // return roamingPath;
  }

  private static get FPathAppData(): string | null {
    return MidsContext.Config?.DataPath ?? this.FDefaultPath;
  }

  static get FNamePowersRepl(): string {
    const appDataPath = this.FPathAppData;
    if (!appDataPath) {
      return '';
    }
    return path.join(appDataPath, this.MxdbPowersReplTable);
  }

  static get FDefaultBuildsPath(): string {
    return this.BuildsFolder;
    // const documentsPath = this.getDocumentsPath();
    // return path.join(documentsPath, this.BuildsFolder);
  }

  static get CNamePowersRepl(): string {
    const appDataPath = this.FPathAppData;
    if (!appDataPath) {
      return '';
    }
    return path.join(appDataPath, this.MxdbCrypticReplTable);
  }

  static get BaseDataPath(): string {
    return path.join(this.getBaseDirectory(), this.RoamingFolder);
  }

  static SelectDataFileLoad(iDataFile: string, iPath: string = ''): string {
    let filePath: string;
    
    if (iPath && iPath.trim() !== '') {
      filePath = path.join(iPath, iDataFile);
    } else {
      const appDataPath = this.FPathAppData;
      if (!appDataPath) {
        filePath = path.join(this.getBaseDirectory(), this.RoamingFolder, iDataFile);
      } else {
        filePath = path.join(appDataPath, iDataFile);
      }
    }

    // In debug mode, use a different path structure (similar to C# Debugger.IsAttached)
    if (this.isDebugMode()) {
      const basePath = this.getBaseDirectory();
      const databaseName = DatabaseAPI.DatabaseName || 'Homecoming';
      filePath = path.join(basePath, this.RoamingFolder, databaseName, iDataFile);
    }

    this.FileData += `${filePath}\n`;
    return filePath;
  }

  static SelectDataFileSave(iDataFile: string, iPath: string = ''): string {
    const appDataPath = this.FPathAppData;
    if (!appDataPath && !iPath) {
      throw new Error('Cannot determine save path: FPathAppData is null and no iPath provided');
    }

    let filePath: string;
    
    if (iPath && iPath.trim() !== '') {
      filePath = path.join(iPath, iDataFile);
    } else {
      filePath = path.join(appDataPath!, iDataFile);
    }

    // In debug mode, use a different path structure
    if (this.isDebugMode()) {
      const basePath = this.getBaseDirectory();
      const databaseName = DatabaseAPI.DatabaseName || 'Homecoming';
      filePath = path.join(basePath, this.RoamingFolder, databaseName, iDataFile);
    }

    return filePath;
  }

  static readonly Headers = {
    VersionComment: 'Version:',
    Db: {
      Start: "Mids Reborn Powers Database",
      Archetypes: "BEGIN:ARCHETYPES",
      Powersets: "BEGIN:POWERSETS",
      Powers: "BEGIN:POWERS",
      Summons: "BEGIN:SUMMONS"
    },
    EnhDb: {
      Start: "Mids Reborn Enhancement Database"
    },
    Salvage: {
      Start: "Mids Reborn Salvage Database"
    },
    Recipe: {
      Start: "Mids Reborn Recipe Database"
    },
    AttribMod: {
      Start: "Mids Reborn Attribute Modifier Tables"
    },
    TypeGrade: {
      Start: "Mids Reborn Types and Grades"
    },
    ServerData: {
      Start: "Mids Reborn Server Data"
    },
    Save: {
      Compressed: "MRBz",
      Uncompressed: "ToonDataVersion",
      LegacyCompressed: "MHDz",
      LegacyUncompressed: "HeroDataVersion"
    }
  };

  static readonly Version = {
    Save: 1.4,
    Config: 1.32
  };
}

