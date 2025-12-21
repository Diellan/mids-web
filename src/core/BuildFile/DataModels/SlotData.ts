// Converted from C# SlotData.cs
import type { EnhancementData } from './EnhancementData';

export class SlotData {
    Level: number = 0;
    IsInherent: boolean = false;
    Enhancement: EnhancementData | null = null;
    FlippedEnhancement: EnhancementData | null = null;
}

