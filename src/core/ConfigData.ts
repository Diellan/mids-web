// Converted from C# ConfigData.cs
import { AppDataPaths } from './AppDataPaths';
import { Serializer } from './Serializer';
import { DatabaseAPI } from './DatabaseAPI';
import {
  eSpeedMeasure,
  eColumnStacking,
  eEnhGrade,
  eEnhRelative,
  eDDGraph,
  GraphStyle,
  CompOverride,
  dmModes,
  dmItem,
  eVisibleSize,
  eSuppress,
  WordwrapMode,
  RewardCurrency,
  eColorSetting,
  eFontSizeSetting
} from './Enums';
import { Tips } from './Tips';
import { ExportConfig } from './ExportConfig';
import { ShareConfig } from './ShareConfig';
import { RawSaveResult } from './Schema';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { showWarning } from './showWarning';

// ISerialize interface (if not already defined in Serializer.ts)
export interface ISerialize {
  Extension: string;
  Serialize(o: any): string;
  Deserialize<T>(x: string): T;
}

// Enums
export enum EDamageMath {
  Minimum,
  Average,
  Max
}

export enum EDamageReturn {
  Numeric,
  DPS,
  DPA
}

export enum PrintOptionProfile {
  None,
  SinglePage,
  MultiPage
}

export enum ETotalsWindowTitleStyle {
  Generic,
  CharNameAtPowersets,
  BuildFileAtPowersets,
  CharNameBuildFile
}

export enum AutoUpdType {
  None,
  Disabled,
  Delay,
  Startup
}

export enum Modes {
  User,
  DbAdmin,
  AppAdmin
}

// Simple color representation (replacing System.Drawing.Color)
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

// Simple point representation (replacing System.Drawing.Point)
export interface Point {
  x: number;
  y: number;
}

// Simple rectangle representation (replacing System.Drawing.Rectangle)
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Nested classes
export class AutoUpdate {
  get Enabled(): boolean {
    return this.Type === AutoUpdType.Delay || this.Type === AutoUpdType.Startup;
  }

  Type: AutoUpdType;
  Delay: number;
  LastChecked: Date | null;

  constructor(type: AutoUpdType, delay: number = 3) {
    this.Type = type;
    this.Delay = delay;
    this.LastChecked = null;
  }
}

export class SDamageMath {
  Calculate: EDamageMath;
  ReturnValue: EDamageReturn;

  constructor(dmgMath?: EDamageMath, dmgRet?: EDamageReturn) {
    this.Calculate = dmgMath ?? EDamageMath.Average;
    this.ReturnValue = dmgRet ?? EDamageReturn.Numeric;
  }
}

export class IncludeExclude {
  DisablePvE: boolean = false;
}

export class Si9 {
  DefaultIOLevel: number = 49;
  HideIOLevels: boolean = false;
  IgnoreEnhFX: boolean = false;
  IgnoreSetBonusFX: boolean = false;
  DisablePrintIOLevels: boolean = false;
  ExportIOLevels: boolean = false;
  ExportStripSetNames: boolean = false;
  ExportStripEnh: boolean = false;
}

export class CombatContext {
  static GetConfigChunkName(condChunk: string): string {
    switch (condChunk.toLowerCase()) {
      case 'player':
        return 'PlayerSettings';
      case 'target':
        return 'TargetSettings';
      case 'hp':
        return 'HpPercent';
      case 'end':
        return 'EndPercent';
      case 'isalive':
        return 'IsAlive';
      default:
        return '';
    }
  }

  static ConfigChunkType(condChunk: string): string {
    switch (condChunk.toLowerCase()) {
      case 'isalive':
        return 'bool';
      default:
        return 'int';
    }
  }

  static FormatSettingName(setting: string): string {
    let formatted = setting
      .toLowerCase()
      .replace('cfg.', '')
      .replace('settings', '')
      .replace('percent', '%')
      .replace('.', ' ');
    // Title case
    formatted = formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return formatted.replace('Isalive', 'IsAlive');
  }

