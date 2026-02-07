// Converted from C# Interval.cs
export class Interval {
    Start: number;
    End: number;

    get Length(): number {
        return Math.abs(this.End - this.Start);
    }

    get Center(): number {
        return this.Start + this.Length / 2;
    }

    /// <summary>
    /// Build an interval from start/end values (e.g. length segment)
    /// </summary>
    /// <param name="start">Start value</param>
    /// <param name="end">End value</param>
    constructor(start: number | Interval, end?: number) {
        if (start instanceof Interval) {
            // Build an interval from another one, copy values
            const baseInterval = start as Interval;
            this.Start = Math.min(baseInterval.Start, baseInterval.End);
            this.End = Math.max(baseInterval.Start, baseInterval.End);
        } else if (end === undefined) {
            // Build an interval from end value only (e.g. duration), assume start = 0
            this.Start = 0;
            this.End = start;
        } else {
            this.Start = Math.min(start, end);
            this.End = Math.max(start, end);
        }
    }

    /// <summary>
    /// Scale interval by a factor. Will multiply Start and End by a factor.
    /// </summary>
    /// <param name="factor">Scale factor</param>
    /// <returns>Rescaled interval</returns>
    Scale(factor: number): Interval {
        return new Interval(this.Start * factor, this.End * factor);
    }

    /// <summary>
    /// Scale interval by a factor, keeping the center of the segment identical.
    /// </summary>
    /// <param name="factor">Scale factor</param>
    /// <param name="minLength">Minimum length to keep</param>
    /// <returns>Rescaled interval</returns>
    ScaleCenter(factor: number, minLength: number = 5): Interval {
        const dist2 = Math.abs(this.Center - this.Start);

        return new Interval(
            this.Center - Math.max(minLength / 2, dist2 * factor),
            this.Center + Math.max(minLength / 2, dist2 * factor)
        );
    }

    /// <summary>
    /// Scale interval by a factor, align center on a different value.
    /// </summary>
    /// <param name="factor">Scale factor</param>
    /// <param name="centerRef">Value to align center to</param>
    /// <returns>Rescaled interval</returns>
    ScaleCenterAt(factor: number, centerRef: number): Interval {
        const dist2 = Math.abs(this.Center - this.Start);
        const offset = centerRef - this.Center;

        return new Interval(
            this.Center - dist2 * factor + offset,
            this.Center + dist2 * factor + offset
        );
    }

    /// <summary>
    /// Apply an offset on the interval. Will add a value to Start and End.
    /// </summary>
    /// <param name="offset">Offset value to apply</param>
    /// <returns>Moved interval</returns>
    Offset(offset: number): Interval {
        return new Interval(this.Start + offset, this.End + offset);
    }

    /// <summary>
    /// Apply an offset on the lower bound of the interval, keep a minimum size to avoid over-shrinking.
    /// </summary>
    /// <param name="offset">Offset value to apply</param>
    /// <param name="minSize">Minimum interval size</param>
    /// <param name="allowBoundsSwap">Allow bounds to be swapped (move beyond each other)</param>
    /// <returns>Moved interval</returns>
    OffsetStart(offset: number, minSize: number = 5, allowBoundsSwap: boolean = true): Interval {
        if (!allowBoundsSwap) {
            return new Interval(Math.min(this.Start + offset, this.End - minSize), this.End);
        }

        const start = this.Start + offset <= this.End
            ? Math.min(this.Start + offset, this.End - minSize)
            : Math.max(this.Start + offset, this.End + minSize);

        return new Interval(start, this.End);
    }

    /// <summary>
    /// Apply an offset on the upper bound of the interval, keep a minimum size to avoid over-shrinking.
    /// </summary>
    /// <param name="offset">Offset value to apply</param>
    /// <param name="minSize">Minimum interval size</param>
    /// <param name="allowBoundsSwap">Allow bounds to be swapped (move beyond each other)</param>
    /// <returns>Moved interval</returns>
    OffsetEnd(offset: number, minSize: number = 5, allowBoundsSwap: boolean = true): Interval {
        if (!allowBoundsSwap) {
            return new Interval(this.Start, Math.max(this.Start + minSize, this.End + offset));
        }

        const end = this.End + offset >= this.Start
            ? Math.max(this.Start + minSize, this.End + offset)
            : Math.min(this.Start - minSize, this.End + offset);

        return new Interval(this.Start, end);
    }

    /// <summary>
    /// Check if a value is inside the interval
    /// </summary>
    /// <param name="value">Value to check</param>
    /// <param name="includeBounds">True include bounds, false exclude them</param>
    /// <returns>True if value is inside the interval</returns>
    Contains(value: number, includeBounds: boolean = true): boolean {
        return includeBounds
            ? value >= this.Start && value <= this.End
            : value > this.Start && value < this.End;
    }

    /// <summary>
    /// Cap an interval inside another one. If changeSize is set to true, bounds are just set to container's Start and End, changing length
    /// </summary>
    /// <param name="container">Container interval</param>
    /// <param name="changeSize">Allow interval size to be changed if cap is hit</param>
    /// <returns>Capped interval</returns>
    MinMax(container: Interval, changeSize: boolean = false): Interval {
        if (changeSize) {
            return new Interval(Math.max(container.Start, this.Start), Math.min(container.End, this.End));
        }

        if (this.Start < container.Start) {
            return new Interval(container.Start, container.Start + this.Length);
        }

        return this.End > container.End
            ? new Interval(container.End - this.Length, container.End)
            : new Interval(this.Start, this.End);
    }

    toString(): string {
        return `<Interval> {${this.Start}, ${this.End} (Len=${this.Length})}`;
    }
}

