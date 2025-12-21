// Converted from C# NavStripItem.cs
// Note: System.Drawing.Rectangle and UI.Controls.Page are Windows Forms specific.
// These are replaced with generic types or placeholders for web compatibility.

export interface Rectangle {
    X: number;
    Y: number;
    Width: number;
    Height: number;
}

export interface Page {
    Title?: string | null;
    Enabled: boolean;
}

export enum NavItemState {
    Inactive,
    Active,
    Disabled
}

export class NavStripItem {
    Page: Page | null = null;
    Bounds: Rectangle = { X: 0, Y: 0, Width: 0, Height: 0 };
    IsHighlighted: boolean = false;

    get Text(): string | null {
        return this.Page?.Title ?? null;
    }

    private _state: NavItemState = NavItemState.Inactive;

    get State(): NavItemState {
        return this._state;
    }

    set State(value: NavItemState) {
        this._state = this.Page?.Enabled === false ? NavItemState.Disabled : value;
    }

    constructor(page?: Page, state?: NavItemState) {
        if (page === undefined) {
            this.Page = null;
            this.State = NavItemState.Inactive;
        } else if (state === undefined) {
            this.Page = page;
            this.State = page.Enabled ? NavItemState.Inactive : NavItemState.Disabled;
        } else {
            this.Page = page;
            this.State = page.Enabled ? state : NavItemState.Disabled;
        }
    }
}

