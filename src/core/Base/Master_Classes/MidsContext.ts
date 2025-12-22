// Converted from C# MidsContext.cs
import type { Archetype } from '../Data_Classes/Archetype';
import type { Character } from '../Data_Classes/Character';
import type { Build } from '../../Build';
import { ConfigData } from '../../ConfigData';
import { Version } from '../../Utils/Helpers';

export class MidsContext {
  static readonly AppName = 'Mids Reborn';
  private static readonly AppMajorVersion = 4;
  private static readonly AppMinorVersion = 0;
  private static readonly AppBuildVersion = 0;
  private static readonly AppRevisionVersion = 0;
  static readonly AssemblyVersion = '4.0.0';
  static readonly AssemblyFileVersion = '4.0.0.0';
  static AppFileVersion: Version = {
    major: 4,
    minor: 0,
    build: 0,
    revision: 0
  };
  static readonly AppVersionStatus = '';
  static readonly Title = "Mids' Reborn";
  static readonly MathLevelBase = 49;

  static EnhCheckMode: boolean = false;

  static Archetype: Archetype | null = null;
  static Character: Character | null = null;
  static Build: Build | null = null;

  static get Config(): ConfigData {
    // Note: Would need ConfigData.Current implementation
    return ConfigData.Current;
  }
}

