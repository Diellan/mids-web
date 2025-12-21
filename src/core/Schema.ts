// Converted from C# Schema.cs
export class RawSaveResult {
  readonly Hash: number;
  readonly Length: number;

  constructor(length: number, hash: number) {
    this.Length = length;
    this.Hash = hash;
  }
}

export class HistoryMap {
  HID: number = -1;
  Level: number = -1;
  SID: number = -1;
  Text: string = '';
}

