// Converted from C# ColorTheme.cs
// Note: System.Drawing.Color is Windows Forms specific.
// It is replaced with a string type (hex color) for web compatibility.

export class ColorTheme {
    Name: string | null = 'Light Blue';
    Title: string = '#b1c9f5'; // Color.FromArgb(0xb1, 0xc9, 0xf5)
    Headings: string = '#489aff'; // Color.FromArgb(0x48, 0x9a, 0xff)
    Levels: string = '#4fa7ff'; // Color.FromArgb(0x4f, 0xa7, 0xff)
    Slots: string = '#5eaeff'; // Color.FromArgb(0x5e, 0xae, 0xff)
    DarkTheme: boolean = true;
}

