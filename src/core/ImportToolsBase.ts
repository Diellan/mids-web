// Converted from C# ImportToolsBase.cs
import type { IPower } from './IPower';
import type { IPowerset } from './IPowerset';
import type { I9Slot } from './I9Slot';
import { DatabaseAPI } from './DatabaseAPI';

export class BuilderApp {
    Software: string = '';
    Version: string = '';
}

export class RawCharacterInfo {
    Alignment: string = '';
    Archetype: string = '';
    Level: number = 0;
    Name: string = '';
    Origin: string = '';
}

export class RawEnhData {
    Boosters: number = 0;
    eData: number = 0;
    HasCatalyst: boolean = false; // NOT FULLY IMPLEMENTED
    InternalName: string = '';
    Level: number = 0;
}

export class RawPowerData {
    DisplayName: string = '';
    FullName: string = '';
    Level: number = 0;
    pData: IPower | null = null;
    Powerset: IPowerset | null = null;
    Slots: RawEnhData[] = [];
    Valid: boolean = false;
}

export class UniqueList<T> extends Array<T> {
    override push(...items: T[]): number {
        let count = 0;
        for (const item of items) {
            if (!this.includes(item)) {
                super.push(item);
                count++;
            }
        }
        return count;
    }

    Add(item: T): void {
        if (!this.includes(item)) {
            this.push(item);
        }
    }

    FromList(listElements: T[]): void {
        this.length = 0;
        this.push(...listElements);
    }
}

export class SlotLevelQueue {
    private Level: number = -1;
    private SlotsAtLevel: number = 0;

    PickSlot(): number {
        if (this.Level === 49 && this.SlotsAtLevel === 0) return 50;

        if (this.SlotsAtLevel > 0) {
            this.SlotsAtLevel--;
            return this.Level;
        }

        while (this.SlotsAtLevel === 0 && this.Level < 50) {
            this.Level++;
            this.SlotsAtLevel = DatabaseAPI.Database.Levels[this.Level].Slots;
        }

        this.SlotsAtLevel--;
        return this.Level;
    }
}

