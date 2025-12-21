// Converted from C# Requirement.cs
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';

export class Requirement {
  ClassName: string[] = [];
  ClassNameNot: string[] = [];
  NClassName: number[] = [];
  NClassNameNot: number[] = [];
  NPowerID: number[][] = [];
  NPowerIDNot: number[][] = [];
  PowerID: string[][] = [];
  PowerIDNot: string[][] = [];

  constructor(iReqOrReader?: Requirement | BinaryReader) {
    if (iReqOrReader instanceof BinaryReader) {
      // Constructor from BinaryReader
      const reader = iReqOrReader;
      const classNameLength = reader.readInt() + 1;
      this.ClassName = [];
      for (let index = 0; index < classNameLength; index++) {
        this.ClassName.push(reader.readString());
      }
      const classNameNotLength = reader.readInt() + 1;
      this.ClassNameNot = [];
      for (let index = 0; index < classNameNotLength; index++) {
        this.ClassNameNot.push(reader.readString());
      }
      const powerIDLength = reader.readInt() + 1;
      this.PowerID = [];
      for (let index = 0; index < powerIDLength; index++) {
        this.PowerID.push([reader.readString(), reader.readString()]);
      }
      const powerIDNotLength = reader.readInt() + 1;
      this.PowerIDNot = [];
      for (let index = 0; index < powerIDNotLength; index++) {
        this.PowerIDNot.push([reader.readString(), reader.readString()]);
      }
    } else if (iReqOrReader) {
      // Copy constructor
      const iReq = iReqOrReader;
      this.ClassName = [...iReq.ClassName];
      this.ClassNameNot = [...iReq.ClassNameNot];
      this.NClassName = [...iReq.NClassName];
      this.NClassNameNot = [...iReq.NClassNameNot];
      this.PowerID = iReq.PowerID.map(p => [...p]);
      this.PowerIDNot = iReq.PowerIDNot.map(p => [...p]);
      this.NPowerID = iReq.NPowerID.map(p => [...p]);
      this.NPowerIDNot = iReq.NPowerIDNot.map(p => [...p]);
    }
  }

  StoreTo(writer: BinaryWriter): void {
    writer.writeInt(this.ClassName.length - 1);
    for (const index of this.ClassName) {
      writer.writeString(index);
    }
    writer.writeInt(this.ClassNameNot.length - 1);
    for (const index of this.ClassNameNot) {
      writer.writeString(index);
    }
    writer.writeInt(this.PowerID.length - 1);
    for (const index of this.PowerID) {
      writer.writeString(index[0]);
      writer.writeString(index[1]);
    }
    writer.writeInt(this.PowerIDNot.length - 1);
    for (const index of this.PowerIDNot) {
      writer.writeString(index[0]);
      writer.writeString(index[1]);
    }
  }

  ClassOk(uidOrNidClass: string | number): boolean {
    // Handle string (UID) overload
    if (typeof uidOrNidClass === 'string') {
      const uidClass = uidOrNidClass;
      if (!uidClass) {
        return true;
      }

      let flag2 = true;
      if (this.ClassName.length > 0) {
        flag2 = this.ClassName.some(t => t.toLowerCase() === uidClass.toLowerCase());
      }

      if (this.ClassNameNot.length <= 0) {
        return flag2;
      }

      if (this.ClassNameNot.some(t => t.toLowerCase() === uidClass.toLowerCase())) {
        flag2 = false;
      }

      return flag2;
    }

    // Handle number (NID) overload
    const nidClass = uidOrNidClass;
    if (nidClass < 0) {
      return true;
    }

    let flag2 = true;
    if (this.NClassName.length > 0) {
      flag2 = this.NClassName.some(t => t === nidClass);
    }

    if (this.NClassNameNot.length <= 0) {
      return flag2;
    }

    if (this.NClassNameNot.some(t => t === nidClass)) {
      flag2 = false;
    }

    return flag2;
  }

  ReferencesPower(uidPower: string, uidFix: string = ''): boolean {
    let flag = false;
    for (const index1 of this.PowerID) {
      for (let index2 = 0; index2 < index1.length; index2++) {
        if (index1[index2].toLowerCase() === uidPower.toLowerCase()) {
          flag = true;
          index1[index2] = uidFix;
        }
      }
    }

    for (const index1 of this.PowerIDNot) {
      for (let index2 = 0; index2 < index1.length; index2++) {
        if (index1[index2].toLowerCase() === uidPower.toLowerCase()) {
          flag = true;
          index1[index2] = uidFix;
        }
      }
    }

    return flag;
  }
}

