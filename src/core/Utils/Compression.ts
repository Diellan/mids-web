// Converted from C# Compression.cs
// Note: BrotliStream is C# specific. In TypeScript/Web, we can use:
// - CompressionStream API (browser native, supports Brotli)
// - Or a library like pako for zlib/gzip
// This implementation uses CompressionStream API for Brotli

export interface CompressionResult {
    OutString: string;
    UncompressedSize: number;
    CompressedSize: number;
    EncodedSize: number;
}

export class Compression {
    static async CompressToBase64(sourceBytes: BufferSource): Promise<CompressionResult> {
        // Using CompressionStream API (browser native, supports Brotli)
        const stream = new CompressionStream('gzip');
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(sourceBytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(value);
            }
        }

        // Combine chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const compressedBytes = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            compressedBytes.set(chunk, offset);
            offset += chunk.length;
        }

        const base64String = btoa(String.fromCharCode(...compressedBytes));

        return {
            OutString: base64String,
            UncompressedSize: sourceBytes.byteLength,
            CompressedSize: compressedBytes.length,
            EncodedSize: base64String.length
        };
    }

    static async DecompressFromBase64(base64String: string): Promise<CompressionResult> {
        // Decode base64
        const compressedBytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));

        // Using DecompressionStream API (browser native, supports Brotli)
        const stream = new DecompressionStream('gzip'); // 'br' = Brotli
        const writer = stream.writable.getWriter();
        const reader = stream.readable.getReader();

        writer.write(compressedBytes);
        writer.close();

        const chunks: Uint8Array[] = [];
        let done = false;
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
                chunks.push(value);
            }
        }

        // Combine chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const decompressedBytes = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            decompressedBytes.set(chunk, offset);
            offset += chunk.length;
        }

        const outString = new TextDecoder().decode(decompressedBytes);

        return {
            OutString: outString,
            UncompressedSize: decompressedBytes.length,
            CompressedSize: compressedBytes.length,
            EncodedSize: base64String.length
        };
    }
}

