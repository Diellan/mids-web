// Converted from C# IEffect.cs
// Note: IComparable and ICloneable are C# specific. In TypeScript, we can implement comparison/cloning methods directly.
// Note: BinaryWriter is C# specific. A TypeScript replacement is needed (see Utils/BinaryWriter.ts).

import { IEnhancement } from './IEnhancement';
import { IPower } from './IPower';
import { Expressions } from './Expressions';
import * as Enums from './Enums';
import { BinaryWriter } from 'csharp-binary-stream';

// Placeholder types - these may need to be defined elsewhere
export interface KeyValue<TKey, TValue> {
    Key: TKey;
    Value: TValue;
    Validated?: boolean; // Added for conditional validation
}

export class EffectIdentifier {
    public Mag: number = 0;
    public EffectType: Enums.eEffectType = Enums.eEffectType.None;
    public ETModifies: Enums.eEffectType = Enums.eEffectType.None;
    public ToWho: Enums.eToWho = Enums.eToWho.All;
    public PvMode: Enums.ePvX = Enums.ePvX.Any;
    public Suppression: Enums.eSuppress = Enums.eSuppress.None;
    public Conditionals: KeyValue<string, string>[] = [];
    public IgnoreScaling: boolean = false;
    public IgnoreED: boolean = false;
    public Buffable: boolean = false;
    public Probability: number = 0;
    public Duration: number = 0;
    public Ticks: number = 0;
    public SpecialCase: Enums.eSpecialCase = Enums.eSpecialCase.None;
    public Stacking: Enums.eStacking = Enums.eStacking.No;
    public RequiresToHitCheck: boolean = false;
    public CancelOnMiss: boolean = false;
    public Resistible: boolean = false;
    public DelayedTime: number = 0;
    public PPM: number = 0;

    /// <summary>
    /// Compare an EffectIdentifier instance against another.
    /// </summary>
    /// <remarks>Only atomic fields are taken in account here, comparing conditionals yields to aberrant results</remarks>
    /// <param name="target">The other EffectIdentifier instance to compare with.</param>
    /// <returns>true if all atomic fields are equals, false otherwise. For floats, they're considered equals when distance is below float.Epsilon .</returns>
    public Compare(target: EffectIdentifier): boolean
    {
        return Math.abs(Math.round(this.Mag * 1000) - Math.round(target.Mag * 1000)) < Number.EPSILON &&
            this.EffectType === target.EffectType &&
            this.ETModifies === target.ETModifies &&
            this.ToWho === target.ToWho &&
            this.PvMode === target.PvMode &&
            this.Suppression === target.Suppression &&
            this.IgnoreScaling === target.IgnoreScaling &&
            this.IgnoreED === target.IgnoreED &&
            this.Buffable === target.Buffable &&
            Math.abs(this.Probability - target.Probability) < Number.EPSILON &&
            Math.abs(this.Duration - target.Duration) < Number.EPSILON &&
            this.Ticks === target.Ticks &&
            this.SpecialCase === target.SpecialCase &&
            this.Stacking === target.Stacking &&
            this.RequiresToHitCheck === target.RequiresToHitCheck &&
            this.CancelOnMiss === target.CancelOnMiss &&
            this.Resistible === target.Resistible &&
            Math.abs(this.DelayedTime - target.DelayedTime) < Number.EPSILON &&
            Math.abs(this.PPM - target.PPM) < Number.EPSILON;
        //Conditionals.Equals(target.Conditionals);
    }
}

export interface Damage {
    Type: Enums.eDamage;
    Value: number;
}

