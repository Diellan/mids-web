// Converted from C# RTF.cs
import { MidsContext } from './Base/Master_Classes/MidsContext';

export enum ElementID {
  Black,
  Enhancement,
  Faded,
  Invention,
  InventionInvert,
  Text,
  Warning,
  BackgroundHero,
  BackgroundVillain,
  Alert
}

export enum SizeID {
  VeryTiny = -4,
  Tiny = -2,
  Regular = 0,
  Larger = 2,
  Large = 4,
  Huge = 8
}

export class RTF {
  static ToRTF(iStr: string): string {
    return iStr.replace(/\r?\n/g, '\\par ').replace(/\t/g, '\\tab ');
  }

  static Size(iSize: SizeID): string {
    const base = MidsContext.Config?.RtFont?.RTFBase ?? 20;
    return `\\fs${base}${iSize} `;
  }

  private static GetColorTable(): string {
    // Note: Would need MidsContext.Config.RtFont color values
    return '{\\colortbl ;}';
  }

  private static GetInitialLine(): string {
    const base = MidsContext.Config?.RtFont?.RTFBase ?? 20;
    let result = `{\\*\\generator MHD_RTFClass;}\\viewkind4\\uc1\\pard\\f0\\fs${base} `;
    result += this.Color(ElementID.Text);
    if (MidsContext.Config?.RtFont?.RTFBold) {
      result += '\\b ';
    }
    return result;
  }

  private static GetFooter(): string {
    let result = '';
    if (MidsContext.Config?.RtFont?.RTFBold) {
      result += '\\b0 ';
    }
    result += '\\par}';
    return result;
  }

  static StartRTF(): string {
    return this.GetColorTable() + this.GetInitialLine();
  }

  static EndRTF(): string {
    return this.GetFooter();
  }

  static Color(elementID: ElementID): string {
    return `\\cf${elementID + 1} `;
  }

  static Bold(iStr?: string): string {
    if (iStr === undefined) {
      return '\\b ';
    }
    if (MidsContext.Config?.RtFont?.RTFBold) {
      return iStr;
    }
    return `\\b ${iStr}\\b0 `;
  }

  static BoldOff(): string {
    return '\\b0 ';
  }

  static Underline(iStr?: string): string {
    if (iStr === undefined) {
      return '\\ul ';
    }
    return `\\ul ${iStr}\\ulnone `;
  }

  static UnderlineOff(): string {
    return '\\ul0 ';
  }

  static Crlf(): string {
    return '\\par ';
  }
}

