// Converted from C# Archetype.cs
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { eClassType } from '../../Enums';

export class Archetype {
  IsModified: boolean = false;
  IsNew: boolean = false;

  Idx: number = 0;
  DisplayName: string = '';
  ClassType: eClassType = eClassType.None;
  Hitpoints: number = 5000;
  HPCap: number = 5000;
  DescLong: string = '';
  DescShort: string = '';
  ResCap: number = 90;
  RechargeCap: number = 5;
  DamageCap: number = 4;
  RegenCap: number = 20;
  RecoveryCap: number = 5;
  Origin: string[] = [];
  Primary: number[] = [];
  Secondary: number[] = [];
  Ancillary: number[] = [];
  PerceptionCap: number = 1153;
  ClassName: string = '';
  Column: number = 0;
  PrimaryGroup: string = '';
  SecondaryGroup: string = '';
  readonly EpicGroup: string = 'EPIC';
  PoolGroup: string = 'POOL';
  Playable: boolean = true;
  Pet: boolean = false;
  BaseRecovery: number = 1.67;
  BaseRegen: number = 1;
  BaseThreat: number = 1;

  constructor(template?: Archetype) {
    this.BaseThreat = 1;
    this.BaseRegen = 1;
    this.BaseRecovery = 1.67;
    this.Playable = true;
    this.PoolGroup = 'POOL';
    this.EpicGroup = 'EPIC';
    this.SecondaryGroup = '';
    this.PrimaryGroup = '';
    this.ClassName = '';
    this.PerceptionCap = 1153;
    this.Ancillary = [];
    this.Secondary = [];
    this.Primary = [];
    this.Origin = ['Magic', 'Mutation', 'Natural', 'Science', 'Technology'];
    this.RecoveryCap = 5;
    this.RegenCap = 20;
    this.DamageCap = 4;
    this.RechargeCap = 5;
    this.ResCap = 90;
    this.DescShort = '';
    this.DescLong = '';
    this.HPCap = 5000;
    this.Hitpoints = 5000;
    this.ClassType = eClassType.None;
    this.DisplayName = 'New Archetype';
    this.ClassName = 'NewClass';

    if (template) {
      this.Idx = template.Idx;
      this.DisplayName = template.DisplayName;
      this.HPCap = template.HPCap;
      this.Hitpoints = template.Hitpoints;
      this.DescLong = template.DescLong;
      this.DescShort = template.DescShort;
      this.ResCap = template.ResCap;
      this.Origin = [...template.Origin];
      this.Primary = [...template.Primary];
      this.Secondary = [...template.Secondary];
      this.Ancillary = [...template.Ancillary];
      this.ClassName = template.ClassName;
      this.ClassType = template.ClassType;
      this.Column = template.Column;
      this.PrimaryGroup = template.PrimaryGroup;
      this.SecondaryGroup = template.SecondaryGroup;
      this.Playable = template.Playable;
      this.RechargeCap = template.RechargeCap;
      this.DamageCap = template.DamageCap;
      this.RecoveryCap = template.RecoveryCap;
      this.RegenCap = template.RegenCap;
      this.BaseRecovery = template.BaseRecovery;
      this.BaseRegen = template.BaseRegen;
      this.BaseThreat = template.BaseThreat;
      this.PerceptionCap = template.PerceptionCap;
    }
  }

