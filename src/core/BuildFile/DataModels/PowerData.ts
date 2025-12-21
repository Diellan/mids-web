// Converted from C# PowerData.cs
import type { SubPowerData } from './SubPowerData';
import type { SlotData } from './SlotData';

export class PowerData {
    PowerName: string = '';
    Level: number = -1;
    StatInclude: boolean = false;
    ProcInclude: boolean = false;
    VariableValue: number = 0;
    InherentSlotsUsed: number = 0;
    SubPowerEntries: SubPowerData[] = [];
    SlotEntries: SlotData[] = [];
}

