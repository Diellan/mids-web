// Converted from C# PatchCompressor.cs
// Note: This file contains C# specific functionality (FileStream, BinaryWriter, DeflaterOutputStream, MessageBox, Directory operations).
// These are not directly translatable to a browser-based TypeScript environment.
// The methods are converted to maintain structure but their implementation will be
// removed or replaced with web-compatible alternatives if needed.

import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { DatabaseAPI } from '../DatabaseAPI';
import { AppDataPaths } from '../AppDataPaths';
import { FileHash } from './FileHash';
import { ProgressEventArgs } from './ProgressEventArgs';
import { ProgressFileStream } from './ProgressFileStream';
import { PatchManifestBuilder, PatchType, Manifest } from './PatchManifestBuilder';
import { showWarning } from '../showWarning';

// Placeholder for FileData
interface FileData {
    FileName: string;
    Data: Uint8Array;
    Path: string;
}

export class PatchCompressor {
    ProgressChanged?: (sender: PatchCompressor, e: ProgressEventArgs) => void;

    static readonly AppPatchCompressor: PatchCompressor = new PatchCompressor(PatchType.Application);
    static readonly DbPatchCompressor: PatchCompressor = new PatchCompressor(PatchType.Database);

    private PatchType: PatchType;

    private constructor(patchType: PatchType) {
        this.PatchType = patchType;
    }

    private static readonly PatchFolderName: string = 'Patches';

    private get TopLevelFolder(): string {
        switch (this.PatchType) {
            case PatchType.Application:
                // AppContext.BaseDirectory is C# specific
                return './'; // Placeholder
            case PatchType.Database:
                // Path.Combine and AppContext.BaseDirectory are C# specific
                return `${AppDataPaths.RoamingFolder}`; // Simplified
            default:
                return '';
        }
    }

    private get PatchVersion(): string {
        switch (this.PatchType) {
            case PatchType.Application:
                return MidsContext.AssemblyFileVersion;
            case PatchType.Database:
                return `${DatabaseAPI.Database.Version.major || 0}.${DatabaseAPI.Database.Version.minor || 0}.${DatabaseAPI.Database.Version.build || 0}.${DatabaseAPI.Database.Version.revision || 0}`;
            default:
                return '';
        }
    }

    private get PatchDir(): string {
        // Path.Combine, Directory.Exists, and Directory.CreateDirectory are C# specific
        // In a web environment, this would need to be handled differently
        let value: string;
        switch (this.PatchType) {
            case PatchType.Application:
                value = `./${PatchCompressor.PatchFolderName}/App`; // Simplified
                break;
            case PatchType.Database:
                value = `./${PatchCompressor.PatchFolderName}/Db`; // Simplified
                break;
            default:
                value = '';
        }
        // Directory operations removed for web
        return value;
    }

    private get PatchPath(): string {
        switch (this.PatchType) {
            case PatchType.Application:
                // AppContext.BaseDirectory is C# specific
                return './'; // Placeholder
            case PatchType.Database:
                return MidsContext.Config?.DataPath ?? '';
            default:
                return '';
        }
    }

    private get PatchFile(): string {
        // Path.Combine is C# specific
        return `${this.PatchDir}/${this.PatchName}`;
    }

    private get PatchName(): string {
        switch (this.PatchType) {
            case PatchType.Application:
                return `${MidsContext.AppName.replace(/\s/g, '')}-${MidsContext.AssemblyFileVersion}-cumulative.mru`.toLowerCase();
            case PatchType.Database:
                return `${DatabaseAPI.DatabaseName}-${this.PatchVersion}-cumulative.mru`.toLowerCase();
            default:
                return '';
        }
    }

    private get HashFile(): string {
        // Path.Combine is C# specific
        return `${this.PatchDir}/${this.HashName}`;
    }

    private get HashName(): string {
        switch (this.PatchType) {
            case PatchType.Application:
                return `${MidsContext.AppName.replace(/\s/g, '')}-${MidsContext.AssemblyFileVersion}-cumulative.hash`.toLowerCase();
            case PatchType.Database:
                return `${DatabaseAPI.DatabaseName}-${this.PatchVersion}-cumulative.hash`.toLowerCase();
            default:
                return '';
        }
    }

    private async CompileList(): Promise<FileData[]> {
        // Directory.EnumerateFiles is C# specific
        // In a web environment, this would need to be handled differently
        showWarning('PatchCompressor.CompileList: File system enumeration not available in browser.');
        const files: string[] = [];
        const hashes: FileHash[] = [];
        const fileQueue: FileData[] = [];
        const exclusionList: string[] = [];

        switch (this.PatchType) {
            case PatchType.Application:
                exclusionList.push('Patches', 'Databases', 'MRBBootstrap.exe', '.pdb', 'MidsReborn.exe.WebView2', 'appSettings');
                break;
            case PatchType.Database:
                exclusionList.push('Patches');
                break;
        }

        // File enumeration removed for web - would need server-side API or different approach
        // For now, return empty list
        return fileQueue;
    }

