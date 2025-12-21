// Converted from C# SupportSites.cs
export abstract class SupportSites {
  static SupportServer(): void {
    this.LaunchBrowser('https://discord.gg/mids-reborn-593336669004890113');
  }

  static KoFi(): void {
    this.LaunchBrowser('https://ko-fi.com/metalios');
  }

  static Patreon(): void {
    this.LaunchBrowser('https://www.patreon.com/midsreborn');
  }

  static GoToGitHub(): void {
    this.LaunchBrowser('https://github.com/LoadedCamel/MidsReborn');
  }

  private static LaunchBrowser(iUri: string): void {
    try {
      // In web context, use window.open
      if (typeof window !== 'undefined') {
        window.open(iUri, '_blank');
      }
      // In Node.js context, could use child_process or open package
    } catch (ex) {
      // Note: Error handling would be web-compatible
      console.error(`There was an error when starting the systems default web browser. ${ex}`);
    }
  }
}

