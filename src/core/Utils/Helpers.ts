// Converted from C# Helpers.cs
// Note: This file contains Windows Forms specific functionality (Control, System.Drawing).
// These are not directly translatable to a browser-based TypeScript environment.
// The methods are converted to maintain structure but their implementation will be
// removed or replaced with web-compatible alternatives if needed.

import { MidsContext } from '../Base/Master_Classes/MidsContext';
import { DatabaseAPI } from '../DatabaseAPI';
import { Enums } from '../Enums';

export interface Version {
    major: number;
    minor: number;
    build: number;
    revision: number;
}

export class Helpers {
    // GetControlOfType is Windows Forms specific and removed
    // public static GetControlOfType<T>(root: Control.ControlCollection): T[] { ... }

    static IsVersionNewer(candidate: Version, current: Version): boolean {
        if (candidate.major > current.major) return true;
        if (candidate.major < current.major) return false;
        if (candidate.minor > current.minor) return true;
        if (candidate.minor < current.minor) return false;
        if (candidate.build > current.build) return true;
        if (candidate.build < current.build) return false;
        return candidate.revision > current.revision;
    }

    interface Stat {
        Type: string;
        Percentage: string;
        Hex?: string | null;
        ExtraData?: string | null;
    }

    private static readonly DebuffEffectTypes: Enums.eEffectType[] = [
        Enums.eEffectType.Defense,
        Enums.eEffectType.Endurance,
        Enums.eEffectType.Recovery,
        Enums.eEffectType.PerceptionRadius,
        Enums.eEffectType.ToHit,
        Enums.eEffectType.RechargeTime,
        Enums.eEffectType.SpeedRunning,
        Enums.eEffectType.Regeneration
    ];

    private static ValidDamageTypes(statType: number = 0): Map<string, number> {
        const allTypes = Object.values(Enums.eDamage).filter(v => typeof v === 'number') as Enums.eDamage[];
        const excludedTypes = statType === 1
            ? [
                Enums.eDamage.None,
                Enums.eDamage.Special,
                Enums.eDamage.Melee,
                Enums.eDamage.Ranged,
                Enums.eDamage.AoE,
                Enums.eDamage.Unique1,
                Enums.eDamage.Unique2,
                Enums.eDamage.Unique3
            ]
            : [
                Enums.eDamage.None,
                DatabaseAPI.RealmUsesToxicDef() ? Enums.eDamage.None : Enums.eDamage.Toxic,
                Enums.eDamage.Special,
                Enums.eDamage.Unique1,
                Enums.eDamage.Unique2,
                Enums.eDamage.Unique3
            ];

        const damageTypes = allTypes.filter(dt => !excludedTypes.includes(dt));
        const validDamageTypes = new Map<string, number>();
        for (const damageType of damageTypes) {
            validDamageTypes.set(Enums.eDamage[damageType], damageType);
        }
        return validDamageTypes;
    }

