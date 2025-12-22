// Converted from C# MetaData.cs
export interface Version {
    major: number;
    minor: number;
    build: number;
    revision: number;
}

export interface MetaData {
    App: string;
    Version: Version;
    Database: string;
    DatabaseVersion: Version;
}
