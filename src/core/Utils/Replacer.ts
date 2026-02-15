// Converted from C# Replacer.cs
// Note: File I/O operations are C# specific and will need to be replaced with
// browser-compatible storage (e.g., localStorage, IndexedDB, or server-side API calls).

import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { showWarning } from '../showWarning';

interface Item {
    Invalid: string;
    Valid: string;
}

export enum RepType {
    PowerSet,
    Power
}

export class Replacer {
    private static _replacerInstance: Replacer | null = null;
    private static Items: Item[] | null = [];
    private readonly _replacerFile: string;

    private constructor() {
        // Path.Combine is C# specific
        this._replacerFile = `${MidsContext.Config?.DataPath ?? ''}RepData.json`;

        // File.Exists and File.ReadAllText are C# specific
        // In a web environment, this would use localStorage or fetch
        let data: string = '';
        try {
            const stored = localStorage.getItem(this._replacerFile);
            if (stored) {
                data = stored;
            }
        } catch (ex: any) {
            showWarning(`Failed to load replacer data: ${ex}`);
        }

        if (data && data.trim() !== '') {
            try {
                Replacer.Items = JSON.parse(data) as Item[];
            } catch (ex: any) {
                showWarning(`Failed to parse replacer data: ${ex}`);
                Replacer.Items = [];
            }
        } else {
            Replacer.Items = [];
        }
    }

    static get Instance(): Replacer {
        if (Replacer._replacerInstance === null) {
            Replacer._replacerInstance = new Replacer();
        }
        return Replacer._replacerInstance;
    }

    private Serialize(): void {
        // File.WriteAllText is C# specific
        // In a web environment, this would use localStorage or a server API
        try {
            const serializedData = JSON.stringify(Replacer.Items);
            localStorage.setItem(this._replacerFile, serializedData);
        } catch (ex: any) {
            console.error('Failed to save replacer data:', ex);
        }
    }

    AddItem(invalid: string, valid: string): void {
        if (Replacer.Items === null) {
            Replacer.Items = [];
        }
        Replacer.Items.push({ Invalid: invalid, Valid: valid });
        this.Serialize();
    }
}