  static EnumerateFields(obj: any, prefix: string = 'cfg'): string[] {
    const settings: string[] = [];
    const objType = typeof obj;

    if (objType === 'object' && obj !== null) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          const valueType = typeof value;

          // Check if it's a nested object (not a primitive or array)
          if (
            valueType === 'object' &&
            value !== null &&
            !Array.isArray(value) &&
            !(value instanceof Date)
          ) {
            settings.push(...this.EnumerateFields(value, `${prefix}.${key}`));
          } else {
            settings.push(`${prefix}.${key.toLowerCase()}`);
          }
        }
      }
    }

    return settings;
  }

  PlayerSettings: CombatContext.Player = new CombatContext.Player();
  TargetSettings: CombatContext.Target = new CombatContext.Target();
}

export namespace CombatContext {
  export class Player {
    HpPercent: number = 100;
    EndPercent: number = 100;
    IsAlive: boolean = true;
  }

  export class Target {
    HpPercent: number = 100;
    EndPercent: number = 100;
  }
}

export class FontSettings {
  RTFBase: number = 16;
  RTFBold: boolean = true;
  ColorBackgroundHero: Color = { r: 0, g: 0, b: 32 };
  ColorBackgroundVillain: Color = { r: 32, g: 0, b: 0 };
  ColorText: Color = { r: 255, g: 255, b: 255 };
  ColorInvention: Color = { r: 0, g: 255, b: 255 };
  ColorInventionInv: Color = { r: 0, g: 0, b: 128 };
  ColorFaded: Color = { r: 192, g: 192, b: 192 };
  ColorEnhancement: Color = { r: 0, g: 255, b: 0 };
  ColorWarning: Color = { r: 255, g: 0, b: 0 };
  ColorPlName: Color = { r: 192, g: 192, b: 255 };
  ColorPlSpecial: Color = { r: 128, g: 128, b: 255 };
  ColorPowerAvailable: Color = { r: 255, g: 215, b: 0 };
  ColorPowerDisabled: Color = { r: 211, g: 211, b: 211 };
  ColorPowerTakenHero: Color = { r: 116, g: 168, b: 234 };
  ColorPowerTakenDarkHero: Color = { r: 30, g: 144, b: 255 };
  ColorPowerHighlightHero: Color = { r: 64, g: 64, b: 96 };
  ColorPowerTakenVillain: Color = { r: 191, g: 74, b: 56 };
  ColorPowerTakenDarkVillain: Color = { r: 128, g: 0, b: 0 };
  ColorPowerHighlightVillain: Color = { r: 96, g: 64, b: 64 };
  ColorDamageBarBase: Color = { r: 255, g: 194, b: 194 };
  ColorDamageBarEnh: Color = { r: 181, g: 0, b: 0 };
  PairedBold: boolean = false;
  PairedBase: number = 8.25;
  PowersSelectBold: boolean = false;
  PowersSelectBase: number = 9.25;
  PowersBold: boolean = true;
  PowersBase: number = 9.25;

  Assign(iFs: FontSettings): void {
    this.RTFBase = iFs.RTFBase;
    this.RTFBold = iFs.RTFBold;
    this.ColorBackgroundHero = { ...iFs.ColorBackgroundHero };
    this.ColorBackgroundVillain = { ...iFs.ColorBackgroundVillain };
    this.ColorText = { ...iFs.ColorText };
    this.ColorInvention = { ...iFs.ColorInvention };
    this.ColorInventionInv = { ...iFs.ColorInventionInv };
    this.ColorFaded = { ...iFs.ColorFaded };
    this.ColorEnhancement = { ...iFs.ColorEnhancement };
    this.ColorWarning = { ...iFs.ColorWarning };
    this.ColorPlName = { ...iFs.ColorPlName };
    this.ColorPlSpecial = { ...iFs.ColorPlSpecial };
    this.ColorPowerAvailable = { ...iFs.ColorPowerAvailable };
    this.ColorPowerDisabled = { ...iFs.ColorPowerDisabled };
    this.ColorPowerTakenHero = { ...iFs.ColorPowerTakenHero };
    this.ColorPowerTakenDarkHero = { ...iFs.ColorPowerTakenDarkHero };
    this.ColorPowerHighlightHero = { ...iFs.ColorPowerHighlightHero };
    this.ColorPowerTakenVillain = { ...iFs.ColorPowerTakenVillain };
    this.ColorPowerTakenDarkVillain = { ...iFs.ColorPowerTakenDarkVillain };
    this.ColorPowerHighlightVillain = { ...iFs.ColorPowerHighlightVillain };
    this.ColorDamageBarBase = { ...iFs.ColorDamageBarBase };
    this.ColorDamageBarEnh = { ...iFs.ColorDamageBarEnh };
    this.PairedBold = iFs.PairedBold;
    this.PairedBase = iFs.PairedBase;
    this.PowersSelectBase = iFs.PowersSelectBase;
    this.PowersSelectBold = iFs.PowersSelectBold;
    this.PowersBase = iFs.PowersBase;
    this.PowersBold = iFs.PowersBold;
  }

