// Converted from C# PowerSubEntry.cs
export class PowerSubEntry {
  nIDPower: number = -1;
  Power: number = -1;
  Powerset: number = -1;
  StatInclude: boolean = false;

  Assign(iPowerSubEntry: PowerSubEntry): void {
    this.Powerset = iPowerSubEntry.Powerset;
    this.Power = iPowerSubEntry.Power;
    this.nIDPower = iPowerSubEntry.nIDPower;
    this.StatInclude = iPowerSubEntry.StatInclude;
  }
}

