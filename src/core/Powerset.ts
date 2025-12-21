// Converted from C# Powerset.cs
import type { IPowerset } from './IPowerset';
import type { IPower } from './IPower';
import { ePowerSetType } from './Enums';
import { PowersetGroup } from './PowersetGroup';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';

export class Powerset implements IPowerset {
  private _fullName: string = '';
  private _groupName: string = '';
  private _powersetGroup: PowersetGroup | null = null;

  IsModified: boolean = false;
  IsNew: boolean = false;
  nID: number = -1;
  nArchetype: number = -1;
  DisplayName: string = '';
  SetType: ePowerSetType = ePowerSetType.None;
  Power: number[] = [];
  Powers: (IPower | null)[] = [];
  ImageName: string = '';
  SetName: string = '';
  Description: string = '';
  SubName: string = '';
  ATClass: string = '';
  UIDTrunkSet: string = '';
  nIDTrunkSet: number = -1;
  UIDLinkSecondary: string = '';
  nIDLinkSecondary: number = -1;
  UIDMutexSets: string[] = [];
  nIDMutexSets: number[] = [];

  constructor(templateOrReader?: IPowerset | BinaryReader) {
    if (templateOrReader instanceof BinaryReader) {
      const reader = templateOrReader;
      this.nID = -1;
      this.Powers = [];
      this.DisplayName = reader.readString();
      this.nArchetype = reader.readInt();
      this.SetType = reader.readInt() as ePowerSetType;
      this.ImageName = reader.readString();
      this._fullName = reader.readString();
      if (!this._fullName) {
        this._fullName = 'Orphan.' + this.DisplayName.replace(' ', '_');
      }
      this.SetName = reader.readString();
      this.Description = reader.readString();
      this.SubName = reader.readString();
      this.ATClass = reader.readString();
      this.UIDTrunkSet = reader.readString();
      this.UIDLinkSecondary = reader.readString();
      const num = reader.readInt();
      this.UIDMutexSets = new Array(num + 1);
      this.nIDMutexSets = new Array(num + 1);
      for (let index = 0; index <= num; index++) {
        this.UIDMutexSets[index] = reader.readString();
        this.nIDMutexSets[index] = reader.readInt();
      }
    } else if (templateOrReader) {
      const template = templateOrReader;
      this.nID = template.nID;
      this.nArchetype = template.nArchetype;
      this.DisplayName = template.DisplayName;
      this.SetType = template.SetType;
      this.ImageName = template.ImageName;
      this.FullName = template.FullName;
      this.SetName = template.SetName;
      this.Description = template.Description;
      this.SubName = template.SubName;
      this.ATClass = template.ATClass;
      this._powersetGroup = template.GetGroup();
      this.GroupName = template.GroupName;
      this.UIDTrunkSet = template.UIDTrunkSet;
      this.nIDTrunkSet = template.nIDTrunkSet;
      this.nIDLinkSecondary = template.nIDLinkSecondary;
      this.UIDLinkSecondary = template.UIDLinkSecondary;
      this.Powers = [...template.Powers];
      this.Power = [...template.Power];
      this.nIDMutexSets = [...template.nIDMutexSets];
      this.UIDMutexSets = [...template.UIDMutexSets];
    } else {
      this.nID = -1;
      this.nArchetype = -1;
      this.DisplayName = 'New Powerset';
      this.SetType = ePowerSetType.None;
      this.ImageName = '';
      this._fullName = '';
      this.SetName = '';
      this.Description = '';
      this.SubName = '';
      this.ATClass = '';
      this.UIDTrunkSet = '';
      this.nIDTrunkSet = -1;
      this.nIDLinkSecondary = -1;
      this.UIDLinkSecondary = '';
      this.Powers = [];
      this.Power = [];
      this.nIDMutexSets = [];
      this.UIDMutexSets = [];
    }
  }

  // Note: BinaryReader constructor removed as it's C# specific

  get FullName(): string {
    return this._fullName;
  }

  set FullName(value: string) {
    this._fullName = value;
    this._groupName = '';
  }

  get GroupName(): string {
    if (this._groupName === '') {
      this._groupName = this.FullName.split('.')[0];
    }
    return this._groupName;
  }

  set GroupName(value: string) {
    this._groupName = value;
  }

  GetGroup(): PowersetGroup {
    if (this._powersetGroup === null) {
      // Note: Would need to initialize from GroupName or database
      throw new Error('PowersetGroup not set');
    }
    return this._powersetGroup;
  }

  SetGroup(pg: PowersetGroup): void {
    this._powersetGroup = pg;
  }

  ClassOk(nIDClass: number): boolean {
    return (this.Powers.length > 0 && this.Powers[0]?.Requires.ClassOk(nIDClass)) ?? false;
  }

  GetArchetypes(): string[] {
    if (this.ATClass) {
      return [this.ATClass];
    }
    if (this.Powers.length <= 0) {
      return [];
    }
    return this.Powers[0]?.Requires.ClassName ? [...this.Powers[0].Requires.ClassName] : [];
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeString(this.DisplayName);
    writer.writeInt(this.nArchetype);
    writer.writeInt(this.SetType);
    writer.writeString(this.ImageName);
    writer.writeString(this.FullName);
    writer.writeString(this.SetName);
    writer.writeString(this.Description);
    writer.writeString(this.SubName);
    writer.writeString(this.ATClass);
    writer.writeString(this.UIDTrunkSet);
    writer.writeString(this.UIDLinkSecondary);
    writer.writeInt(this.UIDMutexSets.length - 1);
    for (let index = 0; index < this.UIDMutexSets.length; index++) {
      writer.writeString(this.UIDMutexSets[index]);
      writer.writeInt(this.nIDMutexSets[index]);
    }
  }
}

