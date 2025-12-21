// Converted from C# Base64UrlEncoder.cs
export class Base64UrlEncoder {
    private static readonly Base64Character62: string = '+';
    private static readonly Base64Character63: string = '/';
    private static readonly Base64DoublePadCharacter: string = '==';
    private static readonly Base64PadCharacter: string = '=';
    private static readonly Base64UrlCharacter62: string = '-';
    private static readonly Base64UrlCharacter63: string = '_';

    /// <summary>
    /// Converts the specified Base64 URL encoded string to a UTF8 string.
    /// </summary>
    /// <param name="s">The Base64 URL encoded string to convert</param>
    /// <returns>A UTF8 string</returns>
    static Decode(s: string): string {
        return new TextDecoder().decode(Base64UrlEncoder.DecodeBytes(s));
    }

    /// <summary>
    /// Converts the specified Base64 URL encoded string to a byte array.
    /// </summary>
    /// <param name="s">The Base64 URL encoded string to convert</param>
    /// <returns>A byte array</returns>
    static DecodeBytes(s: string): Uint8Array {
        if (s === null) throw new Error('s cannot be null');

        // Replace - with +
        s = s.replace(Base64UrlEncoder.Base64UrlCharacter62, Base64UrlEncoder.Base64Character62);

        // Replace _ with /
        s = s.replace(Base64UrlEncoder.Base64UrlCharacter63, Base64UrlEncoder.Base64Character63);

        // Check padding.
        switch (s.length % 4) {
            case 0: // No pad characters.
                break;
            case 2: // Two pad characters.
                s += Base64UrlEncoder.Base64DoublePadCharacter;
                break;
            case 3: // One pad character.
                s += Base64UrlEncoder.Base64PadCharacter;
                break;
            default:
                throw new Error('Invalid Base64 URL encoding.');
        }

        // Convert from base64 string to bytes
        const binaryString = atob(s);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    /// <summary>
    /// Converts the specified UTF8 string into a Base64 URL encoded string.
    /// </summary>
    /// <param name="s">The UTF8 string to convert</param>
    /// <returns>A Base64 URL encoded string</returns>
    static Encode(s: string): string {
        if (s === null) throw new Error('s cannot be null');
        return Base64UrlEncoder.EncodeBytes(new TextEncoder().encode(s));
    }

    /// <summary>
    /// Converts the specified byte array to a Base64 URL encoded string.
    /// </summary>
    /// <param name="bytes">The byte array to convert</param>
    /// <returns>A Base64 URL encoded string</returns>
    static EncodeBytes(bytes: Uint8Array): string {
        if (bytes === null) throw new Error('bytes cannot be null');

        let s = btoa(String.fromCharCode(...bytes));
        s = s.split(Base64UrlEncoder.Base64PadCharacter)[0]; // Remove trailing padding i.e. = or ==
        s = s.replace(Base64UrlEncoder.Base64Character62, Base64UrlEncoder.Base64UrlCharacter62); // Replace + with -
        s = s.replace(Base64UrlEncoder.Base64Character63, Base64UrlEncoder.Base64UrlCharacter63); // Replace / with _

        return s;
    }

    /// <summary>
    /// Converts the specified byte array to a Base64 URL encoded string.
    /// </summary>
    /// <param name="bytes">The byte array to convert</param>
    /// <param name="offset">The byte array offset</param>
    /// <param name="length">The number of elements in the byte array to convert</param>
    /// <returns>A Base64 URL encoded string</returns>
    static EncodeBytesOffset(bytes: Uint8Array, offset: number, length: number): string {
        if (bytes === null) throw new Error('bytes cannot be null');

        const slice = bytes.slice(offset, offset + length);
        let s = btoa(String.fromCharCode(...slice));
        s = s.split(Base64UrlEncoder.Base64PadCharacter)[0]; // Remove trailing padding i.e. = or ==
        s = s.replace(Base64UrlEncoder.Base64Character62, Base64UrlEncoder.Base64UrlCharacter63); // Replace + with -
        s = s.replace(Base64UrlEncoder.Base64Character63, Base64UrlEncoder.Base64UrlCharacter63); // Replace / with _

        return s;
    }
}

