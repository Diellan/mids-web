// Converted from C# ShareConfig.cs
import { ThemeFilter, ExportFormatType } from './Utils/StructAndEnums';

export interface ColorTheme {
  Name: string;
  Title: string; // Color converted to string (hex/rgb)
  Headings: string;
  Levels: string;
  Slots: string;
  DarkTheme: boolean;
}

export interface FormatCode {
  Name: string;
  FormatType: ExportFormatType;
}

export class ForumFormatConfig {
  ColorThemes: (ColorTheme | null)[] = [];
  Filter: ThemeFilter = ThemeFilter.Any;
  FormatCodes: FormatCode[] = [];
  SelectedTheme: ColorTheme | null = new (class implements ColorTheme {
    Name = '';
    Title = '';
    Headings = '';
    Levels = '';
    Slots = '';
    DarkTheme = false;
  })();
  SelectedFormatCode: FormatCode | null = null;
  InclIncarnates: boolean = false;
  InclAccolades: boolean = false;
  InclBonusBreakdown: boolean = false;

  ResetThemes(): void {
    this.ColorThemes = [
      {
        Name: 'Navy',
        Title: '#0000CD',
        Headings: '#000080',
        Levels: '#483D8B',
        Slots: '#483D8B',
        DarkTheme: false
      },
      {
        Name: 'Light Blue',
        Title: '#B1C9F5',
        Headings: '#489AFF',
        Levels: '#4FA7FF',
        Slots: '#5EAEFF',
        DarkTheme: true
      }
      // Note: More themes would be added here
    ];
  }

  ResetCodes(): void {
    this.FormatCodes = [
      { Name: 'BBCode', FormatType: ExportFormatType.BbCode },
      { Name: 'HTML', FormatType: ExportFormatType.Html },
      { Name: 'Markdown', FormatType: ExportFormatType.Markdown },
      { Name: 'Markdown+HTML', FormatType: ExportFormatType.MarkdownHtml },
      { Name: '', FormatType: ExportFormatType.None } // Plain Text
    ];
  }

  AddTheme(theme: ColorTheme): void {
    this.ColorThemes.push(theme);
  }

  RemoveTheme(index: number): void {
    this.ColorThemes.splice(index, 1);
  }
}

export class InfoGraphicConfig {
  UseAltImage: boolean = false;
}

export class MobileFriendlyConfig {
  InclAccolades: boolean = false;
  InclIncarnates: boolean = false;
  InclSetBonus: boolean = false;
  InclSetBreakdown: boolean = false;
}

export class ShareConfig {
  ForumFormat: ForumFormatConfig = new ForumFormatConfig();
  InfoGraphic: InfoGraphicConfig = new InfoGraphicConfig();
  MobileFriendly: MobileFriendlyConfig = new MobileFriendlyConfig();
  LastPageIndex: number = -1;
}