export interface IEffect {
    Rand: number;
    UniqueID: number;
    Probability: number;
    Mag: number;
    BuffedMag: number;
    MagPercent: number;
    Duration: number;
    DisplayPercentage: boolean;
    VariableModified: boolean;
    InherentSpecial: boolean;
    InherentSpecial2: boolean;
    BaseProbability: number;
    IgnoreED: boolean;
    Reward: string;
    EffectId: string;
    Special: string;
    Enhancement: IEnhancement | null;
    nID: number;
    EffectClass: Enums.eEffectClass;
    EffectType: Enums.eEffectType;
    PowerAttribs: Enums.ePowerAttribs;
    DisplayPercentageOverride: Enums.eOverrideBoolean;
    DamageType: Enums.eDamage;
    MezType: Enums.eMez;
    ETModifies: Enums.eEffectType;
    Summon: string;
    nSummon: number;
    Ticks: number;
    DelayedTime: number;
    Stacking: Enums.eStacking;
    Suppression: Enums.eSuppress;
    Buffable: boolean;
    Resistible: boolean;
    SpecialCase: Enums.eSpecialCase;
    UIDClassName: string;
    nIDClassName: number;
    VariableModifiedOverride: boolean;
    IgnoreScaling: boolean;
    isEnhancementEffect: boolean;
    PvMode: Enums.ePvX;
    ToWho: Enums.eToWho;
    Scale: number;
    nMagnitude: number;
    nDuration: number;
    AttribType: Enums.eAttribType;
    Aspect: Enums.eAspect;
    ModifierTable: string;
    nModifierTable: number;
    PowerFullName: string;
    NearGround: boolean;
    RequiresToHitCheck: boolean;
    Math_Mag: number;
    Math_Duration: number;
    Absorbed_Effect: boolean;
    Absorbed_PowerType: Enums.ePowerType;
    Absorbed_Power_nID: number;
    Absorbed_Duration: number;
    Absorbed_Class_nID: number;
    Absorbed_Interval: number;
    Absorbed_EffectID: number;
    buffMode: Enums.eBuffMode;
    Override: string;
    nOverride: number;
    Expressions: Expressions;
    MagnitudeExpression: string;
    CancelOnMiss: boolean;
    ProcsPerMinute: number;
    AtrOrigAccuracy: number;
    AtrOrigActivatePeriod: number;
    AtrOrigArc: number;
    AtrOrigCastTime: number;
    AtrOrigEffectArea: Enums.eEffectArea;
    AtrOrigEnduranceCost: number;
    AtrOrigInterruptTime: number;
    AtrOrigMaxTargets: number;
    AtrOrigRadius: number;
    AtrOrigRange: number;
    AtrOrigRechargeTime: number;
    AtrOrigSecondaryRange: number;
    AtrModAccuracy: number;
    AtrModActivatePeriod: number;
    AtrModArc: number;
    AtrModCastTime: number;
    AtrModEffectArea: Enums.eEffectArea;
    AtrModEnduranceCost: number;
    AtrModInterruptTime: number;
    AtrModMaxTargets: number;
    AtrModRadius: number;
    AtrModRange: number;
    AtrModRechargeTime: number;
    AtrModSecondaryRange: number;
    ActiveConditionals: KeyValue<string, string>[] | null;
    Validated: boolean;
    EffectiveProbability: number;

    GetPower(): IPower | null;
    SetPower(power: IPower | null): void;
    isDamage(): boolean;
    UpdateAttrib(): void;
    ValidateConditional(): boolean;
    ValidateConditional(cType: string, powerName: string): boolean;
    ValidateConditional(index: number): boolean;
    BuildEffectStringShort(NoMag?: boolean, simple?: boolean, useBaseProbability?: boolean): string;
    BuildEffectString(Simple?: boolean, SpecialCat?: string, noMag?: boolean, Grouped?: boolean, useBaseProbability?: boolean, fromPopup?: boolean, editorDisplay?: boolean, dvDisplay?: boolean, ignoreConditions?: boolean): string;
    StoreTo(writer: BinaryWriter): void;
    SetTicks(iDuration: number, iInterval: number): number;
    CanInclude(): boolean;
    CanGrantPower(): boolean;
    PvXInclude(): boolean;
    SummonedEntityName: string;
    GenerateIdentifier(): EffectIdentifier;
    AffectsPetsOnly(): boolean;
    GetDamage(): Damage;
    Clone(): IEffect;
    CompareTo(obj: any): number;
}

