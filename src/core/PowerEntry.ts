// Converted from C# PowerEntry.cs
import type { IPower } from './IPower';
import type { IPowerset } from './IPowerset';
import { ePowerState, ePowerType, dmModes } from './Enums';
import { SlotEntry } from './SlotEntry';
import { PowerSubEntry } from './PowerSubEntry';
import { I9Slot } from './I9Slot';
import { DatabaseAPI } from './DatabaseAPI';
import { MidsContext } from './Base/Master_Classes/MidsContext';
import { ServerData } from './ServerData';
import { nanoid } from "nanoid";

export class PowerEntry {
  readonly id: string;
  Level: number = -1;
  NIDPowerset: number = -1;
  IDXPower: number = -1;
  NIDPower: number = -1;
  Tag: boolean = false;
  StatInclude: boolean = false;
  ProcInclude: boolean = false;
  InherentSlotsUsed: number = 0;
  private _VirtualVariableValue: number = 0;
  private _VariableValue: number = 0;
  Slots: SlotEntry[] = [];
  SubPowers: PowerSubEntry[] = [];
  readonly Chosen: boolean = false;

  constructor(power?: IPower, iLevel?: number, chosen?: boolean) {
    this.id = nanoid();
    this.StatInclude = false;
    this.ProcInclude = false;
    this.InherentSlotsUsed = 0;

    if (iLevel !== undefined) {
      this.Level = iLevel;
      this.Chosen = chosen ?? false;
    } else {
      this.Level = -1;
    }

    if (power) {
      this.NIDPowerset = power.PowerSetID;
      this.IDXPower = power.PowerSetIndex;
      this.NIDPower = power.PowerIndex;

      if (power.NIDSubPower.length > 0) {
        this.SubPowers = power.NIDSubPower.map(nID => {
          const subEntry = new PowerSubEntry();
          subEntry.nIDPower = nID;
          subEntry.Powerset = DatabaseAPI.Database.Power[subEntry.nIDPower].PowerSetID;
          subEntry.Power = DatabaseAPI.Database.Power[subEntry.nIDPower].PowerSetIndex;
          return subEntry;
        });
      } else {
        this.SubPowers = [];
      }

      if (power.Slottable && power.GetPowerSet()?.GroupName !== 'Incarnate') {
        this.Slots = [new SlotEntry()];
        this.Slots[0].Enhancement = new I9Slot();
        this.Slots[0].FlippedEnhancement = new I9Slot();
        this.Slots[0].Level = this.Level;
        this.Slots[0].IsInherent = false;
      } else {
        this.Slots = [];
      }

      if (
        (power.PowerType === ePowerType.Toggle || power.PowerType === ePowerType.Auto_) &&
        power.AlwaysToggle
      ) {
        this.StatInclude = true;
      }
    } else {
      this.IDXPower = -1;
      this.NIDPowerset = -1;
      this.NIDPower = -1;
      this.Slots = [];
      this.SubPowers = [];
    }

    this.Tag = false;

    if (this.Power && this.Power.VariableStart > this.Power.VariableMin && this.Power.VariableStart <= this.Power.VariableMax) {
      this.VariableValue = this.Power.VariableStart;
      this.Power.Stacks = this.VariableValue;
    } else {
      this.VariableValue = 0;
    }
  }

  get VirtualVariableValue(): number {
    return this._VirtualVariableValue;
  }

  set VirtualVariableValue(value: number) {
    this._VirtualVariableValue = value;
  }

  get VariableValue(): number {
    return this._VirtualVariableValue;
  }

  set VariableValue(value: number) {
    this._VirtualVariableValue = value;
    this._VariableValue = value;
  }

  get InternalVariableValue(): number {
    return this._VariableValue;
  }

  get State(): ePowerState {
    if (this.Power === null) {
      return this.Chosen ? ePowerState.Empty : ePowerState.Disabled;
    }
    return ePowerState.Used;
  }

  get Power(): IPower | null {
    return this.NIDPower >= 0 && this.NIDPower <= DatabaseAPI.Database.Power.length - 1
      ? DatabaseAPI.Database.Power[this.NIDPower]
      : null;
  }

  get PowerSet(): IPowerset | null {
    return this.Power ? this.Power.GetPowerSet() : null;
  }

  get AllowFrontLoading(): boolean {
    return this.Power?.AllowFrontLoading ?? false;
  }

  get Name(): string {
    return this.Power?.DisplayName ?? '';
  }

  get IsSummonEntry(): boolean {
    return this.Power?.IsSummonPower ?? false;
  }

  get IsPetEntry(): boolean {
    return this.Power?.IsPetPower ?? false;
  }

  get Virtual(): boolean {
    return !this.Chosen && this.SubPowers.length > 0;
  }