    async CreatePatchFile(): Promise<boolean> {
        this.CleanPrevious();
        const hashedFiles = await this.CompileList();
        const compressedData = await this.CompressedFileData(hashedFiles);
        if (compressedData === null) {
            return false;
        } else {
            const generated = await this.GenerateCompressedFile(compressedData);
            if (generated) {
                const modifiedManifest = await PatchManifestBuilder.ModifyManifestAsync(
                    this.PatchType,
                    this.PatchType === PatchType.Application ? MidsContext.AppName : DatabaseAPI.DatabaseName,
                    this.PatchVersion,
                    this.PatchName
                );
                if (modifiedManifest !== null) {
                    await this.WriteModifiedManifest(modifiedManifest);
                }
            }
            return generated;
        }
    }

    private async CompressedFileData(hashedFiles: FileData[]): Promise<Uint8Array | null> {
        // BinaryWriter and MemoryStream are C# specific
        // In a web environment, this would use ArrayBuffer or similar
        showWarning('PatchCompressor.CompressedFileData: BinaryWriter not available in browser.');
        try {
            const chunks: Uint8Array[] = [];
            const header = new TextEncoder().encode('Mids Reborn Patch Data');
            chunks.push(header);

            const countBytes = new Uint8Array(4);
            new DataView(countBytes.buffer).setUint32(0, hashedFiles.length, true);
            chunks.push(countBytes);

            for (let index = 0; index < hashedFiles.length; index++) {
                const file = hashedFiles[index];
                const lengthBytes = new Uint8Array(4);
                new DataView(lengthBytes.buffer).setUint32(0, file.Data.length, true);
                chunks.push(lengthBytes);

                const fileNameBytes = new TextEncoder().encode(file.FileName);
                const fileNameLengthBytes = new Uint8Array(4);
                new DataView(fileNameLengthBytes.buffer).setUint32(0, fileNameBytes.length, true);
                chunks.push(fileNameLengthBytes);
                chunks.push(fileNameBytes);

                const pathBytes = new TextEncoder().encode(file.Path);
                const pathLengthBytes = new Uint8Array(4);
                new DataView(pathLengthBytes.buffer).setUint32(0, pathBytes.length, true);
                chunks.push(pathLengthBytes);
                chunks.push(pathBytes);

                chunks.push(file.Data);

                await new Promise(resolve => setTimeout(resolve, 50));
                this.ProgressChanged?.(this, new ProgressEventArgs(`Adding To Patch Container: ${file.FileName}`, index, hashedFiles.length));
            }

            // Combine all chunks
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const outData = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                outData.set(chunk, offset);
                offset += chunk.length;
            }

            return outData;
        } catch (e: any) {
            // MessageBox.Show is Windows Forms specific
            console.error(`Message: ${e.message}\r\n\r\nTrace: ${e.stack}`);
            return null;
        }
    }

    private async GenerateCompressedFile(byteArray: Uint8Array): Promise<boolean> {
        // ProgressFileStream, DeflaterOutputStream are C# specific
        // In a web environment, this would use CompressionStream API or similar
        showWarning('PatchCompressor.GenerateCompressedFile: File compression not fully implemented for web.');
        try {
            this.ProgressChanged?.(this, new ProgressEventArgs(`Generating Patch From Container: ${this.PatchName}`, 0, byteArray.length));
            await new Promise(resolve => setTimeout(resolve, 50));

            // Using CompressionStream API for compression
            const stream = new CompressionStream('deflate'); // deflate compression
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();

            const chunkSize = 1024;
            for (let index = 0; index < byteArray.length; index += chunkSize) {
                const chunk = byteArray.slice(index, Math.min(index + chunkSize, byteArray.length));
                await writer.write(chunk);
                // Progress tracking would need to be implemented differently
            }
            writer.close();

            const compressedChunks: Uint8Array[] = [];
            let done = false;
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    compressedChunks.push(value);
                }
            }

            // Combine compressed chunks
            const totalLength = compressedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const compressedData = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of compressedChunks) {
                compressedData.set(chunk, offset);
                offset += chunk.length;
            }

            // File.WriteAllBytes is C# specific
            // In a web environment, this would trigger a download or use FileWriter API
            const blob = new Blob([compressedData], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.PatchName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (e: any) {
            // MessageBox.Show is Windows Forms specific
            console.error(`Patch generation failed: ${e.message}`);
            return false;
        }
    }

    private CleanPrevious(): void {
        // Directory.GetFiles and File.Delete are C# specific
        // In a web environment, this would need to be handled differently
        showWarning('PatchCompressor.CleanPrevious: File deletion not available in browser.');
        // File deletion removed for web
    }

    private async WriteModifiedManifest(manifest: Manifest | null): Promise<void> {
        if (manifest === null) return;

        // File.Create and JsonSerializer.SerializeAsync are C# specific
        // In a web environment, this would trigger a download or use FileWriter API
        const json = JSON.stringify(manifest, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'update_manifest.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

