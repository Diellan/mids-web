// Converted from C# I9Gfx.cs
// Note: This class uses System.Drawing which is Windows Forms specific
// In TypeScript/web context, this would use Canvas API or image loading libraries

import { ExtendedBitmap } from './Base/Display/ExtendedBitmap';

interface ImageInfo {
  FileName: string;
  Directory: string;
  Path: string | null;
  IsBase: boolean;
}

export class I9Gfx {
  private static readonly IconLarge = 30;
  private static readonly IconSmall = 16;
  private static readonly ImageFilter = '*.png';
  private static Images: ImageInfo[] = [];
  private static Initialized: boolean = false;

  static OriginIndex: number = 0;
  static Enhancements: any[] = []; // Bitmap[] converted to any[]
  static Borders: ExtendedBitmap | null = null;
  static Sets: ExtendedBitmap | null = null;
  static Classes: ExtendedBitmap | null = null;
  static SetTypes: ExtendedBitmap | null = null;
  static EnhTypes: ExtendedBitmap | null = null;
  static EnhGrades: ExtendedBitmap | null = null;
  static EnhSpecials: ExtendedBitmap | null = null;
  static Archetypes: ExtendedBitmap | null = null;
  static Origins: ExtendedBitmap | null = null;
  static Powersets: ExtendedBitmap | null = null;
  static UnknownPowerset: ExtendedBitmap | null = null;
  static UnknownArchetype: ExtendedBitmap | null = null;

  static ImagePath(type: string = ''): string {
    // Note: Would need path.join equivalent
    return '';
  }

  static Initialize(): void {
    // Note: Implementation would load images using web-compatible image loading
  }

  // Note: All graphics operations would need to be converted to Canvas API or web image libraries
}

