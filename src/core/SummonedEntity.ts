// Converted from C# SummonedEntity.cs
import { eSummonEntity } from './Enums';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { IPower } from './IPower';

export class SummonedEntity {
  private _nClassID: number = 0;
  private _nID: number = -1;
  private _nPowerset: number[] = [];
  private _nUpgradePower: number[] = [];

  UID: string = '';
  DisplayName: string = '';
  PowersetFullName: string[] = [];
  UpgradePowerFullName: string[] = [];
  ClassName: string = '';
  EntityType: eSummonEntity = eSummonEntity.Pet;

  constructor(nIDOrReaderOrTemplate?: number | BinaryReader | SummonedEntity, nIdOverride?: number) {
    if (nIDOrReaderOrTemplate instanceof BinaryReader) {
      // Constructor from BinaryReader
      const reader = nIDOrReaderOrTemplate;
      this.UID = reader.readString();
      this.DisplayName = reader.readString();
      this.EntityType = reader.readInt() as eSummonEntity;
      this.ClassName = reader.readString();
      const powersetFullNameLength = reader.readInt();
      this.PowersetFullName = [];
      this._nPowerset = new Array(powersetFullNameLength);
      for (let index = 0; index < powersetFullNameLength; index++) {
        this.PowersetFullName.push(reader.readString());
      }
      const upgradePowerFullNameLength = reader.readInt();
      this.UpgradePowerFullName = [];
      this._nUpgradePower = new Array(upgradePowerFullNameLength);
      for (let index = 0; index < upgradePowerFullNameLength; index++) {
        this.UpgradePowerFullName.push(reader.readString());
      }
    } else if (nIDOrReaderOrTemplate && typeof nIDOrReaderOrTemplate === 'object') {
      // Copy constructor from template
      const template = nIDOrReaderOrTemplate;
      this.UID = template.UID;
      this.EntityType = template.EntityType;
      this.ClassName = template.ClassName;
      this._nClassID = template._nClassID;
      this.DisplayName = template.DisplayName;
      this._nID = nIdOverride !== undefined ? nIdOverride : template._nID;
      this.PowersetFullName = [...template.PowersetFullName];
      this._nPowerset = [...template._nPowerset];
      this.UpgradePowerFullName = [...template.UpgradePowerFullName];
      this._nUpgradePower = [...template._nUpgradePower];
    } else if (nIDOrReaderOrTemplate !== undefined) {
      // Constructor with nID
      this._nID = nIDOrReaderOrTemplate as number;
    }
  }

  GetNPowerset(): readonly number[] {
    return this._nPowerset;
  }

  GetNId(): number {
    return this._nID;
  }

  GetNClassId(): number {
    return this._nClassID;
  }

  GetPowers(): Map<IPower, IPower | null> {
    // Note: This method depends on DatabaseAPI which would need to be implemented
    // Simplified version - would need full DatabaseAPI implementation
    const powersByPowerset = new Map<string, IPower[]>();
    // Implementation would go here with DatabaseAPI calls
    const allPowers = new Map<IPower, IPower | null>();
    return allPowers;
  }

  UpdateNClassID(nidFromUidClass: (uid: string) => number): boolean {
    const num3 = nidFromUidClass(this.ClassName);
    if (num3 > -1) {
      this._nClassID = num3;
    }
    return num3 > -1;
  }

  PAdd(): void {
    this.PowersetFullName = [...this.PowersetFullName, 'Empty'];
  }

  PDelete(selectedIndex: number): void {
    this.PowersetFullName = this.PowersetFullName.filter((_, idx) => idx !== selectedIndex);
  }

  UGAdd(): void {
    this.UpgradePowerFullName = [...this.UpgradePowerFullName, 'Empty'];
  }

  UGDelete(selectedIndex: number): void {
    this.UpgradePowerFullName = this.UpgradePowerFullName.filter((_, idx) => idx !== selectedIndex);
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeString(this.UID);
    writer.writeString(this.DisplayName);
    writer.writeInt(this.EntityType);
    writer.writeString(this.ClassName);
    writer.writeInt(this.PowersetFullName.length);
    for (let index = 0; index < this.PowersetFullName.length; index++) {
      writer.writeString(this.PowersetFullName[index]);
    }
    writer.writeInt(this.UpgradePowerFullName.length);
    for (let index = 0; index < this.UpgradePowerFullName.length; index++) {
      writer.writeString(this.UpgradePowerFullName[index]);
    }
  }

  static MatchSummonIDs(
    nIdFromUidClass: (uid: string) => number,
    nidFromUidPowerset: (uid: string) => number,
    nidFromUidPower: (uid: string) => number,
    entities: SummonedEntity[]
  ): void {
    for (let ei = 0; ei < entities.length; ei++) {
      const entity = entities[ei];
      entity._nID = ei;
      entity._nClassID = nIdFromUidClass(entity.ClassName);
      entity._nPowerset = entity.PowersetFullName.map(nidFromUidPowerset);
      entity._nUpgradePower = entity.UpgradePowerFullName.map(nidFromUidPower);
    }
  }
}

