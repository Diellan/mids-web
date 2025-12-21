// Converted from C# MidsCharacterFileFormat.cs
// This is a static class for handling character file format operations

export class MidsCharacterFileFormat {
    private static DisplayIndex: number = -1;
    private static InherentPowers: any[] = []; // PowerEntry[]

    public static eLoadReturnCode = {
        Failure: 0,
        Success: 1,
        IsOldFormat: 2
    } as const;

    private static readonly MagicNumber: number[] = [
        'M'.charCodeAt(0),
        'x'.charCodeAt(0),
        'D'.charCodeAt(0),
        12
    ];

    private static DecodeEntities(s: string): string {
        return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    private static EncodeEntities(s: string): string {
        return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    public static ReadMetadata(tagNames: string[], s: string): Map<string, string> {
        const ret = new Map<string, string>();

        for (const tag of tagNames) {
            const regex = new RegExp(`<${tag}>(.+?)</${tag}>`);
            const match = s.match(regex);
            if (match && match[1]) {
                ret.set(tag, this.DecodeEntities(match[1].trim()));
            }
        }

        return ret;
    }

    // Note: Many more methods would be added here
    // This class has 900+ lines with file format handling logic
}

