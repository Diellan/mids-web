// Converted from C# MetaData.cs
export interface Version {
    major: number;
    minor: number;
    build: number;
    revision: number;
}

export class MetaData {
    App: string = '';
    Version: Version = { major: 0, minor: 0, build: 0, revision: 0 };
    Database: string = '';
    DatabaseVersion: Version = { major: 0, minor: 0, build: 0, revision: 0 };

    constructor(app: string, version: Version, database: string, databaseVersion: Version) {
        this.App = app;
        this.Version = version;
        this.Database = database;
        this.DatabaseVersion = databaseVersion;
    }
}