    static GeneratedStatData(infoGraphic: boolean = false): Map<string, Stat[]> {
        const stats = new Map<string, Stat[]>();
        const totalStat = MidsContext.Character?.Totals;
        const displayStat = MidsContext.Character?.DisplayStats;
        const defTypes = Helpers.ValidDamageTypes(0);
        const resTypes = Helpers.ValidDamageTypes(1);
        const debuffTypes = !infoGraphic
            ? ['Defense', 'Endurance', 'Recovery', 'Perception', 'ToHit', 'Recharge', 'Movement', 'Regeneration']
            : ['Defense', 'Endurance', 'Recovery', 'Perception', 'ToHit', 'Recharge', 'Movement', 'Regen'];

        const defStatList: Stat[] = [];
        for (const [key, value] of defTypes) {
            const multiplied = (totalStat?.Def[value] ?? 0) * 100;
            const percentage = `${multiplied.toFixed(2)}%`;
            defStatList.push({ Type: key, Percentage: percentage, Hex: '#a954d1' });
        }
        stats.set('Defense', defStatList);

        const resStatList: Stat[] = [];
        for (const [key, value] of resTypes) {
            const multiplied = (totalStat?.Res[value] ?? 0) * 100;
            const percentage = `${multiplied.toFixed(2)}%`;
            resStatList.push({ Type: key, Percentage: percentage, Hex: '#54b0d1' });
        }
        stats.set('Resistance', resStatList);

        let statList: Stat[];
        if (!infoGraphic) {
            statList = [
                {
                    Type: 'Max HP',
                    Percentage: `${(displayStat?.HealthHitpointsPercentage ?? 0).toFixed(2)}%`,
                    ExtraData: ` (${(displayStat?.HealthHitpointsNumeric(false) ?? 0).toFixed(2)} HP)`,
                    Hex: '#79d154'
                },
                {
                    Type: 'Regeneration',
                    Percentage: `${(displayStat?.HealthRegenPercent(false) ?? 0).toFixed(2)}%`,
                    ExtraData: ` (${(displayStat?.HealthRegenHPPerSec ?? 0).toFixed(2)}/s)`,
                    Hex: '#79d154'
                },
                {
                    Type: 'Max End',
                    Percentage: `${((totalStat?.EndMax ?? 0) + 100).toFixed(2)}%`,
                    Hex: '#549dd1'
                },
                {
                    Type: 'Recovery',
                    Percentage: `${(displayStat?.EnduranceRecoveryPercentage(false) ?? 0).toFixed(0)}%`,
                    ExtraData: ` (${(displayStat?.EnduranceRecoveryNumeric ?? 0).toFixed(2)}/s)`,
                    Hex: '#549dd1'
                },
                {
                    Type: 'End Usage',
                    Percentage: `${(displayStat?.EnduranceUsage ?? 0).toFixed(2)}/s`,
                    Hex: '#549dd1'
                }
            ];
        } else {
            statList = [
                {
                    Type: 'Max HP',
                    Percentage: `${(displayStat?.HealthHitpointsNumeric(false) ?? 0).toFixed(2)}`
                },
                {
                    Type: 'Regen',
                    Percentage: `${(displayStat?.HealthRegenPercent(false) ?? 0).toFixed(2)}%`
                },
                {
                    Type: '↑ HP/s',
                    Percentage: `${(displayStat?.HealthRegenHPPerSec ?? 0).toFixed(2)}/s`
                },
                {
                    Type: 'Max End',
                    Percentage: `${((totalStat?.EndMax ?? 0) + 100).toFixed(2)}%`
                },
                {
                    Type: 'Recovery',
                    Percentage: `${(displayStat?.EnduranceRecoveryPercentage(false) ?? 0).toFixed(0)}%`
                },
                {
                    Type: '↑ End/s',
                    Percentage: `${(displayStat?.EnduranceRecoveryNumeric ?? 0).toFixed(2)}/s`
                },
                {
                    Type: 'End Usage',
                    Percentage: `${(displayStat?.EnduranceUsage ?? 0).toFixed(2)}/s`
                }
            ];
        }

        stats.set('Sustain', statList);

        if (!infoGraphic) {
            statList = [
                {
                    Type: 'Haste',
                    Percentage: `${((totalStat?.BuffHaste ?? 0) * 100).toFixed(2)}%`,
                    Hex: '#d18254'
                },
                {
                    Type: 'Damage',
                    Percentage: `${((totalStat?.BuffDam ?? 0) * 100).toFixed(2)}%`,
                    Hex: '#d16054'
                },
                {
                    Type: 'To Hit',
                    Percentage: `${((totalStat?.BuffToHit ?? 0) * 100).toFixed(2)}%`,
                    Hex: '#d1be54'
                },
                {
                    Type: 'Accuracy',
                    Percentage: `${((totalStat?.BuffAcc ?? 0) * 100).toFixed(2)}%`,
                    Hex: '#d1be54'
                },
                {
                    Type: 'End Reduction',
                    Percentage: `${((totalStat?.BuffEndRdx ?? 0) * 100).toFixed(2)}%`,
                    Hex: '#549dd1'
                }
            ];
        } else {
            statList = [
                {
                    Type: 'Haste',
                    Percentage: `${((totalStat?.BuffHaste ?? 0) * 100).toFixed(2)}%`
                },
                {
                    Type: 'Damage',
                    Percentage: `${((totalStat?.BuffDam ?? 0) * 100).toFixed(2)}%`
                },
                {
                    Type: 'To Hit',
                    Percentage: `${((totalStat?.BuffToHit ?? 0) * 100).toFixed(2)}%`
                },
                {
                    Type: 'Accuracy',
                    Percentage: `${((totalStat?.BuffAcc ?? 0) * 100).toFixed(2)}%`
                },
                {
                    Type: 'End Redux',
                    Percentage: `${((totalStat?.BuffEndRdx ?? 0) * 100).toFixed(2)}%`
                }
            ];
        }

        stats.set('Offense', statList);

        const debuffStatList: Stat[] = [];
        for (let index = 0; index < Helpers.DebuffEffectTypes.length; index++) {
            const effectType = Helpers.DebuffEffectTypes[index];
            const notMultiplied = totalStat?.DebuffRes[effectType] ?? 0;
            const percentage = `${notMultiplied.toFixed(2)}%`;
            debuffStatList.push({
                Type: debuffTypes[index],
                Percentage: percentage,
                Hex: '#8e54d1'
            });
        }
        stats.set(!infoGraphic ? 'Debuff Resistance' : 'Debuff Resist', debuffStatList);

        return stats;
    }

    /// <summary>
    /// Gets the project path
    /// Note: When calling do not pass anything to method
    /// </summary>
    static GetPathInDebug(callPath?: string): string {
        // FileInfo and Path are C# specific
        // In a web environment, this would need to be adapted
        const path = callPath ?? '';
        if (!path) return '';
        const lastSlash = path.lastIndexOf('/');
        const lastBackslash = path.lastIndexOf('\\');
        const lastSeparator = Math.max(lastSlash, lastBackslash);
        if (lastSeparator < 0) return '';
        return path.substring(0, lastSeparator + 1);
    }
}