  get SlotCount(): number {
    return this.Slots?.length ?? 0;
  }

  Clone(): PowerEntry {
    const powerEntry = new PowerEntry(this.Power ?? undefined, this.Level, this.Chosen);
    powerEntry.StatInclude = this.StatInclude;
    powerEntry.ProcInclude = this.ProcInclude;
    powerEntry.Tag = this.Tag;
    powerEntry.VariableValue = this.VariableValue;
    powerEntry.InherentSlotsUsed = this.InherentSlotsUsed;
    powerEntry.SubPowers = this.SubPowers.map(sp => {
      const newSp = new PowerSubEntry();
      newSp.Assign(sp);
      return newSp;
    });
    powerEntry.Slots = this.Slots.map(slot => {
      const newSlot = new SlotEntry();
      newSlot.Assign(slot);
      return newSlot;
    });
    return powerEntry;
  }

  ClearInvisibleSlots(): void {
    if (this.SlotCount > 0) {
      if ((this.Power === null && !this.Chosen) || (this.Power?.Slottable === false)) {
        this.Slots = [];
      } else if (this.SlotCount > 6) {
        this.Slots = this.Slots.slice(0, 6);
      }
    }
  }

  Assign(iPe: PowerEntry): void {
    this.Level = iPe.Level;
    this.NIDPowerset = iPe.NIDPowerset;
    this.IDXPower = iPe.IDXPower;
    this.NIDPower = iPe.NIDPower;
    this.Tag = iPe.Tag;
    this.StatInclude = iPe.StatInclude;
    this.VariableValue = iPe.VariableValue;
    this.ProcInclude = iPe.ProcInclude;
    this.InherentSlotsUsed = iPe.InherentSlotsUsed;

    if (iPe.Slots) {
      this.Slots = iPe.Slots.map(slot => {
        const newSlot = new SlotEntry();
        newSlot.Assign(slot);
        return newSlot;
      });
    } else {
      this.Slots = [];
    }

    if (iPe.SubPowers) {
      this.SubPowers = iPe.SubPowers.map(sp => {
        const newSp = new PowerSubEntry();
        newSp.Assign(sp);
        return newSp;
      });
    } else {
      this.SubPowers = [];
    }
  }

  HasProc(): boolean {
    for (let index = 0; index < this.SlotCount; index++) {
      if (this.Slots[index].Enhancement.Enh < 0) continue;
      const enh = DatabaseAPI.Database.Enhancements[this.Slots[index].Enhancement.Enh];
      if (!enh) continue;
      const power = enh.GetPower();
      if (enh.IsProc && power !== null) {
        return true;
      }
    }
    return false;
  }

  CanIncludeForStats(): boolean {
    if (this.NIDPowerset <= -1) {
      return false;
    }

    if (this.IDXPower <= -1) {
      return false;
    }

    const power = DatabaseAPI.Database.Powersets[this.NIDPowerset]?.Powers[this.IDXPower];
    if (!power) {
      return false;
    }

    switch (power.PowerType) {
      case ePowerType.Auto_:
        return true;
      case ePowerType.Click:
        return power.ClickBuff ?? false;
      case ePowerType.Toggle:
        return true;
      default:
        return false;
    }
  }

  CheckVariableBounds(): void {
    if (this.Power?.VariableEnabled !== true) {
      this.VariableValue = 0;
    } else if (this.Power.VariableMin > this.VariableValue) {
      this.VariableValue = this.Power.VariableMin;
    } else if (this.Power.VariableMax < this.VariableValue) {
      this.VariableValue = this.Power.VariableMax;
    }
  }

  ValidateSlots(): void {
    if (!this.Power) return;
    
    for (let index = 0; index < this.Slots.length; index++) {
      if (!this.Power.IsEnhancementValid(this.Slots[index].Enhancement.Enh)) {
        this.Slots[index].Enhancement = new I9Slot();
      }

      if (!this.Power.IsEnhancementValid(this.Slots[index].FlippedEnhancement.Enh)) {
        this.Slots[index].FlippedEnhancement = new I9Slot();
      }
    }
  }

  Reset(): void {
    this.NIDPowerset = -1;
    this.IDXPower = -1;
    this.NIDPower = -1;
    this.Tag = false;
    this.StatInclude = false;
    this.ProcInclude = false;
    this.InherentSlotsUsed = 0;
    this.SubPowers = [];

    if (this.Slots.length === 1 && this.Slots[0].Enhancement.Enh === -1) {
      this.Slots = [];
    }
  }

