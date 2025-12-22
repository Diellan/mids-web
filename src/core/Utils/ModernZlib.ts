// Converted from C# ModernZlib.cs
// Note: ComponentAce.Compression.Libs.zlib is C# specific.
// In TypeScript/Web, we use the pako library for zlib compression/decompression.

import pako from 'pako';

export class ModernZlib {
    // Compression and Decompression using zlib
    static CompressChunk(inputBytes: Uint8Array): Uint8Array {
        // Use pako deflate with best compression level (equivalent to Z_BEST_COMPRESSION = 9)
        return pako.deflate(inputBytes, { level: 9 });
    }

    static DecompressChunk(inputBytes: Uint8Array, destLength: number): Uint8Array {
        // Decompress using pako inflate
        const decompressed = pako.inflate(inputBytes);
        // Resize the output array to destLength (equivalent to Array.Resize in C#)
        if (decompressed.length >= destLength) {
            return decompressed.slice(0, destLength);
        } else {
            // If decompressed data is shorter, pad with zeros (matching C# Array.Resize behavior)
            const result = new Uint8Array(destLength);
            result.set(decompressed, 0);
            return result;
        }
    }

    // Encoding and Decoding
    static UuDecodeBytes(inputBytes: Uint8Array): Uint8Array {
        const output: number[] = [];
        for (let index = 0; index < inputBytes.length; index += 4) {
            // Process a group of 4 bytes
            const bytes = Array.from(inputBytes.slice(index, index + 4)).map(b => b === 96 ? 32 : b);

            // Decode the group of 4 bytes into 3 bytes
            const byte1 = ((bytes[0] - 32) << 2) | ((bytes[1] - 32) >> 4);
            const byte2 = ((bytes[1] - 32) & 0xF) << 4 | ((bytes[2] - 32) >> 2);
            const byte3 = ((bytes[2] - 32) & 0x3) << 6 | (bytes[3] - 32);

            output.push(byte1, byte2, byte3);
        }

        return new Uint8Array(output);
    }

    static HexDecodeBytes(inputBytes: Uint8Array): Uint8Array {
        // Convert inputBytes to hexString
        const hexString = new TextDecoder('ascii').decode(inputBytes);
        // Calculate the number of bytes in the resulting array
        const bytes: number[] = [];
        for (let i = 0; i < hexString.length / 2; i++) {
            // Convert each pair of characters (each hex byte) to a byte
            bytes.push(parseInt(hexString.substring(i * 2, i * 2 + 2), 16));
        }
        return new Uint8Array(bytes);
    }

    static HexEncodeBytes(inputBytes: Uint8Array): Uint8Array {
        const hex = Array.from(inputBytes)
            .map((b: number) => b.toString(16).toUpperCase().padStart(2, '0'))
            .join('');
        return new TextEncoder().encode(hex);
    }

    // String Manipulation
    static BreakString(inputString: string, length: number, bookend: boolean = false): string {
        const lines: string[] = [];
        for (let i = 0; i < inputString.length; i += length) {
            let line = '';
            if (bookend) {
                line += '|';
            }

            line += inputString.substring(i, Math.min(i + length, inputString.length));

            if (bookend) {
                line += '|';
            }

            lines.push(line);
        }
        return lines.join('\n');
    }

    static UnbreakHex(inputString: string): string {
        let result = '';
        for (const ch of inputString) {
            if ((ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')) {
                result += ch;
            }
        }
        return result;
    }

    static UnbreakString(inputString: string, bookend: boolean = false): string {
        // If bookend is true, remove the '|' characters at the beginning and end of each line
        if (bookend) {
            // Split the input string by lines, trim the '|' characters and rejoin
            inputString = inputString
                .split(/\r?\n/)
                .map(line => line.replace(/^\|+|\|+$/g, ''))
                .join('\n');
        }

        // Remove newline characters to reverse the 'AppendLine' used in 'BreakString'
        return inputString.replace(/\r?\n/g, '');
    }
}

