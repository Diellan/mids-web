// Converted from C# Origin.cs
export enum OriginGrade {
  None = -1,
  TrainingO = 0,
  DualO = 1,
  SingleO = 2,
  HO = 3,
  IO = 4,
  SetO = 5,
  Attuned = 6
}

export class Origin {
  readonly Name: string;
  readonly Grades: string[];

  constructor(name: string, dualO: string, singleO: string) {
    this.Name = name;
    this.Grades = new Array(7);
    this.Grades[0] = 'Training';
    this.Grades[1] = dualO;
    this.Grades[2] = singleO;
    this.Grades[3] = 'HO';
    this.Grades[4] = 'IO';
    this.Grades[5] = 'IO';
    this.Grades[6] = 'IO';
  }
}