  ValidFontSize(fntSize: number): boolean {
    return fntSize >= 6 && fntSize <= 14;
  }

  GetDefaultColorSetting(clSetting: eColorSetting): Color {
    switch (clSetting) {
      case eColorSetting.ColorBackgroundHero:
        return { r: 0, g: 0, b: 32 };
      case eColorSetting.ColorBackgroundVillain:
        return { r: 32, g: 0, b: 0 };
      case eColorSetting.ColorText:
        return { r: 255, g: 255, b: 255 };
      case eColorSetting.ColorInvention:
        return { r: 0, g: 255, b: 255 };
      case eColorSetting.ColorInventionInv:
        return { r: 0, g: 0, b: 128 };
      case eColorSetting.ColorFaded:
        return { r: 192, g: 192, b: 192 };
      case eColorSetting.ColorEnhancement:
        return { r: 0, g: 255, b: 0 };
      case eColorSetting.ColorWarning:
        return { r: 255, g: 0, b: 0 };
      case eColorSetting.ColorPlName:
        return { r: 192, g: 192, b: 255 };
      case eColorSetting.ColorPlSpecial:
        return { r: 128, g: 128, b: 255 };
      case eColorSetting.ColorPowerAvailable:
        return { r: 255, g: 215, b: 0 };
      case eColorSetting.ColorPowerDisabled:
        return { r: 211, g: 211, b: 211 };
      case eColorSetting.ColorPowerTakenHero:
        return { r: 116, g: 168, b: 234 };
      case eColorSetting.ColorPowerTakenDarkHero:
        return { r: 30, g: 144, b: 255 };
      case eColorSetting.ColorPowerHighlightHero:
        return { r: 64, g: 64, b: 96 };
      case eColorSetting.ColorPowerTakenVillain:
        return { r: 191, g: 74, b: 56 };
      case eColorSetting.ColorPowerTakenDarkVillain:
        return { r: 128, g: 0, b: 0 };
      case eColorSetting.ColorPowerHighlightVillain:
        return { r: 96, g: 64, b: 64 };
      case eColorSetting.ColorDamageBarBase:
        return { r: 255, g: 194, b: 194 };
      case eColorSetting.ColorDamageBarEnh:
        return { r: 181, g: 0, b: 0 };
      default:
        return { r: 0, g: 0, b: 0 };
    }
  }

  GetDefaultFontSizeSetting(fntSetting: eFontSizeSetting): number {
    switch (fntSetting) {
      case eFontSizeSetting.PairedBase:
        return 8.25;
      case eFontSizeSetting.PowersSelectBase:
        return 9.25;
      case eFontSizeSetting.PowersBase:
        return 9.25;
      default:
        return 8.5;
    }
  }

