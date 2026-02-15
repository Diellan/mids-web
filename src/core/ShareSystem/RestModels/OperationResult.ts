// Converted from C# OperationResult.cs
export class OperationResult {
    IsSuccessful: boolean = false;
    Message: string | null = null;
}

export class OperationResultT<T> extends OperationResult {
    Data?: T;
}

