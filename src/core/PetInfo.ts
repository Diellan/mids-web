// Converted from C# PetInfo.cs
import { IPower } from './IPower';
import type { SummonedEntity } from './SummonedEntity';

export class PetPower {
  readonly BasePower: IPower;
  readonly BuffedPower: IPower;

  constructor(basePower: IPower, buffedPower: IPower) {
    this.BasePower = basePower;
    this.BuffedPower = buffedPower;
  }
}

class PetPowersData {
  readonly BasePowers: IPower[];
  readonly BuffedPowers: IPower[];

  constructor(basePowers: IPower[], buffedPowers: IPower[]) {
    this.BasePowers = basePowers.filter(p => p.IsPetPower);
    this.BuffedPowers = buffedPowers.filter(p => p.IsPetPower);
  }
}

export class PetInfo {
  private powersDataUpdated?: (sender: PetInfo) => void;

  readonly PowerEntryIndex: number;
  private readonly _basePower: IPower | null;
  private readonly _entity: SummonedEntity | null;
  private _powers: IPower[] | null = null;
  private _lastPower: number = -1;
  private static PowersData: PetPowersData | null = null;

  constructor(entity?: SummonedEntity, idxPower?: number, basePower?: IPower) {
    if (entity !== undefined && idxPower !== undefined && basePower !== undefined) {
      this._entity = entity;
      this.PowerEntryIndex = idxPower;
      this._basePower = basePower;
      this.CompilePetPowers();
      this.GeneratePetPowerData();
    } else {
      this.PowerEntryIndex = -1;
      this._basePower = null;
      this._entity = null;
    }
  }

  get HasEmptyBasePower(): boolean {
    return this._basePower === null;
  }

  private CompilePetPowers(): Set<string> {
    const powerNames = new Set<string>();
    if (this._entity === null) {
      return powerNames;
    }

    const allPowers = this._entity.GetPowers();
    // Note: Would need MidsContext.Character.CurrentBuild access
    // For now, simplified version
    const filteredPowers: IPower[] = [];
    for (const [power] of allPowers) {
      filteredPowers.push(power);
      powerNames.add(power.FullName);
    }

    this._powers = filteredPowers;
    return powerNames;
  }

  ExecuteUpdate(outPowers?: { powers: Set<string> }): void {
    if (outPowers) {
      outPowers.powers = this.CompilePetPowers();
    }
    this.GeneratePetPowerData();
  }

  GetPetPower(power?: IPower): PetPower | null {
    if (power) {
      this._lastPower = power.PowerIndex;
    }

    if (PetInfo.PowersData !== null && PetInfo.PowersData.BasePowers.length > 0) {
      const targetIndex = power ? power.PowerIndex : this._lastPower;
      if (targetIndex < 0 && PetInfo.PowersData.BasePowers.length > 0) {
        return new PetPower(
          PetInfo.PowersData.BasePowers[0],
          PetInfo.PowersData.BuffedPowers[0]
        );
      }

      const basePower = PetInfo.PowersData.BasePowers.find(p => p.PowerIndex === targetIndex);
      const buffedPower = PetInfo.PowersData.BuffedPowers.find(p => p.PowerIndex === targetIndex);

      if (basePower && buffedPower) {
        return new PetPower(basePower, buffedPower);
      }
    }

    return null;
  }

  private GeneratePetPowerData(): void {
    if (this._powers === null || this._basePower === null) {
      return;
    }

    // Note: Would need MainModule.MidsController.Toon?.GenerateBuffedPowers implementation
    // For now, simplified version
    // const powerData = MainModule.MidsController.Toon?.GenerateBuffedPowers(this._powers, this.PowerEntryIndex);
    // if (powerData !== null) {
    //   PetInfo.PowersData = new PetPowersData(powerData.basePowers, powerData.buffedPowers);
    // }

    if (this.powersDataUpdated) {
      this.powersDataUpdated(this);
    }
  }
}