  SetDefault(): void {
    this.RTFBase = 16;
    this.RTFBold = true;
    this.ColorBackgroundHero = this.GetDefaultColorSetting(
      eColorSetting.ColorBackgroundHero
    );
    this.ColorBackgroundVillain = this.GetDefaultColorSetting(
      eColorSetting.ColorBackgroundVillain
    );
    this.ColorText = this.GetDefaultColorSetting(eColorSetting.ColorText);
    this.ColorInvention = this.GetDefaultColorSetting(
      eColorSetting.ColorInvention
    );
    this.ColorInventionInv = this.GetDefaultColorSetting(
      eColorSetting.ColorInventionInv
    );
    this.ColorFaded = this.GetDefaultColorSetting(eColorSetting.ColorFaded);
    this.ColorEnhancement = this.GetDefaultColorSetting(
      eColorSetting.ColorEnhancement
    );
    this.ColorWarning = this.GetDefaultColorSetting(eColorSetting.ColorWarning);
    this.ColorPlName = this.GetDefaultColorSetting(eColorSetting.ColorPlName);
    this.ColorPlSpecial = this.GetDefaultColorSetting(
      eColorSetting.ColorPlSpecial
    );
    this.ColorPowerAvailable = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerAvailable
    );
    this.ColorPowerDisabled = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerDisabled
    );
    this.ColorPowerTakenHero = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerTakenHero
    );
    this.ColorPowerTakenDarkHero = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerTakenDarkHero
    );
    this.ColorPowerHighlightHero = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerHighlightHero
    );
    this.ColorPowerTakenVillain = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerTakenVillain
    );
    this.ColorPowerTakenDarkVillain = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerTakenDarkVillain
    );
    this.ColorPowerHighlightVillain = this.GetDefaultColorSetting(
      eColorSetting.ColorPowerHighlightVillain
    );
    this.ColorDamageBarBase = this.GetDefaultColorSetting(
      eColorSetting.ColorDamageBarBase
    );
    this.ColorDamageBarEnh = this.GetDefaultColorSetting(
      eColorSetting.ColorDamageBarEnh
    );
    this.PairedBase = this.GetDefaultFontSizeSetting(
      eFontSizeSetting.PairedBase
    );
    this.PairedBold = false;
    this.PowersSelectBase = this.GetDefaultFontSizeSetting(
      eFontSizeSetting.PowersSelectBase
    );
    this.PowersSelectBold = false;
    this.PowersBase = this.GetDefaultFontSizeSetting(
      eFontSizeSetting.PowersBase
    );
    this.PowersBold = true;
  }
}

// Main ConfigData class
export class ConfigData {
  private static Instance: ConfigData | null = null;
  private static readonly OverrideNames = 'Mids Reborn Comparison Overrides';

  FirstRun: boolean = false;
  AutomaticUpdates: AutoUpdate;
  readonly DragDropScenarioAction: number[] = [
    3, 0, 5, 0, 3, 5, 0, 0, 5, 0, 2, 3, 0, 2, 2, 0, 0, 0, 0, 0
  ];
  SpeedFormat: eSpeedMeasure = eSpeedMeasure.MilesPerHour;
  CoDEffectFormat: boolean = false;
  DamageMath: SDamageMath = new SDamageMath();
  Inc: IncludeExclude = new IncludeExclude();
  I9: Si9 = new Si9();
  RtFont: FontSettings = new FontSettings();
  TeamMembers: Map<string, number> = new Map();
  WindowState: string | null = null;
  Bounds: Rectangle = { x: 0, y: 0, width: 0, height: 0 };
  UseOldTotalsWindow: boolean = false;
  ScalingToHit: number = 0.75; // Default, will be set from ServerData when available
  ExempHigh: number = 50;
  TeamSize: number = 1;
  ExempLow: number = 50;
  ForceLevel: number = 50;
  ExportScheme: number = 1;
  ExportTarget: number = 1;
  DisableDataDamageGraph: boolean = false;
  DisableVillainColors: boolean = false;
  IsInitialized: boolean = false;
  Columns: number = 3;
  ColumnStackingMode: eColumnStacking = eColumnStacking.None;
  PrintProfile: PrintOptionProfile = PrintOptionProfile.SinglePage;
  DisablePrintProfileEnh: boolean = false;
  LastPrinter: string = '';
  DisableLoadLastFileOnStart: boolean = false;
  LastFileName: string | null = '';
  CalcEnhOrigin: eEnhGrade = eEnhGrade.SingleO;
  CalcEnhLevel: eEnhRelative = eEnhRelative.Even;
  DataGraphType: eDDGraph = eDDGraph.Both;
  StatGraphStyle: GraphStyle = GraphStyle.Stacked;
  CompOverride: CompOverride[] = [];
  ShowSlotsLeft: boolean = false;
  DisableDesaturateInherent: boolean = false;
  BuildMode: dmModes = dmModes.Normal;
  BuildOption: dmItem = dmItem.Slot;
  DisableShowPopup: boolean = false;
  DisableAlphaPopup: boolean = false;
  DisableRepeatOnMiddleClick: boolean = false;
  ExportBonusTotals: boolean = false;
  ExportBonusList: boolean = false;
  NoToolTips: boolean = false;
  DataDamageGraphPercentageOnly: boolean = false;
  DvState: eVisibleSize = eVisibleSize.Compact;
  Suppression: eSuppress = eSuppress.None;
  UseArcanaTime: boolean = false;
  Export: ExportConfig = new ExportConfig();
  ShareConfig: ShareConfig = new ShareConfig();
  PrintInColor: boolean = false;
  PrintHistory: boolean = false;
  SaveFolderChecked: boolean = false;
  ShowSlotLevels: boolean = false;
  ShowEnhRel: boolean = false;
  ShowRelSymbols: boolean = false;
  ShowSoLevels: boolean = false;
  EnhanceVisibility: boolean = false;
  Tips: Tips = new Tips();
  PopupRecipes: boolean = false;
  ShoppingListIncludesRecipes: boolean = false;
  LongExport: boolean = false;
  RotationHelperLocation: Point | null = null;
  PowerListsWordwrapMode: WordwrapMode = WordwrapMode.Legacy;
  CombatContextSettings: CombatContext = new CombatContext();
  Mode: Modes = Modes.User;
  ShrinkFrmSets: boolean = false;
  WarnOnOldDbMbd: boolean = false;
  DimWindowStyleColors: boolean = true;
  CloseEnhSelectPopupByMove: boolean = true;
  PreferredCurrency: RewardCurrency = RewardCurrency.RewardMerit;
  ShowSelfBuffsAny: boolean = false;
  TotalsWindowTitleStyle: ETotalsWindowTitleStyle =
    ETotalsWindowTitleStyle.Generic;
  EntityDetailsLocation: Point | null = null;
  DisableTips: boolean = false;

