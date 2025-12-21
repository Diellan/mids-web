// Converted from C# FormatCode.cs
import { ExportFormatType } from './StructAndEnums';

export class FormatCode {
    Name: string;
    Type: ExportFormatType;

    constructor(name: string = 'Plain Text', type: ExportFormatType = ExportFormatType.None) {
        this.Name = name;
        this.Type = type;
    }
}

