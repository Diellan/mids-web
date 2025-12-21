// Converted from C# ExportConfig.cs
export enum Element {
  Title,
  Heading,
  Level,
  Power,
  Slots,
  IO,
  SetO,
  HO
}

export enum WhiteSpace {
  Space,
  Tab
}

export interface ColorScheme {
  SchemeName: string;
  Title: string; // Color converted to string (hex/rgb)
  Heading: string;
  Level: string;
  Power: string;
  Slots: string;
  IOColor: string;
  SetColor: string;
  HOColor: string;
}

export interface FormatCodes {
  Name: string;
  Notes: string;
  SetDefault(): void;
}

export class FormatCodesImpl implements FormatCodes {
  Name: string = '';
  Notes: string = '';

  SetDefault(): void {
    // Note: Implementation would set default format codes
  }
}

export class ExportConfig {
  ColorSchemes: ColorScheme[] = [];
  FormatCode: FormatCodes[] = [];

  constructor() {
    this.ResetColorsToDefaults();
  }

  AddCodes(): void {
    const newCode = new FormatCodesImpl();
    newCode.SetDefault();
    newCode.Name = 'New Format';
    newCode.Notes = '';
    this.FormatCode = [...this.FormatCode, newCode];
  }

  ResetColorsToDefaults(): void {
    this.ColorSchemes = [
      {
        SchemeName: 'Navy',
        Title: '#0000CD', // Color.FromArgb(0, 0, 205)
        Heading: '#000080', // Color.FromArgb(0, 0, 128)
        Level: '#483D8B', // Color.FromArgb(72, 61, 139)
        Power: '#000000', // Color.FromArgb(0, 0, 0)
        Slots: '#483D8B', // Color.FromArgb(72, 61, 139)
        IOColor: '#0000CD', // Color.FromArgb(0, 0, 205)
        SetColor: '#0000CD', // Color.FromArgb(0, 0, 205)
        HOColor: '#483D8B' // Color.FromArgb(72, 61, 139)
      }
      // Note: More color schemes would be added here
    ];
  }
}

