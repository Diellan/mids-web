// Converted from C# BuildPreferences.cs
// Note: File I/O operations are C# specific and will need to be replaced with
// browser-compatible storage (e.g., localStorage, IndexedDB, or server-side API calls).

export class BuildPreferences {
    WarningsIgnoredFor: Set<string> = new Set();

    private static readonly PreferencesFilePath: string = 'BuildPreferences.json';

    static async Load(): Promise<BuildPreferences> {
        try {
            const stored = await fetch(BuildPreferences.PreferencesFilePath);
            if (stored.ok) {
                const parsed = JSON.parse(await stored.text());
                const prefs = new BuildPreferences();
                prefs.WarningsIgnoredFor = new Set(parsed.WarningsIgnoredFor || []);
                return prefs;
            }
        } catch (ex) {
            console.warn('Failed to load build preferences:', ex);
        }
        return new BuildPreferences();
    }

    private async Save(): Promise<void> {
        try {
            const data = {
                WarningsIgnoredFor: Array.from(this.WarningsIgnoredFor)
            };
            await fetch(BuildPreferences.PreferencesFilePath, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (ex) {
            console.error('Failed to save build preferences:', ex);
        }
    }

    ShouldSkipWarning(buildFile: string): boolean {
        return this.WarningsIgnoredFor.has(buildFile);
    }

    AddIgnoredBuild(buildPath: string): void {
        if (this.WarningsIgnoredFor.has(buildPath)) return;
        this.WarningsIgnoredFor.add(buildPath);
        this.Save();
    }
}

