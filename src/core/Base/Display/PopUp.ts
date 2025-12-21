// Converted from C# PopUp.cs
// Note: This class uses System.Drawing.Color and FontStyle which are Windows Forms specific
// In TypeScript/web context, colors would be strings (hex/rgb) and font styles would be CSS-like

export type FontStyle = 'Normal' | 'Bold' | 'Italic' | 'Underline' | 'Strikeout';

export interface StringValue {
  Text: string;
  tColor: string; // Color converted to string (hex/rgb)
  tSize: number;
  tFormat: FontStyle;
  tIndent: number;
  TextColumn: string;
  tColorColumn: string;
  readonly HasColumn: boolean;
}

export class Section {
  Content: StringValue[] = [];

  Add(
    iText: string,
    iColor: string,
    iSize: number = 1,
    iFormat: FontStyle = 'Bold',
    iIndent: number = 0
  ): void {
    this.Content.push({
      Text: iText,
      tColor: iColor,
      tSize: iSize,
      tFormat: iFormat,
      tIndent: iIndent,
      TextColumn: '',
      tColorColumn: iColor,
      HasColumn: false
    });
  }

  Add(
    iText: string,
    iColor: string,
    iColumnText: string,
    iColumnColor: string,
    iSize: number = 1,
    iFormat: FontStyle = 'Bold',
    iIndent: number = 0
  ): void {
    this.Content.push({
      Text: iText,
      tColor: iColor,
      tSize: iSize,
      tFormat: iFormat,
      tIndent: iIndent,
      TextColumn: iColumnText,
      tColorColumn: iColumnColor,
      HasColumn: !!iColumnText
    });
  }
}

export class PopupData {
  Sections: Section[] = [];
  private _columnPosition: number = 0;
  private _rightAlignColumn: boolean = false;
  private _customSet: boolean = false;

  get ColPos(): number {
    return this._columnPosition;
  }

  set ColPos(value: number) {
    this._columnPosition = value;
    this._customSet = true;
  }

  get ColRight(): boolean {
    return this._rightAlignColumn;
  }

  set ColRight(value: boolean) {
    this._rightAlignColumn = value;
    this._customSet = true;
  }

  get CustomSet(): boolean {
    return this._customSet;
  }

  Add(section?: Section): number {
    if (!section) {
      section = new Section();
    }
    this.Sections.push(section);
    return this.Sections.length - 1;
  }
}

export class PopUp {
  static readonly Colors = {
    Title: '#D8D8FF', // Color.FromArgb(216, 216, 255)
    Text: '#FFFFFF', // Color.FromArgb(255, 255, 255)
    Disabled: '#C0C0C0', // Color.FromArgb(192, 192, 192)
    Invention: '#00FFFF', // Color.FromArgb(0, 255, 255)
    Effect: '#00FF80', // Color.FromArgb(0, 255, 128)
    Alert: '#FF0000', // Color.FromArgb(255, 0, 0)
    UltraRare: '#C060C0', // Color.FromArgb(192, 96, 192)
    Rare: '#FF8000', // Color.FromArgb(255, 128, 0)
    Uncommon: '#FFFF00', // Color.FromArgb(255, 255, 0)
    Common: '#FFFFFF' // Color.FromArgb(255, 255, 255)
  };
}

