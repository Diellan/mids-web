// Converted from C# Serializer.cs
import type { ISerialize } from './ConfigData';
import type { IDatabase } from './IDatabase';
import type { IEnhancement } from './IEnhancement';
import type { IPowerset } from './IPowerset';
import type { IPower } from '../type/power';
import type { IEffect } from '../type/effect';

export class Serializer implements ISerialize {
  private readonly _serializeFunc: (o: any) => string;

  readonly Extension: string;

  constructor(serializeFunc: (o: any) => string, extension: string) {
    this.Extension = extension;
    this._serializeFunc = serializeFunc;
  }

  Serialize(o: any): string {
    return this._serializeFunc(o);
  }

  Deserialize<T>(x: string): T {
    // Note: Would use JSON.parse with proper type handling
    return JSON.parse(x) as T;
  }

  static GetSerializer(): ISerialize {
    return new Serializer(
      x => {
        // Note: Would use JSON.stringify with proper settings
        return JSON.stringify(x, null, 2);
      },
      'json'
    );
  }

  static readonly SerializerSettings = {
    // Note: JSON serializer settings would be configured here
    // In TypeScript, this would be options for JSON.stringify/parse
    nullValueHandling: 'ignore' as const,
    preserveReferencesHandling: false,
    referenceLoopHandling: 'ignore' as const,
    typeNameHandling: 'auto' as const,
    formatting: 'indented' as const
  };
}

