// Converted from C# SlotData.cs
import type { EnhancementData } from './EnhancementData';

export interface SlotData {
    Level: number;
    IsInherent: boolean;
    Enhancement: EnhancementData | null;
    FlippedEnhancement: EnhancementData | null;
}

