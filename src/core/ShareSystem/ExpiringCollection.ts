// Converted from C# ExpiringCollection.cs
// Note: File I/O operations are C# specific and will need to be replaced with
// browser-compatible storage (e.g., localStorage, IndexedDB, or server-side API calls).

import type { ExpiringCollectionItem } from './ExpiringCollectionItem';
import { ExpiringCollectionItem as ExpiringCollectionItemClass } from './ExpiringCollectionItem';

export class ExpiringCollection {
    private _items: ExpiringCollectionItem[] | null = [];
    private readonly _dateFormat: string = 'MM/dd/yyyy hh:mm tt'; // Shared date format
    private readonly _userTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone; // User's time zone
    private readonly _dateFormats: string[] = ['MM/dd/yyyy hh:mm tt \'CST\'', 'MM/dd/yyyy hh:mm tt \'CDT\''];
    private readonly _centralTimeZone: string = 'America/Chicago'; // Central Time Zone
    private readonly _sharedPath: string = 'sharedBuilds.json';

    Add(item: ExpiringCollectionItem): void {
        if (this.IsExpired(item)) return;
        item.SharedOn = this.GetCurrentTimeInUserTimeZone();
        this._items?.push(item);
        this.SerializeToJson();
    }

    Update(newItem: ExpiringCollectionItem): void {
        const existingItem = this._items?.find(item => item.Id === newItem.Id);
        if (existingItem === null || existingItem === undefined) return;
        existingItem.Name = newItem.Name;
        existingItem.Archetype = newItem.Archetype;
        existingItem.Description = newItem.Description;
        existingItem.Primary = newItem.Primary;
        existingItem.Secondary = newItem.Secondary;
        existingItem.ExpiresAt = newItem.ExpiresAt;
        this.SerializeToJson();
    }

    private GetCurrentTimeInUserTimeZone(): string {
        const now = new Date();
        // Format date in user's timezone
        const formatter = new Intl.DateTimeFormat('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: this._userTimeZone
        });
        return formatter.format(now);
    }

    private SerializeToJson(): void {
        // File.WriteAllText is C# specific
        // In a web environment, this would use localStorage or a server API
        try {
            const json = JSON.stringify(this._items, null, 2);
            localStorage.setItem(this._sharedPath, json);
        } catch (ex: any) {
            console.error('Failed to save shared builds:', ex);
        }
    }

    DeserializeFromJson(): void {
        // File.Exists and File.ReadAllText are C# specific
        // In a web environment, this would use localStorage or a server API
        try {
            const stored = localStorage.getItem(this._sharedPath);
            if (stored) {
                this._items = JSON.parse(stored) as ExpiringCollectionItem[];
                this.RemoveExpiredItems();
            }
        } catch (ex: any) {
            console.warn('Failed to load shared builds:', ex);
            this._items = [];
        }
    }

    GetItems(): ExpiringCollectionItem[] | null {
        this.RemoveExpiredItems();
        return this._items;
    }

    private RemoveExpiredItems(): void {
        if (this._items === null) return;
        this._items = this._items.filter(item => !this.IsExpired(item));
        if (this._items.length !== this._items.length) {
            this.SerializeToJson();
        }
    }

    private IsExpired(item: ExpiringCollectionItem): boolean {
        if (!item.ExpiresAt) return false;

        for (const format of this._dateFormats) {
            // Parse the date string - simplified parsing
            // In a real implementation, you'd use a proper date parsing library
            const dateMatch = item.ExpiresAt.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})\s+(AM|PM)\s+(CST|CDT)/);
            if (!dateMatch) continue;

            const month = parseInt(dateMatch[1], 10) - 1; // JavaScript months are 0-indexed
            const day = parseInt(dateMatch[2], 10);
            const year = parseInt(dateMatch[3], 10);
            let hour = parseInt(dateMatch[4], 10);
            const minute = parseInt(dateMatch[5], 10);
            const ampm = dateMatch[6];
            const timezone = dateMatch[7];

            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;

            // Create date in Central Time
            const centralDate = new Date(year, month, day, hour, minute);
            // Convert to UTC (simplified - in production, use proper timezone conversion)
            const utcDate = new Date(centralDate.toLocaleString('en-US', { timeZone: 'UTC' }));
            const now = new Date();

            if (utcDate <= now) {
                return true;
            }
        }
        return false;
    }
}

