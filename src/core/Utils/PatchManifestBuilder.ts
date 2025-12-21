// Converted from C# PatchManifestBuilder.cs
// Note: RestSharp is C# specific. In TypeScript/Web, we use the native fetch API.
// Note: PatchType, Manifest, and ManifestEntry are from UI.Forms.UpdateSystem.Models
// These are placeholders - update when the actual models are converted.

import { DatabaseAPI } from '../DatabaseAPI';

// Placeholder types - update when UI.Forms.UpdateSystem.Models are converted
export enum PatchType {
    Application,
    Database
}

export interface ManifestEntry {
    Type: PatchType;
    Name: string | null;
    Version: string | null;
    File: string | null;
}

export interface Manifest {
    Updates: ManifestEntry[];
    LastUpdated: string | null;
}

export class PatchManifestBuilder {
    private static readonly MidsRebornManifestUrl: string = 'https://updates.midsreborn.com/update_manifest.json';

    private static ResolveManifestUri(type: PatchType, databaseName: string): string {
        switch (type) {
            case PatchType.Application:
                return PatchManifestBuilder.MidsRebornManifestUrl;
            case PatchType.Database:
                switch (databaseName) {
                    case 'Homecoming':
                        return PatchManifestBuilder.MidsRebornManifestUrl;
                    default:
                        return DatabaseAPI.ServerData.ManifestUri;
                }
            default:
                throw new Error(`Invalid PatchType: ${type}`);
        }
    }

    static async ModifyManifestAsync(type: PatchType, name: string, version: string, file: string): Promise<Manifest | null> {
        const manifestUrl = PatchManifestBuilder.ResolveManifestUri(type, name);

        try {
            const response = await fetch(manifestUrl);
            if (!response.ok) {
                throw new Error(`Unable to fetch manifest from ${manifestUrl}: ${response.statusText}`);
            }

            const manifest: Manifest = await response.json();

            const updatedEntry: ManifestEntry = {
                Type: type,
                Name: name,
                Version: version,
                File: file
            };

            const index = manifest.Updates.findIndex(e =>
                e.Type === updatedEntry.Type && e.Name !== null && e.Name === updatedEntry.Name
            );

            if (index >= 0) {
                manifest.Updates[index] = updatedEntry;
            } else {
                manifest.Updates.push(updatedEntry);
            }

            manifest.LastUpdated = new Date().toISOString();

            return manifest;
        } catch (e: any) {
            throw new Error(`Unable to fetch manifest from ${manifestUrl}: ${e.message}`);
        }
    }
}

