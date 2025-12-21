// Converted from C# PowersetGroup.cs
import type { IPowerset } from './IPowerset';

export class PowersetGroup {
  readonly Name: string;
  readonly Powersets: Map<string, IPowerset | null>;

  constructor(name: string) {
    this.Name = name;
    this.Powersets = new Map<string, IPowerset | null>();
  }

  CompareTo(obj: any): number {
    if (obj instanceof PowersetGroup) {
      return this.Name.localeCompare(obj.Name, undefined, { sensitivity: 'base' });
    }
    throw new Error('Comparison failed - Passed object was not a PowersetGroup!');
  }
}

