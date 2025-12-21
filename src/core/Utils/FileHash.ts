// Converted from C# FileHash.cs
// Note: SHA256 hashing is available in browsers via the Web Crypto API

export class FileHash {
    Directory: string = '';
    FileName: string = '';
    Hash: string = '';

    constructor(directory: string, fileName: string, hash: string) {
        this.Directory = directory;
        this.FileName = fileName;
        this.Hash = hash;
    }

    static async ComputeHash(byteData: Uint8Array): Promise<string> {
        // Using Web Crypto API for SHA256 hashing
        const hashBuffer = await crypto.subtle.digest('SHA-256', byteData);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toLowerCase();
    }

    static Compare(incomingHash: string, existingHash: string): boolean {
        return incomingHash === existingHash;
    }
}