  static fromDataView(reader: BinaryReader) : Archetype {
    const archetype = new Archetype();
    archetype.DisplayName = reader.readString();
    archetype.Hitpoints = reader.readInt();
    archetype.HPCap = reader.readFloat();
    archetype.DescLong = reader.readString();
    archetype.ResCap = reader.readFloat();
    var num = reader.readInt();
    archetype.Origin = new Array(num + 1);
    for (var index = 0; index <= num; ++index)
        archetype.Origin[index] = reader.readString();
    archetype.ClassName = reader.readString();
    archetype.ClassType = reader.readInt() as eClassType;
    archetype.Column = reader.readInt();
    archetype.DescShort = reader.readString();
    archetype.PrimaryGroup = reader.readString();
    archetype.SecondaryGroup = reader.readString();
    archetype.Playable = reader.readBoolean();
    archetype.RechargeCap = reader.readFloat();
    archetype.DamageCap = reader.readFloat();
    archetype.RecoveryCap = reader.readFloat();
    archetype.RegenCap = reader.readFloat();
    archetype.BaseRecovery = reader.readFloat();
    archetype.BaseRegen = reader.readFloat();
    archetype.BaseThreat = reader.readFloat();
    archetype.PerceptionCap = reader.readFloat();
    return archetype;
  }

  get Hero(): boolean {
    return this.ClassType === eClassType.Hero || this.ClassType === eClassType.HeroEpic;
  }

  get Epic(): boolean {
    return this.ClassType === eClassType.HeroEpic || this.ClassType === eClassType.VillainEpic;
  }

  CompareTo(obj: any): number {
    if (obj === null) {
      throw new Error('Object cannot be null');
    }

    if (!(obj instanceof Archetype)) {
      throw new Error('Comparison failed - Passed object was not an Archetype Class!');
    }

    const archetype = obj as Archetype;

    if (this.Playable && !archetype.Playable) {
      return -1;
    }
    if (!this.Playable && archetype.Playable) {
      return 1;
    }
    if (this.ClassType === eClassType.None && archetype.ClassType !== eClassType.None) {
      return 1;
    }
    if (this.ClassType !== eClassType.None && archetype.ClassType === eClassType.None) {
      return -1;
    }
    if (this.ClassType > archetype.ClassType) {
      return 1;
    }
    if (this.ClassType < archetype.ClassType) {
      return -1;
    }

    const classNameMatch = this.ClassName.localeCompare(archetype.ClassName, undefined, { sensitivity: 'base' });
    if (classNameMatch !== 0) {
      return classNameMatch;
    }

    if (this.Column > archetype.Column) {
      return 1;
    }
    return this.Column < archetype.Column ? -1 : 0;
  }

  // Note: StoreTo method with BinaryWriter removed as it's C# specific
  StoreTo(writer: BinaryWriter) {
    writer.writeString(this.DisplayName);
    writer.writeInt(this.Hitpoints);
    writer.writeFloat(this.HPCap);
    writer.writeString(this.DescLong);
    writer.writeFloat(this.ResCap);
    writer.writeInt(this.Origin.length - 1);
    this.Origin.forEach(index => writer.writeString(index));
    writer.writeString(this.ClassName);
    writer.writeInt(this.ClassType as number);
    writer.writeInt(this.Column);
    writer.writeString(this.DescShort);
    writer.writeString(this.PrimaryGroup);
    writer.writeString(this.SecondaryGroup);
    writer.writeBoolean(this.Playable);
    writer.writeFloat(this.RechargeCap);
    writer.writeFloat(this.DamageCap);
    writer.writeFloat(this.RecoveryCap);
    writer.writeFloat(this.RegenCap);
    writer.writeFloat(this.BaseRecovery);
    writer.writeFloat(this.BaseRegen);
    writer.writeFloat(this.BaseThreat);
    writer.writeFloat(this.PerceptionCap);
  }

  static GetNpcClasses(): string[] {
    return [
      'Henchman',
      'Pet',
      'Arch-villain',
      'Elite Boss',
      'Boss',
      'Police',
      'Hamidon',
      'Giant Monster',
      'Rularuu',
      'Boss Signature Pets',
      'Lieutenant',
      'Lt_LongRangeDrone',
      'Minion',
      'Monument',
      'Sniper',
      'OilSlickTarget',
      'PracticeBot',
      'Underling',
      'Swarm',
      'Minion_UnkillableNPC',
      'Reichsman',
      ''
    ];
  }
}

