// Converted from C# DataClassifier.cs
export enum DataType {
    Mbd,
    Mxd,
    UnkBase64,
    Unknown
}

export interface ClassificationResult {
    Type: DataType;
    Content: string;
    IsValid: boolean;
}

export class DataClassifier {
    private static readonly MxdPattern: RegExp = /^\|MxDz;[0-9]+;[0-9]+;[0-9]+;HEX;\|/;
    private static readonly MbdPattern: RegExp = /^\|MBD;[0-9]+;[0-9]+;[0-9]+;BASE64;\|/;
    private static readonly UnkBase64Pattern: RegExp = /^[A-Za-z0-9+/]+={0,2}$/;

    static ClassifyAndExtractData(data: string): ClassificationResult {
        if (DataClassifier.MxdPattern.test(data)) {
            return DataClassifier.Create(DataType.Mxd, data);
        }

        if (DataClassifier.MbdPattern.test(data)) {
            return DataClassifier.Create(DataType.Mbd, data);
        }

        return DataClassifier.UnkBase64Pattern.test(data)
            ? DataClassifier.Create(DataType.UnkBase64, data)
            : DataClassifier.Create(DataType.Unknown, null);
    }

    private static Create(type: DataType, content: string | null): ClassificationResult {
        return type === DataType.Unknown
            ? { Type: type, Content: '', IsValid: false }
            : { Type: type, Content: content ?? '', IsValid: true };
    }
}

