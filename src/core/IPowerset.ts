// Converted from C# IPowerset.cs
import type { IPower } from './IPower';
import { ePowerSetType } from './Enums';
import { PowersetGroup } from './PowersetGroup';

export interface IPowerset {
  IsModified: boolean;

  nID: number;

  nArchetype: number;

  DisplayName: string;

  SetType: ePowerSetType;

  Power: number[];

  Powers: (IPower | null)[];

  ImageName: string;

  FullName: string;

  SetName: string;

  Description: string;

  SubName: string;

  ATClass: string;

  UIDTrunkSet: string;

  nIDTrunkSet: number;

  UIDLinkSecondary: string;

  nIDLinkSecondary: number;

  UIDMutexSets: string[];

  nIDMutexSets: number[];

  GroupName: string;

  GetGroup(): PowersetGroup;
  SetGroup(group: PowersetGroup): void;

  ClassOk(nIDClass: number): boolean;

  GetArchetypes(): string[];

  // Note: StoreTo method with BinaryWriter removed as it's C# specific
  // StoreTo(writer: BinaryWriter): void;
}