  private _buildsPath: string = AppDataPaths.FDefaultBuildsPath;
  private _savePath: string | null = AppDataPaths.FDefaultPath;

  readonly RelativeScales: Array<{ key: string; value: number }> = [
    { key: 'Enemy Relative Level: -4', value: 0.95 },
    { key: 'Enemy Relative Level: -3', value: 0.9 },
    { key: 'Enemy Relative Level: -2', value: 0.85 },
    { key: 'Enemy Relative Level: -1', value: 0.8 },
    { key: 'Enemy Relative Level: Default', value: 0.75 },
    { key: 'Enemy Relative Level: +1', value: 0.65 },
    { key: 'Enemy Relative Level: +2', value: 0.56 },
    { key: 'Enemy Relative Level: +3', value: 0.48 },
    { key: 'Enemy Relative Level: +4', value: 0.39 },
    { key: 'Enemy Relative Level: +5', value: 0.3 },
    { key: 'Enemy Relative Level: +6', value: 0.2 },
    { key: 'Enemy Relative Level: +7', value: 0.08 }
  ];

  private constructor() {
    this.AutomaticUpdates = new AutoUpdate(AutoUpdType.Delay);
    this.DamageMath.Calculate = EDamageMath.Average;
    this.DamageMath.ReturnValue = EDamageReturn.Numeric;
    this.I9.DefaultIOLevel = 49;
    this.TotalsWindowTitleStyle = ETotalsWindowTitleStyle.Generic;
    this.RtFont.SetDefault();
    this.Tips = new Tips();
    this.Export = new ExportConfig();
    this.CompOverride = [];
    this.TeamMembers = new Map();
    this.ShowSelfBuffsAny = false;
    this.WarnOnOldDbMbd = false;
    this.DimWindowStyleColors = true;
    this.CloseEnhSelectPopupByMove = true;
    this.PowerListsWordwrapMode = WordwrapMode.Legacy;
    this.Mode = Modes.User;
    this.CombatContextSettings = new CombatContext();
    // Initialize ScalingToHit from ServerData if available
    try {
      this.ScalingToHit = DatabaseAPI.ServerData.BaseToHit;
    } catch {
      this.ScalingToHit = 0.75; // Default fallback
    }
  }

