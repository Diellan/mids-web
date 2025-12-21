// Converted from C# BuildPreferences.cs
// Note: File I/O operations are C# specific and will need to be replaced with
// browser-compatible storage (e.g., localStorage, IndexedDB, or server-side API calls).

export class BuildPreferences {
    WarningsIgnoredFor: Set<string> = new Set();

    private static readonly PreferencesFilePath: string = 'BuildPreferences.json';

    static Load(): BuildPreferences {
        // File.Exists and File.ReadAllText are C# specific
        // In a web environment, this would use localStorage or a server API
        try {
            const stored = localStorage.getItem(BuildPreferences.PreferencesFilePath);
            if (stored) {
                const parsed = JSON.parse(stored);
                const prefs = new BuildPreferences();
                prefs.WarningsIgnoredFor = new Set(parsed.WarningsIgnoredFor || []);
                return prefs;
            }
        } catch (ex) {
            console.warn('Failed to load build preferences:', ex);
        }
        return new BuildPreferences();
    }

    private Save(): void {
        // File.WriteAllText is C# specific
        // In a web environment, this would use localStorage or a server API
        try {
            const data = {
                WarningsIgnoredFor: Array.from(this.WarningsIgnoredFor)
            };
            localStorage.setItem(BuildPreferences.PreferencesFilePath, JSON.stringify(data));
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

