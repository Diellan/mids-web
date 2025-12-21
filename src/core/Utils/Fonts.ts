// Converted from C# Fonts.cs
// Note: PrivateFontCollection and FontFamily are Windows Forms specific (System.Drawing).
// In a web environment, fonts are loaded via CSS @font-face or font files.
// This implementation provides a placeholder structure.

export class Fonts {
    /// <summary>
    /// Available Fonts are
    /// DejaVu Sans Mono
    /// Noto Sans
    /// Noto Sans Black
    /// Noto Sans ExtraBold
    /// Noto Sans ExtraLight
    /// Noto Sans Light
    /// Noto Sans Medium
    /// Noto Sans SemiBold
    /// Noto Sans Thin
    /// </summary>

    private static _fontCollection: string[] | null = null;
    private static _fontFamilies: string[] | null = null;

    static BuildFontCollection(): void {
        if (Fonts._fontCollection !== null) return;

        // In a web environment, fonts would be loaded via CSS @font-face
        // or using the FontFace API
        Fonts._fontCollection = [
            'DejaVuSansMono',
            'DejaVuSansMono-Bold',
            'DejaVuSansMono-BoldOblique',
            'DejaVuSansMono-Oblique',
            'NotoSans-Black',
            'NotoSans-BlackItalic',
            'NotoSans-Bold',
            'NotoSans-BoldItalic',
            'NotoSans-ExtraBold',
            'NotoSans-ExtraBoldItalic',
            'NotoSans-ExtraLight',
            'NotoSans-ExtraLightItalic',
            'NotoSans-Italic',
            'NotoSans-Light',
            'NotoSans-LightItalic',
            'NotoSans-Medium',
            'NotoSans-MediumItalic',
            'NotoSans-Regular',
            'NotoSans-SemiBold',
            'NotoSans-SemiBoldItalic',
            'NotoSans-Thin',
            'NotoSans-ThinItalic'
        ];

        Fonts._fontFamilies = [...Fonts._fontCollection];
    }

    static Family(familyName: string): string {
        if (Fonts._fontCollection === null) throw new Error('Font collection has not been initialized');
        if (Fonts._fontFamilies === null) throw new Error('Font collection has not been initialized');
        const found = Fonts._fontFamilies.find(x => x === familyName);
        if (!found) throw new Error(`Font family '${familyName}' not found`);
        return found;
    }
}