  get MasterMode(): boolean {
    switch (this.Mode) {
      case Modes.User:
        return false;
      case Modes.DbAdmin:
      case Modes.AppAdmin:
        return true;
      default:
        throw new Error(`Invalid mode: ${this.Mode}`);
    }
  }

  get BuildsPath(): string {
    return this._buildsPath;
  }

  set BuildsPath(value: string) {
    this._buildsPath = value;
  }

  DataPath: string | null = null;

  get SavePath(): string | null {
    return this._savePath;
  }

  set SavePath(value: string | null) {
    if (value !== this.DataPath) {
      this._savePath = value;
    } else {
      this._savePath = this.DataPath;
    }
  }

  static get Current(): ConfigData {
    if (ConfigData.Instance === null) {
      throw new Error('ConfigData not initialized. Call ConfigData.Initialize() first.');
    }
    return ConfigData.Instance;
  }

  ResetBuildsPath(): void {
    this.BuildsPath = AppDataPaths.FDefaultBuildsPath;
  }

  static async Initialize(firstRun: boolean = false): Promise<void> {
    const serializer = Serializer.GetSerializer();
    if (firstRun) {
      ConfigData.Instance = new ConfigData();
      ConfigData.Instance.SaveConfig();
      return;
    }

    try {
      const configPath = AppDataPaths.FNameJsonConfig;
      const response = await fetch(configPath);
      if (!response.ok) {
        // Create default config if file doesn't exist
        ConfigData.Instance = new ConfigData();
        ConfigData.Instance.SaveConfig();
        return;
      }

      const configText = await response.text();
      ConfigData.Instance = serializer.Deserialize<ConfigData>(configText);
    } catch (ex: any) {
      console.error(`Error loading config: ${ex.message}`);
      // Fallback to default config
      ConfigData.Instance = new ConfigData();
      ConfigData.Instance.SaveConfig();
    }
  }

  static GetCombatSettings(): Map<string, string> {
    return new Map([
      ['cfg.player.hp', 'Player HP %'],
      ['cfg.player.isAlive', 'Player is Alive/Dead'],
      ['cfg.target.hp', 'Target HP %'],
      ['cfg.target.end', 'Target Endurance %']
    ]);
  }

  static GetCombatSettingName(
    param: string,
    settingsTable: Map<string, string>
  ): string | null {
    for (const [key, value] of settingsTable.entries()) {
      if (key.toLowerCase() === param.toLowerCase()) {
        return value;
      }
    }
    return null;
  }

  private SaveRaw(serializer: ISerialize, iFilename: string): void {
    // TODO: Implement SaveRawMhd
  }

  private Save(serializer: ISerialize, iFilename: string): void {
    this.SaveRaw(serializer, iFilename);
  }

  SaveConfig(): void {
    const configPath = AppDataPaths.FNameJsonConfig;
    const serializer = Serializer.GetSerializer();
    this.Save(serializer, configPath);
  }

  async LoadOverrides(dataPath: string = ''): Promise<void> {
    if (!dataPath || dataPath.trim() === '') {
      this.CompOverride = [];
      return;
    }

    const overridePath = AppDataPaths.SelectDataFileLoad(
      AppDataPaths.MxdbFileOverrides,
      dataPath
    );

    try {
      const response = await fetch(overridePath);
      const buffer = await response.arrayBuffer();
      const reader = new BinaryReader(buffer);

      const header = reader.readString();
      if (header !== ConfigData.OverrideNames) {
        showWarning(
          `Overrides file (${AppDataPaths.MxdbFileOverrides}) was missing a header!\nNot loading powerset comparison overrides.`
        );
        return;
      }

      const overrideCount = reader.readInt() + 1;
      this.CompOverride = new Array(overrideCount);
      for (let index = 0; index < overrideCount; index++) {
        this.CompOverride[index] = {
          Powerset: reader.readString(),
          Power: reader.readString(),
          Override: reader.readString()
        };
      }
    } catch (ex: any) {
      console.error(`Error loading overrides: ${ex.message}`);
    }
  }
}

