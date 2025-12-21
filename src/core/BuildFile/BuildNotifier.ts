// Converted from C# BuildNotifier.cs
// Note: MessageBoxEx and DialogResult are Windows Forms specific.
// They are replaced with console logs or placeholders for web environment.

export enum DialogResult {
    None = 0,
    OK = 1,
    Cancel = 2,
    Abort = 3,
    Retry = 4,
    Ignore = 5,
    Yes = 6,
    No = 7
}

export interface IBuildNotifier {
    ShowError(message: string): void;
    ShowWarning(message: string): void;
    ShowWarningDialog(message: string, title: string, showIgnore?: boolean): DialogResult;
}

export class BuildNotifier implements IBuildNotifier {
    ShowError(message: string): void {
        // MessageBoxEx.Show is Windows Forms specific
        console.error(`Error: ${message}`);
        // In a web environment, this could be replaced with a toast notification or modal dialog
    }

    ShowWarning(message: string): void {
        // MessageBoxEx.Show is Windows Forms specific
        console.warn(`Warning: ${message}`);
        // In a web environment, this could be replaced with a toast notification or modal dialog
    }

    ShowWarningDialog(message: string, title: string, showIgnore: boolean = false): DialogResult {
        // MessageBoxEx.ShowDialog is Windows Forms specific
        console.warn(`${title}: ${message}`);
        // In a web environment, this would need to be replaced with a modal dialog
        // For now, return OK as default
        return DialogResult.OK;
    }
}

