// Converted from C# InherentDisplayItem.cs

import { IPower } from "@/core/IPower";

export class InherentDisplayItem {
  Priority: number = 0;
  Power: IPower;

  constructor(priority: number, power: IPower) {
    this.Power = power;
    this.Priority = priority;
  }
}