  AddSlot(iLevel: number, isInherent: boolean = false): number {
    let slotIdx: number;
    if (this.SlotCount > 5 || !this.Power?.Slottable) {
      slotIdx = -1;
    } else {
      let index1: number;
      if (this.Slots.length === 0) {
        this.Slots = [new SlotEntry()];
        index1 = 0;
      } else {
        let num2 = 0;
        for (let index2 = 1; index2 < this.Slots.length; index2++) {
          if (this.Slots[index2].Level <= iLevel) {
            num2 = index2;
          }
        }

        index1 = num2 + 1;

        const slotEntryArray: SlotEntry[] = new Array(this.Slots.length + 1);
        for (let i = 0; i < slotEntryArray.length; i++) {
          slotEntryArray[i] = new SlotEntry();
        }

        let index3 = -1;

        for (let index2 = 0; index2 < slotEntryArray.length; index2++) {
          if (index2 === index1) {
            continue;
          }
          index3++;
          if (index3 > 0 && index3 < 2 && isInherent) {
            this.Slots[index3].IsInherent = true;
          }
          slotEntryArray[index2].Assign(this.Slots[index3]);
        }

        this.Slots = new Array(slotEntryArray.length);
        for (let i = 0; i < this.Slots.length; i++) {
          this.Slots[i] = new SlotEntry();
        }
        
        for (let index2 = 0; index2 < this.Slots.length; index2++) {
          if (index2 === index1) {
            continue;
          }

          if (index2 > 0 && index2 < 2 && isInherent) {
            slotEntryArray[index2].IsInherent = true;
          }
          this.Slots[index2].Assign(slotEntryArray[index2]);
        }
      }

      this.Slots[index1].Enhancement = new I9Slot();
      this.Slots[index1].FlippedEnhancement = new I9Slot();
      this.Slots[index1].Level = iLevel;
      if (isInherent) {
        this.Slots[index1].IsInherent = true;
        this.Slots[index1].Level = iLevel - 1;
      }
      slotIdx = index1;
    }
    return slotIdx;
  }

  AddSlot2(lvl: number): number {
    if (this.SlotCount > 5 || !this.Power?.Slottable) {
      return -1;
    }

    if (this.Slots.length === 0) {
      this.Slots = [new SlotEntry()];
      this.Slots[0].Enhancement = new I9Slot();
      this.Slots[0].FlippedEnhancement = new I9Slot();
      this.Slots[0].Level = lvl;
      return 0;
    }

    const newSlot = new SlotEntry();
    newSlot.Enhancement = new I9Slot();
    newSlot.FlippedEnhancement = new I9Slot();
    newSlot.Level = lvl;
    this.Slots = [...this.Slots, newSlot];
    return this.Slots.length - 1;
  }

  CanRemoveSlot(slotIdx: number): boolean {
    if (slotIdx < 0 || slotIdx > this.Slots.length - 1) {
      throw new Error('Invalid slot index');
    }

    if (slotIdx === 0 && this.NIDPowerset > -1) {
      throw new Error("This slot was added automatically and can't be removed without also removing the power.");
    }

    const config = MidsContext.Config;
    const serverData = ServerData.Instance;
    
    if (slotIdx > 0 && this.Slots[slotIdx].IsInherent && 
        config?.BuildMode === dmModes.Normal && 
        serverData?.EnableInherentSlotting) {
      throw new Error("This slot is an inherent slot and can only be removed/re-assigned in Respec mode which assumes you have 6 slotted the power in game prior to respec.");
    }

    if (slotIdx > 0 && this.Slots[slotIdx].IsInherent && 
        config?.BuildMode === dmModes.LevelUp && 
        serverData?.EnableInherentSlotting) {
      const powerFullName = this.Power?.FullName ?? '';
      if (powerFullName === "Inherent.Fitness.Health") {
        if (this.Level < (serverData?.HealthSlot1Level ?? 0)) {
          return true;
        } else if (this.Level < (serverData?.HealthSlot2Level ?? 0)) {
          return true;
        }
      } else if (powerFullName === "Inherent.Fitness.Stamina") {
        if (this.Level < (serverData?.StaminaSlot1Level ?? 0)) {
          return true;
        } else if (this.Level < (serverData?.StaminaSlot2Level ?? 0)) {
          return true;
        }
      }
      throw new Error("This slot is an inherent slot and can only be removed/re-assigned in Respec mode which assumes you have 6 slotted the power in game prior to respec.");
    }

    if (slotIdx !== 0 || this.Slots.length <= 1) {
      return true;
    }

    throw new Error("This slot was added automatically with a power, and can't be removed until you've removed all other slots from this power.");
  }

  RemoveSlot(slotIdx: number): void {
    if (slotIdx < 0 || slotIdx > this.Slots.length - 1) {
      throw new Error('Invalid slot index');
    }

    this.Slots.splice(slotIdx, 1);
  }
}

