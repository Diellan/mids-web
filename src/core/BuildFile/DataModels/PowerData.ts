// Converted from C# PowerData.cs
import type { SubPowerData } from './SubPowerData';
import type { SlotData } from './SlotData';

export interface PowerData {
    PowerName: string;
    Level: number;
    StatInclude: boolean;
    ProcInclude: boolean;
    VariableValue: number;
    InherentSlotsUsed: number;
    SubPowerEntries: SubPowerData[];
    SlotEntries: SlotData[];
}

export const EmptyPowerData: PowerData = {
    PowerName: '',
    Level: -1,
    StatInclude: false,
    ProcInclude: false,
    VariableValue: 0,
    InherentSlotsUsed: 0,
    SubPowerEntries: [],
    SlotEntries: [],
};

