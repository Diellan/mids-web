// Converted from C# ProgressEventArgs.cs
// Note: EventArgs is C# specific. In TypeScript, we can use a simple class or interface.

export class ProgressEventArgs {
    Text: string | null;
    Processed: number;
    Total: number;

    constructor(text: string | null, processed: number, total: number);
    constructor(processed: number, total: number);
    constructor(textOrProcessed: string | null | number, processedOrTotal?: number, total?: number) {
        if (typeof textOrProcessed === 'string' || textOrProcessed === null) {
            this.Text = textOrProcessed;
            this.Processed = processedOrTotal ?? 0;
            this.Total = total ?? 0;
        } else {
            this.Text = null;
            this.Processed = textOrProcessed;
            this.Total = processedOrTotal ?? 0;
        }
    }

    get PercentComplete(): number {
        let result: number;
        if (this.Processed <= 0) {
            result = 0;
        } else {
            result = (this.Processed * 100) / this.Total;
            if (result > 100) result = 100;
        }
        return Math.floor(result);
    }
}

