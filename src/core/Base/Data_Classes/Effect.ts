// Converted from C# Effect.cs
// This is a large file (2,966 lines in C#). Converting systematically.

import { IEffect, KeyValue, EffectIdentifier, Damage } from '../../IEffect';
import { IPower } from '../../IPower';
import { IEnhancement } from '../../IEnhancement';
import { Expressions, ExpressionType, ErrorData } from '../../Expressions';
import * as Enums from '../../Enums';
import { DatabaseAPI } from '../../DatabaseAPI';
import { MidsContext } from '../Master_Classes/MidsContext';
import { Utilities } from '../Master_Classes/Utilities';
import { Statistics } from '../../Statistics';
import { BooleanExprPreprocessor } from '../../BooleanExprPreprocessor';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { ServerData } from '../../ServerData';

// Parse is now implemented as Expressions.Parse static method

export class Effect implements IEffect {
    private power: IPower | null = null;

    get Rand(): number {
        return Math.random();
    }

    Validated: boolean = false;
    BaseProbability: number = 1.0;
    Expressions: Expressions = new Expressions();
    Reward: string = '';
    EffectClass: Enums.eEffectClass = Enums.eEffectClass.Primary;
    EffectType: Enums.eEffectType = Enums.eEffectType.None;
    DisplayPercentageOverride: Enums.eOverrideBoolean = Enums.eOverrideBoolean.NoOverride;
    DamageType: Enums.eDamage = Enums.eDamage.None;
    MezType: Enums.eMez = Enums.eMez.None;
    ETModifies: Enums.eEffectType = Enums.eEffectType.None;
    PowerAttribs: Enums.ePowerAttribs = Enums.ePowerAttribs.None;
    Summon: string = '';
    Stacking: Enums.eStacking = Enums.eStacking.No;
    Suppression: Enums.eSuppress = Enums.eSuppress.None;
    Buffable: boolean = true;
    Resistible: boolean = true;
    SpecialCase: Enums.eSpecialCase = Enums.eSpecialCase.None;
    UIDClassName: string = '';
    nIDClassName: number = -1;
    PvMode: Enums.ePvX = Enums.ePvX.Any;
    ToWho: Enums.eToWho = Enums.eToWho.Unspecified;
    AttribType: Enums.eAttribType = Enums.eAttribType.Magnitude;
    Aspect: Enums.eAspect = Enums.eAspect.Str;
    ModifierTable: string = 'Melee_Ones';
    nModifierTable: number = -1;
    PowerFullName: string = '';
    Absorbed_PowerType: Enums.ePowerType = Enums.ePowerType.Auto_;
    Absorbed_Power_nID: number = -1;
    Absorbed_Class_nID: number = -1;
    Absorbed_EffectID: number = -1;
    Override: string = '';
    buffMode: Enums.eBuffMode = Enums.eBuffMode.Normal;
    Special: string = '';
    EffectId: string = 'Ones';
    AtrOrigAccuracy: number = -1;
    AtrOrigActivatePeriod: number = -1;
    AtrOrigArc: number = -1;
    AtrOrigCastTime: number = -1;
    AtrOrigEffectArea: Enums.eEffectArea = Enums.eEffectArea.None;
    AtrOrigEnduranceCost: number = -1;
    AtrOrigInterruptTime: number = -1;
    AtrOrigMaxTargets: number = -1;
    AtrOrigRadius: number = -1;
    AtrOrigRange: number = -1;
    AtrOrigRechargeTime: number = -1;
    AtrOrigSecondaryRange: number = -1;
    ActiveConditionals: KeyValue<string, string>[] = [];
    AtrModAccuracy: number = -1;
    AtrModActivatePeriod: number = -1;
    AtrModArc: number = -1;
    AtrModCastTime: number = -1;
    AtrModEffectArea: Enums.eEffectArea = Enums.eEffectArea.None;
    AtrModEnduranceCost: number = -1;
    AtrModInterruptTime: number = -1;
    AtrModMaxTargets: number = -1;
    AtrModRadius: number = -1;
    AtrModRange: number = -1;
    AtrModRechargeTime: number = -1;
    AtrModSecondaryRange: number = -1;

    // Additional properties
    UniqueID: number = 0;
    Enhancement: IEnhancement | null = null;
    nID: number = 0;
    VariableModifiedOverride: boolean = false;
    IgnoreScaling: boolean = false;
    isEnhancementEffect: boolean = false;
    Scale: number = 0;
    nMagnitude: number = 0;
    nDuration: number = 0;
    NearGround: boolean = false;
    RequiresToHitCheck: boolean = false;
    Math_Mag: number = 0;
    Math_Duration: number = 0;
    Absorbed_Effect: boolean = false;
    Absorbed_Duration: number = 0;
    Absorbed_Interval: number = 0;
    MagnitudeExpression: string = '';
    ProcsPerMinute: number = 0;
    CancelOnMiss: boolean = false;

    private SummonId: number | null = null;
    private OverrideId: number | null = null;
    private _summonedEntName: string = '';

    constructor(powerOrReader?: IPower | BinaryReader) {
        this.Validated = false;
        this.BaseProbability = 1.0;
        this.Expressions = new Expressions();
        this.Reward = '';
        this.EffectClass = Enums.eEffectClass.Primary;
        this.EffectType = Enums.eEffectType.None;
        this.DisplayPercentageOverride = Enums.eOverrideBoolean.NoOverride;
        this.DamageType = Enums.eDamage.None;
        this.MezType = Enums.eMez.None;
        this.ETModifies = Enums.eEffectType.None;
        this.PowerAttribs = Enums.ePowerAttribs.None;
        this.Summon = '';
        this.Stacking = Enums.eStacking.No;
        this.Suppression = Enums.eSuppress.None;
        this.Buffable = true;
        this.Resistible = true;
        this.SpecialCase = Enums.eSpecialCase.None;
        this.UIDClassName = '';
        this.nIDClassName = -1;
        this.PvMode = Enums.ePvX.Any;
        this.ToWho = Enums.eToWho.Unspecified;
        this.AttribType = Enums.eAttribType.Magnitude;
        this.Aspect = Enums.eAspect.Str;
        this.ModifierTable = 'Melee_Ones';
        this.nModifierTable = DatabaseAPI.NidFromUidAttribMod(this.ModifierTable);
        this.PowerFullName = '';
        this.Absorbed_PowerType = Enums.ePowerType.Auto_;
        this.Absorbed_Power_nID = -1;
        this.Absorbed_Class_nID = -1;
        this.Absorbed_EffectID = -1;
        this.Override = '';
        this.buffMode = Enums.eBuffMode.Normal;
        this.Special = '';
        this.EffectId = 'Ones';
        this.PowerAttribs = Enums.ePowerAttribs.None;
        this.AtrOrigAccuracy = -1;
        this.AtrOrigActivatePeriod = -1;
        this.AtrOrigArc = -1;
        this.AtrOrigCastTime = -1;
        this.AtrOrigEffectArea = Enums.eEffectArea.None;
        this.AtrOrigEnduranceCost = -1;
        this.AtrOrigInterruptTime = -1;
        this.AtrOrigMaxTargets = -1;
        this.AtrOrigRadius = -1;
        this.AtrOrigRange = -1;
        this.AtrOrigRechargeTime = -1;
        this.AtrOrigSecondaryRange = -1;
        this.ActiveConditionals = [];
        this.AtrModAccuracy = -1;
        this.AtrModActivatePeriod = -1;
        this.AtrModArc = -1;
        this.AtrModCastTime = -1;
        this.AtrModEffectArea = Enums.eEffectArea.None;
        this.AtrModEnduranceCost = -1;
        this.AtrModInterruptTime = -1;
        this.AtrModMaxTargets = -1;
        this.AtrModRadius = -1;
        this.AtrModRange = -1;
        this.AtrModRechargeTime = -1;
        this.AtrModSecondaryRange = -1;

        if (powerOrReader instanceof BinaryReader) {
            // Constructor from BinaryReader
            const reader = powerOrReader;
            this.PowerFullName = reader.readString();
            this.UniqueID = reader.readInt();
            this.EffectClass = reader.readInt() as Enums.eEffectClass;
            this.EffectType = reader.readInt() as Enums.eEffectType;
            this.DamageType = reader.readInt() as Enums.eDamage;
            this.MezType = reader.readInt() as Enums.eMez;
            this.ETModifies = reader.readInt() as Enums.eEffectType;
            this.Summon = reader.readString();
            this.DelayedTime = reader.readFloat();
            this.Ticks = reader.readInt();
            this.Stacking = reader.readInt() as Enums.eStacking;
            this.BaseProbability = reader.readFloat();
            this.Suppression = reader.readInt() as Enums.eSuppress;
            this.Buffable = reader.readBoolean();
            this.Resistible = reader.readBoolean();
            this.SpecialCase = reader.readInt() as Enums.eSpecialCase;
            this.VariableModifiedOverride = reader.readBoolean();
            this.IgnoreScaling = reader.readBoolean();
            this.PvMode = reader.readInt() as Enums.ePvX;
            this.ToWho = reader.readInt() as Enums.eToWho;
            this.DisplayPercentageOverride = reader.readInt() as Enums.eOverrideBoolean;
            this.Scale = reader.readFloat();
            this.nMagnitude = reader.readFloat();
            this.nDuration = reader.readFloat();
            this.AttribType = reader.readInt() as Enums.eAttribType;
            this.Aspect = reader.readInt() as Enums.eAspect;
            this.ModifierTable = reader.readString();
            this.nModifierTable = DatabaseAPI.NidFromUidAttribMod(this.ModifierTable);
            this.NearGround = reader.readBoolean();
            this.CancelOnMiss = reader.readBoolean();
            this.RequiresToHitCheck = reader.readBoolean();
            this.UIDClassName = reader.readString();
            this.nIDClassName = reader.readInt();

            // Read Expressions
            this.Expressions = new Expressions();
            this.Expressions.Duration = reader.readString();
            this.Expressions.Magnitude = reader.readString();
            this.Expressions.Probability = reader.readString();

            this.Reward = reader.readString();
            this.EffectId = reader.readString();
            this.IgnoreED = reader.readBoolean();
            this.Override = reader.readString();
            this.ProcsPerMinute = reader.readFloat();
            this.PowerAttribs = reader.readInt() as Enums.ePowerAttribs;
            this.AtrOrigAccuracy = reader.readFloat();
            this.AtrOrigActivatePeriod = reader.readFloat();
            this.AtrOrigArc = reader.readInt();
            this.AtrOrigCastTime = reader.readFloat();
            this.AtrOrigEffectArea = reader.readInt() as Enums.eEffectArea;
            this.AtrOrigEnduranceCost = reader.readFloat();
            this.AtrOrigInterruptTime = reader.readFloat();
            this.AtrOrigMaxTargets = reader.readInt();
            this.AtrOrigRadius = reader.readFloat();
            this.AtrOrigRange = reader.readFloat();
            this.AtrOrigRechargeTime = reader.readFloat();
            this.AtrOrigSecondaryRange = reader.readFloat();
            this.AtrModAccuracy = reader.readFloat();
            this.AtrModActivatePeriod = reader.readFloat();
            this.AtrModArc = reader.readInt();
            this.AtrModCastTime = reader.readFloat();
            this.AtrModEffectArea = reader.readInt() as Enums.eEffectArea;
            this.AtrModEnduranceCost = reader.readFloat();
            this.AtrModInterruptTime = reader.readFloat();
            this.AtrModMaxTargets = reader.readInt();
            this.AtrModRadius = reader.readFloat();
            this.AtrModRange = reader.readFloat();
            this.AtrModRechargeTime = reader.readFloat();
            this.AtrModSecondaryRange = reader.readFloat();

            const conditionalCount = reader.readInt();
            for (let cIndex = 0; cIndex < conditionalCount; cIndex++) {
                const cKey = reader.readString();
                const cValue = reader.readString();
                this.ActiveConditionals.push({ Key: cKey, Value: cValue });
            }
        } else if (powerOrReader) {
            // Constructor with IPower
            this.power = powerOrReader;
        }
    }

    // Static factory method for GenerateModifyAttrib
    static GenerateModifyAttrib(
        basePower: IPower,
        powerAttrib: Enums.ePowerAttribs,
        attribModValue: number | Enums.eEffectArea,
        conditionals: KeyValue<string, string>[],
        ignoreScaling: boolean = true
    ): Effect {
        const effect = new Effect();
        effect.EffectType = Enums.eEffectType.ModifyAttrib;
        effect.PowerAttribs = powerAttrib;
        effect.nMagnitude = 1; // dummy
        effect.Scale = 1; // dummy
        effect.IgnoreScaling = ignoreScaling;
        effect.ActiveConditionals = conditionals;

        // Inconsistent display behavior if those are not set
        effect.AtrOrigAccuracy = basePower.Accuracy;
        effect.AtrOrigActivatePeriod = basePower.ActivatePeriod;
        effect.AtrOrigArc = basePower.Arc;
        effect.AtrOrigCastTime = basePower.CastTime;
        effect.AtrOrigEffectArea = basePower.EffectArea;
        effect.AtrOrigEnduranceCost = basePower.EndCost;
        effect.AtrOrigInterruptTime = basePower.InterruptTime;
        effect.AtrOrigMaxTargets = basePower.MaxTargets;
        effect.AtrOrigRadius = basePower.Radius;
        effect.AtrOrigRange = basePower.Range;
        effect.AtrOrigRechargeTime = basePower.RechargeTime;
        effect.AtrOrigSecondaryRange = basePower.RangeSecondary;

        // Set the modified attribute based on powerAttrib
        if (powerAttrib === Enums.ePowerAttribs.Accuracy) {
            effect.AtrModAccuracy = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.ActivateInterval) {
            effect.AtrModActivatePeriod = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.Arc) {
            effect.AtrModArc = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.CastTime) {
            effect.AtrModCastTime = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.EffectArea) {
            effect.AtrModEffectArea = attribModValue as Enums.eEffectArea;
        } else if (powerAttrib === Enums.ePowerAttribs.EnduranceCost) {
            effect.AtrModEnduranceCost = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.InterruptTime) {
            effect.AtrModInterruptTime = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.MaxTargets) {
            effect.AtrModMaxTargets = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.Radius) {
            effect.AtrModRadius = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.Range) {
            effect.AtrModRange = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.RechargeTime) {
            effect.AtrModRechargeTime = attribModValue as number;
        } else if (powerAttrib === Enums.ePowerAttribs.SecondaryRange) {
            effect.AtrModSecondaryRange = attribModValue as number;
        }

        // Set non-modified attributes to original values
        if (powerAttrib !== Enums.ePowerAttribs.Accuracy) {
            effect.AtrModAccuracy = basePower.Accuracy;
        }
        if (powerAttrib !== Enums.ePowerAttribs.ActivateInterval) {
            effect.AtrModActivatePeriod = basePower.ActivatePeriod;
        }
        if (powerAttrib !== Enums.ePowerAttribs.Arc) {
            effect.AtrModArc = basePower.Arc;
        }
        if (powerAttrib !== Enums.ePowerAttribs.CastTime) {
            effect.AtrModCastTime = basePower.CastTime;
        }
        if (powerAttrib !== Enums.ePowerAttribs.EffectArea) {
            effect.AtrModEffectArea = basePower.EffectArea;
        }
        if (powerAttrib !== Enums.ePowerAttribs.EnduranceCost) {
            effect.AtrModEnduranceCost = basePower.EndCost;
        }
        if (powerAttrib !== Enums.ePowerAttribs.InterruptTime) {
            effect.AtrModInterruptTime = basePower.InterruptTime;
        }
        if (powerAttrib !== Enums.ePowerAttribs.MaxTargets) {
            effect.AtrModMaxTargets = basePower.MaxTargets;
        }
        if (powerAttrib !== Enums.ePowerAttribs.Radius) {
            effect.AtrModRadius = basePower.Radius;
        }
        if (powerAttrib !== Enums.ePowerAttribs.Range) {
            effect.AtrModRange = basePower.Range;
        }
        if (powerAttrib !== Enums.ePowerAttribs.RechargeTime) {
            effect.AtrModRechargeTime = basePower.RechargeTime;
        }
        if (powerAttrib !== Enums.ePowerAttribs.SecondaryRange) {
            effect.AtrModSecondaryRange = basePower.RangeSecondary;
        }

        return effect;
    }

    // Public copy constructor (used by Clone)
    static fromTemplate(template: IEffect): Effect {
        const effect = new Effect();
        effect.PowerFullName = template.PowerFullName;
        effect.power = template.GetPower();
        effect.Enhancement = template.Enhancement;
        effect.UniqueID = template.UniqueID;
        effect.EffectClass = template.EffectClass;
        effect.EffectType = template.EffectType;
        effect.DisplayPercentageOverride = template.DisplayPercentageOverride;
        effect.DamageType = template.DamageType;
        effect.MezType = template.MezType;
        effect.ETModifies = template.ETModifies;
        effect.Summon = template.Summon;
        effect.Ticks = template.Ticks;
        effect.DelayedTime = template.DelayedTime;
        effect.Stacking = template.Stacking;
        effect.BaseProbability = template.BaseProbability;
        effect.Suppression = template.Suppression;
        effect.Buffable = template.Buffable;
        effect.Resistible = template.Resistible;
        effect.SpecialCase = template.SpecialCase;
        effect.VariableModifiedOverride = template.VariableModifiedOverride;
        effect.IgnoreScaling = template.IgnoreScaling;
        effect.isEnhancementEffect = template.isEnhancementEffect;
        effect.PvMode = template.PvMode;
        effect.ToWho = template.ToWho;
        effect.Scale = template.Scale;
        effect.nMagnitude = template.nMagnitude;
        effect.nDuration = template.nDuration;
        effect.AttribType = template.AttribType;
        effect.Aspect = template.Aspect;
        effect.ModifierTable = template.ModifierTable;
        effect.nModifierTable = template.nModifierTable;
        effect.NearGround = template.NearGround;
        effect.CancelOnMiss = template.CancelOnMiss;
        effect.ProcsPerMinute = template.ProcsPerMinute;
        effect.Absorbed_Duration = template.Absorbed_Duration;
        effect.Absorbed_Effect = template.Absorbed_Effect;
        effect.Absorbed_PowerType = template.Absorbed_PowerType;
        effect.Absorbed_Class_nID = template.Absorbed_Class_nID;
        effect.Absorbed_Power_nID = template.Absorbed_Power_nID;
        effect.Absorbed_Interval = template.Absorbed_Interval;
        effect.Absorbed_EffectID = template.Absorbed_EffectID;
        effect.buffMode = template.buffMode;
        effect.Math_Duration = template.Math_Duration;
        effect.Math_Mag = template.Math_Mag;
        effect.RequiresToHitCheck = template.RequiresToHitCheck;
        effect.UIDClassName = template.UIDClassName;
        effect.nIDClassName = template.nIDClassName;
        effect.Expressions = template.Expressions;
        effect.MagnitudeExpression = template.MagnitudeExpression;
        effect.Reward = template.Reward;
        effect.EffectId = template.EffectId;
        effect.IgnoreED = template.IgnoreED;
        effect.Override = template.Override;
        effect.Special = template.Special;
        effect.PowerAttribs = template.PowerAttribs;
        effect.AtrOrigAccuracy = template.AtrOrigAccuracy;
        effect.AtrOrigActivatePeriod = template.AtrOrigActivatePeriod;
        effect.AtrOrigArc = template.AtrOrigArc;
        effect.AtrOrigCastTime = template.AtrOrigCastTime;
        effect.AtrOrigEffectArea = template.AtrOrigEffectArea;
        effect.AtrOrigEnduranceCost = template.AtrOrigEnduranceCost;
        effect.AtrOrigInterruptTime = template.AtrOrigInterruptTime;
        effect.AtrOrigMaxTargets = template.AtrOrigMaxTargets;
        effect.AtrOrigRadius = template.AtrOrigRadius;
        effect.AtrOrigRange = template.AtrOrigRange;
        effect.AtrOrigRechargeTime = template.AtrOrigRechargeTime;
        effect.AtrOrigSecondaryRange = template.AtrOrigSecondaryRange;
        effect.AtrModAccuracy = template.AtrModAccuracy;
        effect.AtrModActivatePeriod = template.AtrModActivatePeriod;
        effect.AtrModArc = template.AtrModArc;
        effect.AtrModCastTime = template.AtrModCastTime;
        effect.AtrModEffectArea = template.AtrModEffectArea;
        effect.AtrModEnduranceCost = template.AtrModEnduranceCost;
        effect.AtrModInterruptTime = template.AtrModInterruptTime;
        effect.AtrModMaxTargets = template.AtrModMaxTargets;
        effect.AtrModRadius = template.AtrModRadius;
        effect.AtrModRange = template.AtrModRange;
        effect.AtrModRechargeTime = template.AtrModRechargeTime;
        effect.AtrModSecondaryRange = template.AtrModSecondaryRange;
        effect.ActiveConditionals = template.ActiveConditionals ? [...template.ActiveConditionals] : [];
        return effect;
    }

    // Properties with getters
    get Probability(): number {
        if (this.AttribType === Enums.eAttribType.Expression && this.Expressions.Probability.trim() !== '') {
            const error: { value: ErrorData } = { value: { Type: ExpressionType.Probability, Found: false, Message: '' } };
            const retValue = Expressions.Parse(this, ExpressionType.Probability, error);
            return error.value.Found ? 0 : Math.max(0, Math.min(1, retValue));
        }
        return this.ActualProbability;
    }

    set Probability(value: number) {
        this.BaseProbability = value;
    }

    private get ActualProbability(): number {
        let probability = this.BaseProbability;

        // Sometimes BaseProbability sticks at 0.75 when PPM is > 0,
        // preventing PPM calculation
        if (this.ProcsPerMinute > 0 && this.power !== null && MidsContext.Character !== null) {
            const areaFactor = this.power.AoEModifier * 0.75 + 0.25;
            const globalRecharge = (MidsContext.Character.DisplayStats.BuffHaste(false) - 100) / 100;
            const rechargeVal = Math.abs(this.power.RechargeTime) < Number.EPSILON
                ? 0
                : this.power.BaseRechargeTime / (this.power.BaseRechargeTime / this.power.RechargeTime - globalRecharge);

            probability = this.power.PowerType === Enums.ePowerType.Click
                ? this.ProcsPerMinute * (rechargeVal + this.power.CastTimeReal) / (60 * areaFactor)
                : this.ProcsPerMinute * 10 / (60 * areaFactor);

            probability = Math.max(this.MinProcChance, Math.min(Effect.MaxProcChance, probability));
        }

        if (MidsContext.Character?.ModifyEffects && this.EffectId !== '' && MidsContext.Character.ModifyEffects!.has(this.EffectId)) {
            probability += MidsContext.Character.ModifyEffects.get(this.EffectId)!;
        }

        return Math.max(0, Math.min(1, probability));
    }

    set EffectiveProbability(value: number) {
        // Reverse calculation Probability -> BaseProbability
        let p = value;
        if (MidsContext.Character !== null && this.EffectId !== '' && MidsContext.Character.ModifyEffects!.has(this.EffectId)) {
            p -= MidsContext.Character.ModifyEffects!.get(this.EffectId)!;
        }
        this.BaseProbability = p;
    }

    get MinProcChance(): number {
        return this.ProcsPerMinute > 0 ? this.ProcsPerMinute * 0.015 + 0.05 : 0.05;
    }

    static readonly MaxProcChance: number = 0.9;

    get Mag(): number {
        return (this.EffectType === Enums.eEffectType.Damage ? -1 : 1) * (() => {
            switch (this.AttribType) {
                case Enums.eAttribType.Magnitude:
                    return this.Scale * this.nMagnitude * DatabaseAPI.GetModifier(this);
                case Enums.eAttribType.Duration:
                    return this.nMagnitude;
                case Enums.eAttribType.Expression:
                    if (this.Expressions.Magnitude.trim() !== '') {
                        const error: { value: ErrorData } = { value: { Type: ExpressionType.Magnitude, Found: false, Message: '' } };
                        return Expressions.Parse(this, ExpressionType.Magnitude, error);
                    }
                    return this.Scale * this.nMagnitude;
                default:
                    return 0;
            }
        })();
    }

    get BuffedMag(): number {
        return Math.abs(this.Math_Mag) > Number.EPSILON ? this.Math_Mag : this.Mag;
    }

    get MagPercent(): number {
        return !this.DisplayPercentage ? this.BuffedMag : this.BuffedMag * 100;
    }

    get Duration(): number {
        switch (this.AttribType) {
            case Enums.eAttribType.Magnitude:
                return Math.abs(this.Math_Duration) > 0.01 ? this.Math_Duration : this.nDuration;
            case Enums.eAttribType.Expression:
                if (this.Expressions.Duration.trim() !== '') {
                    const error: { value: ErrorData } = { value: { Type: ExpressionType.Duration, Found: false, Message: '' } };
                    return Expressions.Parse(this, ExpressionType.Duration, error);
                }
                return Math.abs(this.Math_Duration) > 0.01 ? this.Math_Duration : this.nDuration;
            case Enums.eAttribType.Duration:
                return Math.abs(this.Math_Duration) <= 0.01 ? this.Scale * DatabaseAPI.GetModifier(this) : this.Math_Duration;
            default:
                return 0;
        }
    }

    get DisplayPercentage(): boolean {
        let flag: boolean;
        switch (this.DisplayPercentageOverride) {
            case Enums.eOverrideBoolean.TrueOverride:
                flag = true;
                break;
            case Enums.eOverrideBoolean.FalseOverride:
                flag = false;
                break;
            default:
                if (this.EffectType === Enums.eEffectType.SilentKill) {
                    flag = false;
                    break;
                }

                switch (this.Aspect) {
                    case Enums.eAspect.Max:
                        if (this.EffectType === Enums.eEffectType.HitPoints || 
                            this.EffectType === Enums.eEffectType.Absorb || 
                            this.EffectType === Enums.eEffectType.Endurance || 
                            this.EffectType === Enums.eEffectType.SpeedRunning || 
                            this.EffectType === Enums.eEffectType.SpeedJumping || 
                            this.EffectType === Enums.eEffectType.SpeedFlying) {
                            return false;
                        }
                        break;
                    case Enums.eAspect.Abs:
                        return false;
                    case Enums.eAspect.Cur:
                        if (this.EffectType === Enums.eEffectType.Mez || 
                            this.EffectType === Enums.eEffectType.StealthRadius || 
                            this.EffectType === Enums.eEffectType.StealthRadiusPlayer) {
                            return false;
                        }
                        break;
                }

                flag = true;
                break;
        }

        return flag;
    }

    get VariableModified(): boolean {
        let flag: boolean;
        if (this.VariableModifiedOverride) {
            flag = false;
        } else {
            const ps = this.power?.GetPowerSet();
            if (ps !== null && ps !== undefined) {
                if (ps.nArchetype > -1) {
                    const archetype = DatabaseAPI.Database.Classes[ps.nArchetype];
                    if (archetype && !archetype.Playable) {
                        return false;
                    }
                } else if (ps.SetType === Enums.ePowerSetType.None || 
                           ps.SetType === Enums.ePowerSetType.Accolade || 
                           ps.SetType === Enums.ePowerSetType.Pet || 
                           ps.SetType === Enums.ePowerSetType.SetBonus || 
                           ps.SetType === Enums.ePowerSetType.Temp) {
                    return false;
                }
            }

            if ((this.EffectType === Enums.eEffectType.EntCreate) && 
                (this.ToWho === Enums.eToWho.Target) && 
                (this.Stacking === Enums.eStacking.Yes) && 
                !this.IgnoreScaling) {
                flag = true;
            } else if ((this.EffectType === Enums.eEffectType.DamageBuff) && 
                       (this.ToWho === Enums.eToWho.Target) && 
                       (this.Stacking === Enums.eStacking.Yes) && 
                       !this.IgnoreScaling) {
                flag = true;
            } else {
                if (this.power !== null) {
                    for (let index = 0; index <= this.power.Effects.length - 1; ++index) {
                        if ((this.power.Effects[index].EffectType === Enums.eEffectType.EntCreate) && 
                            (this.power.Effects[index].ToWho === Enums.eToWho.Target) && 
                            (this.power.Effects[index].Stacking === Enums.eStacking.Yes)) {
                            return false;
                        }
                    }
                }

                flag = this.ToWho === Enums.eToWho.Self && this.Stacking === Enums.eStacking.Yes;
            }
        }

        return flag;
    }

    set VariableModified(value: boolean) {
        // Setter does nothing in C# - property is computed
    }

    get InherentSpecial(): boolean {
        return this.SpecialCase === Enums.eSpecialCase.Assassination || 
               this.SpecialCase === Enums.eSpecialCase.Hidden || 
               this.SpecialCase === Enums.eSpecialCase.Containment || 
               this.SpecialCase === Enums.eSpecialCase.CriticalHit || 
               this.SpecialCase === Enums.eSpecialCase.Domination || 
               this.SpecialCase === Enums.eSpecialCase.Scourge || 
               this.SpecialCase === Enums.eSpecialCase.Supremacy;
    }

    get InherentSpecial2(): boolean {
        return this.ValidateConditional('active', 'Assassination') ||
               this.ValidateConditional('active', 'Containment') ||
               this.ValidateConditional('active', 'CriticalHit') ||
               this.ValidateConditional('active', 'Domination') ||
               this.ValidateConditional('active', 'Scourge') ||
               this.ValidateConditional('active', 'Supremacy');
    }

    get nSummon(): number {
        if (this.SummonId === null) {
            this.SummonId = this.EffectType === Enums.eEffectType.EntCreate
                ? DatabaseAPI.NidFromUidEntity(this.Summon)
                : DatabaseAPI.NidFromUidPower(this.Summon);
        }
        return this.SummonId;
    }

    set nSummon(value: number) {
        this.SummonId = value;
    }

    get nOverride(): number {
        if (this.OverrideId === null) {
            this.OverrideId = DatabaseAPI.NidFromUidPower(this.Override);
        }
        return this.OverrideId;
    }

    set nOverride(value: number) {
        this.OverrideId = value;
    }

    get SummonedEntityName(): string {
        this._summonedEntName = (() => {
            if (this.nSummon <= -1) {
                return this.Summon;
            } else if (this.nSummon > -1 && this.nSummon <= DatabaseAPI.Database.Entities.length) {
                return DatabaseAPI.Database.Entities[this.nSummon].DisplayName;
            } else {
                return '';
            }
        })();
        return this._summonedEntName;
    }

    // IEffect interface methods
    GetPower(): IPower | null {
        return this.power;
    }

    SetPower(power: IPower | null): void {
        this.power = power;
    }

    isDamage(): boolean {
        return this.EffectType === Enums.eEffectType.Defense || 
               this.EffectType === Enums.eEffectType.DamageBuff || 
               this.EffectType === Enums.eEffectType.Resistance || 
               this.EffectType === Enums.eEffectType.Damage || 
               this.EffectType === Enums.eEffectType.Elusivity;
    }

    // Additional properties that need to be defined
    IgnoreED: boolean = false;
    Ticks: number = 0;
    DelayedTime: number = 0;

    // Methods
    BuildEffectStringShort(noMag: boolean = false, simple: boolean = false, useBaseProbability: boolean = false): string {
        let str1 = '';
        let str2 = '';
        let iValue = '';
        let str3 = '';
        let str4 = '';
        const effectNameShort1 = Enums.GetEffectNameShort(this.EffectType);
        if (this.power?.VariableEnabled && this.VariableModified && !this.IgnoreScaling) {
            str4 = ' (V)';
        }

        if (!simple) {
            switch (this.ToWho) {
                case Enums.eToWho.Target:
                    str3 = ' to Tgt';
                    break;
                case Enums.eToWho.Self:
                    str3 = ' to Slf';
                    break;
            }
        }

        if (useBaseProbability) {
            if (this.BaseProbability < 1.0) {
                iValue = (this.BaseProbability * 100).toFixed(0) + '% chance';
            }
        } else if (this.Probability < 1.0) {
            iValue = (this.Probability * 100).toFixed(0) + '% chance';
        }

        if (!noMag) {
            str1 = Utilities.FixDP(this.MagPercent);
            if (this.DisplayPercentage) {
                str1 += '%';
            }
        }

        let str5: string;
        switch (this.EffectType) {
            case Enums.eEffectType.None:
                str5 = this.Special;
                if (this.Special === 'Debt Protection' && !noMag) {
                    str5 = str1 + '% ' + str5;
                }
                break;
            case Enums.eEffectType.Damage:
            case Enums.eEffectType.DamageBuff:
            case Enums.eEffectType.Defense:
            case Enums.eEffectType.Resistance:
            case Enums.eEffectType.Elusivity:
                const name1 = Enums.GetDamageNameShort(this.DamageType);
                if (this.EffectType === Enums.eEffectType.Damage) {
                    if (this.Ticks > 0) {
                        str1 = `${this.Ticks} * ${str1}`;
                        if (this.Duration > 0.0) {
                            str2 = ` over ${Utilities.FixDP(this.Duration)} seconds`;
                        } else if (this.Absorbed_Duration > 0.0) {
                            str2 = ` over ${Utilities.FixDP(this.Absorbed_Duration)} seconds`;
                        }
                    }
                    str5 = `${str1} ${name1} ${effectNameShort1}${str3}${str2}`;
                    break;
                }
                let str6 = `(${name1})`;
                if (this.DamageType === Enums.eDamage.None) {
                    str6 = '';
                }
                str5 = `${str1} ${effectNameShort1}${str6}${str3}${str2}`;
                break;
            case Enums.eEffectType.Endurance:
                if (noMag) {
                    str5 = '+Max End';
                    break;
                }
                str5 = `${str1} ${effectNameShort1}${str3}${str2}`;
                break;
            case Enums.eEffectType.Enhancement:
                let str7: string;
                if (this.ETModifies !== Enums.eEffectType.Mez) {
                    if (this.ETModifies === Enums.eEffectType.Defense || this.ETModifies === Enums.eEffectType.Resistance) {
                        str7 = Enums.GetDamageNameShort(this.DamageType) + ' ' + Enums.GetEffectNameShort(this.ETModifies);
                    } else {
                        str7 = Enums.GetEffectNameShort(this.ETModifies);
                    }
                } else {
                    str7 = Enums.GetMezNameShort(this.MezType as unknown as Enums.eMezShort);
                }
                str5 = `${str1} ${effectNameShort1}(${str7})${str3}${str2}`;
                break;
            case Enums.eEffectType.GrantPower:
            case Enums.eEffectType.ExecutePower:
                const powerByName = DatabaseAPI.GetPowerByFullName(this.Summon);
                const str8 = powerByName === null ? ` ${this.Summon}` : ` ${powerByName.DisplayName}`;
                str5 = effectNameShort1 + str8 + str3;
                break;
            case Enums.eEffectType.Heal:
            case Enums.eEffectType.HitPoints:
                if (noMag) {
                    str5 = '+Max HP';
                    break;
                }
                if (this.Aspect === Enums.eAspect.Cur) {
                    str5 = `${Utilities.FixDP(this.BuffedMag * 100)}% ${effectNameShort1}${str3}${str2}`;
                    break;
                }
                if (!this.DisplayPercentage) {
                    str5 = `${str1} (${Utilities.FixDP((this.BuffedMag / (MidsContext.Archetype?.Hitpoints || 1) * 100))}%)${effectNameShort1}${str3}${str2}`;
                    break;
                }
                str5 = `${Utilities.FixDP(this.BuffedMag / 100 * (MidsContext.Archetype?.Hitpoints || 1))} (${str1}) ${effectNameShort1}${str3}${str2}`;
                break;
            case Enums.eEffectType.Mez:
                const name2 = Enums.GetMezName(this.MezType);
                if (this.Duration > 0.0 && (!simple || (this.MezType !== Enums.eMez.None && this.MezType !== Enums.eMez.Knockback && this.MezType !== Enums.eMez.Knockup))) {
                    str2 = Utilities.FixDP(this.Duration) + ' second ';
                }
                const str9 = ` (Mag ${str1})`;
                str5 = `${str2}${name2}${str9}${str3}`;
                break;
            case Enums.eEffectType.MezResist:
                const name3 = Enums.GetMezName(this.MezType);
                if (!noMag) {
                    str1 = ` ${str1}`;
                }
                str5 = `${effectNameShort1}(${name3})${str1}${str3}${str2}`;
                break;
            case Enums.eEffectType.Recovery:
                if (noMag) {
                    str5 = '+Recovery';
                    break;
                }
                if (this.DisplayPercentage) {
                    str5 = `${str1} (${Utilities.FixDP(this.BuffedMag * ((MidsContext.Archetype?.BaseRecovery || 0) * Statistics.BaseMagic))} /s) ${effectNameShort1}${str3}${str2}`;
                    break;
                }
                str5 = `${str1} ${effectNameShort1}${str3}${str2}`;
                break;
            case Enums.eEffectType.Regeneration:
                if (noMag) {
                    str5 = '+Regeneration';
                    break;
                }
                if (this.DisplayPercentage) {
                    str5 = `${str1} (${Utilities.FixDP((MidsContext.Archetype?.Hitpoints || 1) / 100.0 * (this.BuffedMag * (MidsContext.Archetype?.BaseRegen || 0) * 1.66666662693024))} HP/s) ${effectNameShort1}${str3}${str2}`;
                    break;
                }
                str5 = `${str1} ${effectNameShort1}${str3}${str2}`;
                break;
            case Enums.eEffectType.ResEffect:
                const effectNameShort2 = Enums.GetEffectNameShort(this.ETModifies);
                str5 = `${str1} ${effectNameShort1}(${effectNameShort2})${str3}${str2}`;
                break;
            case Enums.eEffectType.StealthRadius:
            case Enums.eEffectType.StealthRadiusPlayer:
                str5 = `${str1}ft ${effectNameShort1}${str3}${str2}`;
                break;
            case Enums.eEffectType.EntCreate:
                const index = DatabaseAPI.NidFromUidEntity(this.Summon);
                const str10 = index <= -1 ? ` ${this.Summon}` : ` ${DatabaseAPI.Database.Entities[index].DisplayName}`;
                str5 = this.Duration <= 9999
                    ? `${effectNameShort1}${str10}${str3}${str2}`
                    : `${effectNameShort1}${str10}${str3}`;
                break;
            case Enums.eEffectType.GlobalChanceMod:
                str5 = `${str1} ${effectNameShort1} ${this.Reward}${str3}${str2}`;
                break;
            default:
                str5 = `${str1} ${effectNameShort1}${str3}${str2}`;
                break;
        }

        let iStr = '';
        if (iValue !== '') {
            iStr = ` (${this.BuildCs(iValue, iStr)})`;
        }

        return `${str5.trim()}${iStr}${str4}`;
    }

    BuildEffectString(
        simple: boolean = false,
        specialCat: string = '',
        noMag: boolean = false,
        grouped: boolean = false,
        useBaseProbability: boolean = false,
        fromPopup: boolean = false,
        editorDisplay: boolean = false,
        dvDisplay: boolean = false,
        ignoreConditions: boolean = false
    ): string {
        let sBuild = '';
        let sSubEffect = '';
        let sSubSubEffect = '';
        let sMag = '';
        let sDuration = '';
        let sChance = '';
        let sTarget = '';
        let sPvx = '';
        let sStack = '';
        let sBuff = '';
        let sDelay = '';
        let sResist = '';
        let sSpecial = '';
        let sSuppress = '';
        let sVariable = '';
        let sToHit = '';
        let sEnh = '';
        let sSuppressShort = '';
        let sConditional = '';
        let sNearGround = '';
        let sMagExp = '';
        let sProbExp = '';

        // Some variable effect may not show that they are,
        // e.g. Kinetics Fulcrum Shift self buff effect.
        // VariableModified will be false if ToWho is set to Self.
        if (this.power?.VariableEnabled && (this.VariableModified || this.ToWho === Enums.eToWho.Self)) {
            if (!this.IgnoreScaling) sVariable = ' (Variable)';
        }

        if (this.isEnhancementEffect) {
            sEnh = '(From Enh) ';
        }
        const sEffect = Enums.GetEffectName(this.EffectType);

        if (!simple) {
            switch (this.ToWho) {
                case Enums.eToWho.Target:
                    sTarget = ' to Target';
                    break;
                case Enums.eToWho.Self:
                    sTarget = ' to Self';
                    break;
            }
            if (this.RequiresToHitCheck) {
                sToHit = ' requires ToHit check';
            }
        }

        if (this.AttribType === Enums.eAttribType.Expression && this.Expressions.Probability.trim() !== '') {
            if (editorDisplay) {
                const error: { value: ErrorData } = { value: { Type: ExpressionType.Probability, Found: false, Message: '' } };
                const probValue = Expressions.Parse(this, ExpressionType.Probability, error);
                sChance = `${Math.round(Math.max(0, Math.min(100, probValue * 100)))}% Variable Chance`;
                sProbExp = `Probability Expression: ${this.Expressions.Probability}`;
            } else {
                const error: { value: ErrorData } = { value: { Type: ExpressionType.Probability, Found: false, Message: '' } };
                const probValue = Expressions.Parse(this, ExpressionType.Probability, error);
                sChance = `${Math.round(Math.max(0, Math.min(100, probValue * 100)))}% chance`;
            }
        }

        if (sChance === '') {
            if (this.ProcsPerMinute > 0 && this.Probability < 0) {
                sChance = `${this.ProcsPerMinute} PPM`;
            } else if (useBaseProbability) {
                if (this.BaseProbability < 1) {
                    if (this.BaseProbability >= 0) {
                        sChance = this.BaseProbability >= 0.975
                            ? `${(this.BaseProbability * 100).toFixed(1)}% chance`
                            : `${(this.BaseProbability * 100).toFixed(0)}% chance`;

                        sChance += (this.EffectId === '' || this.EffectId === 'Ones') ? '' : ' ';
                    }

                    if (this.EffectId !== '' && this.EffectId !== 'Ones') {
                        sChance += `when ${this.EffectId}`;
                    }

                    if (this.CancelOnMiss) {
                        sChance += ', Cancels on Miss';
                    }

                    if (this.ProcsPerMinute > 0) {
                        sChance = (fromPopup || editorDisplay)
                            ? `${this.ProcsPerMinute} PPM`
                            : `${this.ProcsPerMinute} PPM/${(this.Probability * 100).toFixed(0)}% chance`;
                    }
                }
            } else {
                if (this.Probability < 1) {
                    if (this.Probability >= 0) {
                        sChance = this.Probability >= 0.975
                            ? `${(this.Probability * 100).toFixed(1)}% chance`
                            : `${(this.Probability * 100).toFixed(0)}% chance`;

                        sChance += (this.EffectId === '' || this.EffectId === 'Ones') ? '' : ' ';
                    }

                    if (this.EffectId !== '' && this.EffectId !== 'Ones' && !fromPopup) {
                        sChance += `when ${this.EffectId}`;
                    }

                    if (this.CancelOnMiss) {
                        sChance += ', Cancels on Miss';
                    }

                    if (this.ProcsPerMinute > 0) {
                        sChance = (fromPopup || editorDisplay)
                            ? `${this.ProcsPerMinute} PPM`
                            : `${this.ProcsPerMinute} PPM/${(this.Probability * 100).toFixed(0)}% chance`;
                    }
                }
            }
        }

        let resistPresent = false;
        if (!this.Resistible) {
            if ((!simple && this.ToWho !== Enums.eToWho.Self) || this.EffectType === Enums.eEffectType.Damage) {
                sResist = 'Non-resistible';
                resistPresent = true;
            }
        }

        if (this.NearGround) {
            sNearGround = ' (Must be near ground)';
        }

        switch (this.PvMode) {
            case Enums.ePvX.PvE:
                sPvx = resistPresent ? 'by Mobs' : 'to Mobs';
                if (this.EffectType === Enums.eEffectType.Heal && this.Aspect === Enums.eAspect.Abs && this.Mag > 0 && this.PvMode === Enums.ePvX.PvE) {
                    sPvx = 'in PvE';
                }
                if (this.ToWho === Enums.eToWho.Self) {
                    sPvx = 'in PvE';
                }
                break;
            case Enums.ePvX.PvP:
                sPvx = resistPresent ? 'by Players' : 'to Players';
                if (this.ToWho === Enums.eToWho.Self) {
                    sPvx = 'in PvP';
                }
                break;
            case Enums.ePvX.Any:
                if (this.ToWho === Enums.eToWho.Self && MidsContext.Config?.ShowSelfBuffsAny) {
                    sPvx = 'in PvE/PvP';
                }
                break;
        }

        if (!simple) {
            if (!this.Buffable && this.EffectType !== Enums.eEffectType.DamageBuff) {
                sBuff = this.IgnoreED
                    ? ' [Ignores Enhancements, Buffs & ED]'
                    : ' [Ignores Enhancements & Buffs]';
            }
            if (this.Stacking === Enums.eStacking.No) {
                sStack = '\n  Effect does not stack from same caster';
            }

            if (this.DelayedTime > 0) {
                sDelay = `after ${Utilities.FixDP(this.DelayedTime)} seconds`;
            }
        }

        if (!ignoreConditions) {
            if (this.SpecialCase !== Enums.eSpecialCase.None && this.SpecialCase !== Enums.eSpecialCase.Defiance) {
                // GetSpecialCaseName placeholder - using enum name directly
                sSpecial = Enums.eSpecialCase[this.SpecialCase] || '';
            }

            if (this.ActiveConditionals.length > 0) {
                const getCondition = /(:.*)/;
                const getConditionItem = /(.*:)/;
                const conList: string[] = [];
                for (const cVp of this.ActiveConditionals) {
                    let condition = cVp.Key.replace(getCondition, '').replace(':', '');
                    const conditionItemName = cVp.Key.replace(getConditionItem, '').replace(':', '');
                    const conditionPower = condition === 'Config' ? null : DatabaseAPI.GetPowerByFullName(conditionItemName);
                    const conditionOperator = cVp.Value === 'True' ? 'is ' : cVp.Value === 'False' ? 'not ' : '';

                    switch (condition) {
                        case 'Stacks':
                            conList.push(`${(MidsContext.Config?.CoDEffectFormat ? conditionPower?.FullName : conditionPower?.DisplayName)} ${condition} ${cVp.Value}`);
                            break;
                        case 'Team':
                            conList.push(`${conditionItemName}s on ${condition} ${cVp.Value}`);
                            break;
                        case 'Config':
                            const cfgKey = MidsContext.Config?.CoDEffectFormat
                                ? conditionItemName
                                    .replace('PlayerSettings', 'player')
                                    .replace('TargetSettings', 'target')
                                : conditionItemName;
                            // Note: ConfigData.CombatContext.FormatSettingName needs to be implemented
                            let cfgText = `${condition}:${MidsContext.Config?.CoDEffectFormat ? cfgKey : conditionItemName} ${conditionOperator}${cVp.Value}`
                                .replace(/  /g, ' ')
                                .replace(/Player IsAlive = True/gi, 'Player is Alive')
                                .replace(/Player IsAlive = False/gi, 'Player is Dead')
                                .replace(/Target IsAlive = True/gi, 'Target is Alive')
                                .replace(/Target IsAlive = False/gi, 'Target is Dead');
                            conList.push(cfgText);
                            break;
                        default:
                            conList.push(`${(MidsContext.Config?.CoDEffectFormat ? conditionPower?.FullName : conditionPower?.DisplayName)} ${conditionOperator}${condition}`);
                            break;
                    }
                }

                sConditional = '';
                for (const c of conList) {
                    if (sConditional === '') {
                        sConditional += c.replace(/ OR /g, ' ');
                    } else if (c.includes('OR ')) {
                        sConditional += ` OR ${c.replace(/ OR /g, ' ')}`;
                    } else {
                        sConditional += ` AND ${c}`;
                    }
                }
            }
        }

        if (!simple || (this.Scale > 0 && (this.EffectType === Enums.eEffectType.Mez || this.EffectType === Enums.eEffectType.Endurance) && !(fromPopup && this.EffectType === Enums.eEffectType.Endurance && this.Aspect === Enums.eAspect.Max))) {
            sDuration = '';
            let sForOver: string;
            if (this.EffectType === Enums.eEffectType.Damage || this.EffectType === Enums.eEffectType.Endurance) {
                sForOver = ' over ';
            } else if (this.EffectType === Enums.eEffectType.SilentKill) {
                sForOver = ' in ';
            } else if (this.EffectType === Enums.eEffectType.Mez && (this.MezType === Enums.eMez.Knockback || this.MezType === Enums.eMez.Knockup)) {
                sForOver = 'For ';
            } else {
                sForOver = ' for ';
            }

            if (this.Duration > 0 && (this.EffectType !== Enums.eEffectType.Damage || this.Ticks > 0)) {
                sDuration += `${sForOver}${Utilities.FixDP(this.Duration)} seconds`;
            } else if (this.Absorbed_Duration > 0 && (this.EffectType !== Enums.eEffectType.Damage || this.Ticks > 0)) {
                sDuration += `${sForOver}${Utilities.FixDP(this.Absorbed_Duration)} seconds`;
            } else {
                sDuration += ' ';
            }

            if (this.Absorbed_Interval > 0 && this.Absorbed_Interval < 900) {
                sDuration += ` every ${Utilities.FixDP(this.Absorbed_Interval)} seconds${(this.EffectType === Enums.eEffectType.Mez && (this.MezType === Enums.eMez.Knockback || this.MezType === Enums.eMez.Knockup)) ? ': ' : ''}`;
            }
        }

        if (!noMag && this.EffectType !== Enums.eEffectType.SilentKill) {
            if (this.Expressions.Magnitude !== '' && this.AttribType === Enums.eAttribType.Expression) {
                const mag = this.BuffedMag * (this.DisplayPercentage ? 100 : 1);
                const absAllowed = [
                    Enums.eEffectType.Damage,
                    Enums.eEffectType.DamageBuff,
                    Enums.eEffectType.Defense,
                    Enums.eEffectType.Resistance
                ];

                if (editorDisplay) {
                    if (mag > Number.EPSILON && absAllowed.includes(this.EffectType)) {
                        sMag = `${Math.abs(mag).toFixed(2)}${this.DisplayPercentage ? '%' : ''} Variable`;
                    } else {
                        sMag = `${mag.toFixed(2)}${this.DisplayPercentage ? '%' : ''} Variable`;
                    }
                    sMagExp = `Mag Expression: ${this.Expressions.Magnitude.replace('modifier>current', this.ModifierTable)}`;
                } else {
                    if (mag > Number.EPSILON && absAllowed.includes(this.EffectType)) {
                        sMag = `${Math.abs(mag).toFixed(2)}${this.DisplayPercentage ? '%' : ''}`;
                    } else {
                        sMag = `${mag.toFixed(1)}${this.DisplayPercentage ? '%' : ''}`;
                    }
                }
            } else if (this.EffectType === Enums.eEffectType.PerceptionRadius) {
                const perceptionDistance = ServerData.Instance.BasePerception * this.BuffedMag;
                sMag = (MidsContext.Config?.CoDEffectFormat && !fromPopup)
                    ? `(${(this.Scale * (this.AttribType === Enums.eAttribType.Magnitude ? this.nMagnitude : 1)).toFixed(4)} x ${this.ModifierTable})${this.DisplayPercentage ? '%' : ''} (${perceptionDistance}ft)`
                    : this.DisplayPercentage
                        ? `${Utilities.FixDP(this.BuffedMag * 100)}% (${perceptionDistance}ft)`
                        : `${perceptionDistance}ft`;
            } else {
                sMag = (MidsContext.Config?.CoDEffectFormat && this.EffectType !== Enums.eEffectType.Mez && !fromPopup)
                    ? `(${(this.Scale * (this.AttribType === Enums.eAttribType.Magnitude ? this.nMagnitude : 1)).toFixed(4)} x ${this.ModifierTable})${this.DisplayPercentage ? '%' : ''}`
                    : `${(this.EffectType === Enums.eEffectType.Enhancement && this.ETModifies !== Enums.eEffectType.EnduranceDiscount ? (this.BuffedMag > 0 ? '+' : '-') : '')}${Utilities.FixDP(this.BuffedMag * (this.DisplayPercentage ? 100 : 1))}${this.DisplayPercentage ? '%' : ''}`;
            }

            if (this.Expressions.Duration !== '' && this.AttribType === Enums.eAttribType.Expression && editorDisplay) {
                sMagExp += `${sMagExp === '' ? '' : ' - '}Duration Expression: ${this.Expressions.Duration.replace('modifier>current', this.ModifierTable)}`;
            }
        }

        if (!simple) {
            sSuppress = '';
            if ((this.Suppression & Enums.eSuppress.ActivateAttackClick) === Enums.eSuppress.ActivateAttackClick) {
                sSuppress += '\n  Suppressed when Attacking.';
            }
            if ((this.Suppression & Enums.eSuppress.Attacked) === Enums.eSuppress.Attacked) {
                sSuppress += '\n  Suppressed when Attacked.';
            }
            if ((this.Suppression & Enums.eSuppress.HitByFoe) === Enums.eSuppress.HitByFoe) {
                sSuppress += '\n  Suppressed when Hit.';
            }
            if ((this.Suppression & Enums.eSuppress.MissionObjectClick) === Enums.eSuppress.MissionObjectClick) {
                sSuppress += '\n  Suppressed when MissionObjectClick.';
            }
            if ((this.Suppression & Enums.eSuppress.Held) === Enums.eSuppress.Held ||
                (this.Suppression & Enums.eSuppress.Immobilized) === Enums.eSuppress.Immobilized ||
                (this.Suppression & Enums.eSuppress.Sleep) === Enums.eSuppress.Sleep ||
                (this.Suppression & Enums.eSuppress.Stunned) === Enums.eSuppress.Stunned ||
                (this.Suppression & Enums.eSuppress.Terrorized) === Enums.eSuppress.Terrorized) {
                sSuppress += '\n  Suppressed when Mezzed.';
            }
            if ((this.Suppression & Enums.eSuppress.Knocked) === Enums.eSuppress.Knocked) {
                sSuppress += '\n  Suppressed when Knocked.';
            }
            if ((this.Suppression & Enums.eSuppress.Confused) === Enums.eSuppress.Confused) {
                sSuppress += '\n  Suppressed when Confused.';
            }
            if ((this.Suppression & Enums.eSuppress.Repelled) === Enums.eSuppress.Repelled) {
                sSuppress += '\n  Suppressed when Repelled.';
            }
        } else {
            if ((this.Suppression & Enums.eSuppress.ActivateAttackClick) === Enums.eSuppress.ActivateAttackClick ||
                (this.Suppression & Enums.eSuppress.Attacked) === Enums.eSuppress.Attacked ||
                (this.Suppression & Enums.eSuppress.HitByFoe) === Enums.eSuppress.HitByFoe) {
                sSuppressShort = 'Combat Suppression';
            }
        }

        switch (this.EffectType) {
            case Enums.eEffectType.Elusivity:
            case Enums.eEffectType.Damage:
            case Enums.eEffectType.Resistance:
            case Enums.eEffectType.DamageBuff:
            case Enums.eEffectType.Defense:
                if (specialCat === '') {
                    sSubEffect = grouped ? '%VALUE%' : Enums.GetDamageName(this.DamageType);
                    if (this.EffectType === Enums.eEffectType.Damage) {
                        if (this.Ticks > 0) {
                            sMag = `${this.Ticks} x ${sMag}`;
                        }
                        sBuild = `${sMag} ${sSubEffect} ${sEffect}${sTarget}${sDuration}`;
                    } else {
                        sSubEffect = `(${sSubEffect})`;
                        if (this.DamageType === Enums.eDamage.None) {
                            sSubEffect = '';
                        }
                        sBuild = `${sMag} ${sEffect}${sSubEffect}${sTarget}${sDuration}`;
                    }
                } else {
                    sBuild = `${sMag} ${specialCat} ${sTarget}${sDuration}`;
                }
                break;
            case Enums.eEffectType.StealthRadius:
            case Enums.eEffectType.StealthRadiusPlayer:
                sBuild = `${sMag}ft ${sEffect}${sTarget}${sDuration}`;
                break;
            case Enums.eEffectType.Mez:
                sSubEffect = Enums.GetMezName(this.MezType);
                if (this.AttribType === Enums.eAttribType.Magnitude && this.nDuration > 0 && this.Aspect === Enums.eAspect.Str) {
                    sBuild = (MidsContext.Config?.CoDEffectFormat && !fromPopup
                        ? `(${(this.Scale * this.nMagnitude).toFixed(4)} x ${this.ModifierTable})%`
                        : sMag) + ` ${sSubEffect}${sTarget}${sDuration}`;
                } else {
                    if (this.Duration > 0 && (!simple || (this.MezType !== Enums.eMez.None && this.MezType !== Enums.eMez.Knockback && this.MezType !== Enums.eMez.Knockup))) {
                        sDuration = (MidsContext.Config?.CoDEffectFormat && !fromPopup
                            ? `(${this.Scale.toFixed(4)} x ${this.ModifierTable})`
                            : Utilities.FixDP(this.Duration)) + ' second ';
                    }
                    if (!noMag) {
                        sMag = ` (${(this.MezType === Enums.eMez.Knockback || this.MezType === Enums.eMez.Knockup) && MidsContext.Config?.CoDEffectFormat
                            ? `${(this.Scale * this.nMagnitude).toFixed(4)} x ${this.ModifierTable}`
                            : `Mag ${sMag}`})`;
                    }
                    sBuild = `${sDuration}${sSubEffect}${sMag}${sTarget}`;
                }
                break;
            case Enums.eEffectType.MezResist:
                sSubEffect = Enums.GetMezName(this.MezType);
                if (!noMag) {
                    sMag = ` ${sMag}`;
                }
                sBuild = `${sMag} ${sEffect}(${sSubEffect})${sTarget}${sDuration}`;
                break;
            case Enums.eEffectType.ResEffect:
                sSubEffect = Enums.GetEffectName(this.ETModifies);
                if (sSubEffect === 'Mez') {
                    sSubSubEffect = Enums.GetMezName(this.MezType);
                    sBuild = `${sMag} ${sEffect}(${sSubSubEffect})${sTarget}${sDuration}`;
                } else {
                    sBuild = `${sMag} ${sEffect}(${sSubEffect})${sTarget}${sDuration}`;
                }
                break;
            case Enums.eEffectType.Enhancement:
                let tSpStr: string;
                if (this.ETModifies === Enums.eEffectType.Mez) {
                    tSpStr = Enums.GetMezName(this.MezType as unknown as Enums.eMezShort);
                } else if (this.ETModifies === Enums.eEffectType.Defense || this.ETModifies === Enums.eEffectType.Resistance || this.ETModifies === Enums.eEffectType.Damage) {
                    tSpStr = `${Enums.GetDamageName(this.DamageType)} ${Enums.GetEffectName(this.ETModifies)}`;
                } else {
                    tSpStr = Enums.GetEffectName(this.ETModifies);
                }
                sBuild = `${sMag} ${sEffect}(${tSpStr})${sTarget}${sDuration}`;
                break;
            case Enums.eEffectType.None:
                sBuild = this.Special;
                if (this.Special === 'Debt Protection') {
                    sBuild = `${sMag}% ${sBuild}`;
                }
                break;
            case Enums.eEffectType.Heal:
            case Enums.eEffectType.HitPoints:
                if (!noMag) {
                    if (this.Ticks > 0) {
                        sMag = `${this.Ticks} x ${sMag}`;
                    }
                    if (this.Aspect === Enums.eAspect.Cur) {
                        sBuild = `${Utilities.FixDP(this.BuffedMag * 100)}% ${sEffect}${sTarget}${sDuration}`;
                    } else {
                        sBuild = this.DisplayPercentage
                            ? `${Utilities.FixDP(this.BuffedMag / 100 * (MidsContext.Archetype?.Hitpoints || 1))} HP (${sMag}) ${sEffect}${sTarget}${sDuration}`
                            : `${sMag} HP (${Utilities.FixDP(this.BuffedMag / (MidsContext.Archetype?.Hitpoints || 1) * 100)}%) ${sEffect}${sTarget}${sDuration}`;
                    }
                } else {
                    sBuild = '+Max HP';
                }
                break;
            case Enums.eEffectType.Regeneration:
                if (!noMag) {
                    sBuild = this.DisplayPercentage
                        ? `${sMag} (${Utilities.FixDP((MidsContext.Archetype?.Hitpoints || 1) / 100 * (this.BuffedMag * (MidsContext.Archetype?.BaseRegen || 0) * Statistics.BaseMagic))} HP/sec) ${sEffect}${sTarget}${sDuration}`
                        : `${sMag} ${sEffect}${sTarget}${sDuration}`;
                } else {
                    sBuild = '+Regeneration';
                }
                break;
            case Enums.eEffectType.Recovery:
                if (!noMag) {
                    sBuild = this.DisplayPercentage
                        ? `${sMag} (${Utilities.FixDP(this.BuffedMag * ((MidsContext.Archetype?.BaseRecovery || 0) * Statistics.BaseMagic))} End/sec) ${sEffect}${sTarget}${sDuration}`
                        : `${sMag} ${sEffect}${sTarget}${sDuration}`;
                } else {
                    sBuild = '+Recovery';
                }
                break;
            case Enums.eEffectType.EntCreate:
                sResist = '';
                const summon = DatabaseAPI.NidFromUidEntity(this.Summon);
                const tSummon = summon > -1
                    ? ' ' + (MidsContext.Config?.CoDEffectFormat
                        ? `(${DatabaseAPI.Database.Entities[summon].UID})`
                        : DatabaseAPI.Database.Entities[summon].DisplayName)
                    : ` ${this.Summon}`;
                sBuild = `${sEffect}${tSummon}${sTarget}${(this.Duration > 9999 ? '' : sDuration)}`;
                break;
            case Enums.eEffectType.Endurance:
                if (this.Ticks > 0) {
                    sMag = `${this.Ticks} x ${sMag}`;
                }
                if (noMag) {
                    sBuild = '+Max End';
                } else if (this.Aspect === Enums.eAspect.Max) {
                    sBuild = `${sMag}% Max End${sTarget}${sDuration}`;
                } else {
                    sBuild = `${sMag} ${sEffect}${sTarget}${sDuration}`;
                }
                break;
            case Enums.eEffectType.GrantPower:
            case Enums.eEffectType.ExecutePower:
                sResist = '';
                const pID = DatabaseAPI.GetPowerByFullName(this.Summon);
                const tGrant = pID !== null
                    ? ` ${(MidsContext.Config?.CoDEffectFormat ? `(${pID.FullName})` : pID.DisplayName)}`
                    : ` ${this.Summon}`;
                sBuild = `${sEffect}${tGrant}${sTarget}${(Math.abs(this.Duration) < Number.EPSILON ? '' : ` for ${this.Duration}s`)}${(this.Ticks > 0 && this.EffectType === Enums.eEffectType.ExecutePower ? ` (${this.Ticks} tick${this.Ticks === 1 ? '' : 's'})` : '')}`;
                break;
            case Enums.eEffectType.GlobalChanceMod:
                sBuild = `${sMag} ${sEffect} ${this.Reward}${sTarget}${sDuration}`;
                break;
            case Enums.eEffectType.ModifyAttrib:
                // GetPowerAttribsName placeholder - using enum name directly
                sSubEffect = Enums.ePowerAttribs[this.PowerAttribs] || '';
                switch (sSubEffect) {
                    case 'Accuracy':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModAccuracy} (${(this.AtrModAccuracy * DatabaseAPI.ServerData.BaseToHit * 100).toFixed(2)}%)`;
                        break;
                    case 'ActivateInterval':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModActivatePeriod} second(s)`;
                        break;
                    case 'Arc':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModArc} degrees`;
                        break;
                    case 'CastTime':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModCastTime} second(s)`;
                        break;
                    case 'EffectArea':
                        // GetEffectAreaName placeholder - using enum name directly
                        sBuild = `${sEffect}(${sSubEffect}) to ${Enums.eEffectArea[this.AtrModEffectArea] || ''}`;
                        break;
                    case 'EnduranceCost':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModEnduranceCost}`;
                        break;
                    case 'InterruptTime':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModInterruptTime} second(s)`;
                        break;
                    case 'MaxTargets':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModMaxTargets} target(s)`;
                        break;
                    case 'Radius':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModRadius} feet`;
                        break;
                    case 'Range':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModRange} feet`;
                        break;
                    case 'RechargeTime':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModRechargeTime} second(s)`;
                        break;
                    case 'SecondaryRange':
                        sBuild = `${sEffect}(${sSubEffect}) to ${this.AtrModSecondaryRange} feet`;
                        break;
                    default:
                        break;
                }
                break;
            case Enums.eEffectType.PowerRedirect:
                sBuild = this.Override.trim() !== ''
                    ? `${sEffect}${sTarget} (${DatabaseAPI.GetPowerByFullName(this.Override)?.DisplayName || this.Override})`
                    : `${sEffect}${sTarget} (${this.Override})`;
                break;
            default:
                sBuild = `${sMag} ${sEffect}${sTarget}${sDuration}`;
                break;
        }

        let sExtra = '';
        let sExtra2 = '';
        if ((sChance + sResist + sPvx + sDelay + sSpecial + sConditional + sToHit + sSuppressShort) !== '') {
            sExtra = this.BuildCs(sChance, sExtra);
            sExtra = this.BuildCs(sDelay, sExtra);
            sExtra = this.BuildCs(sSuppressShort, sExtra);
            sExtra = this.BuildCs(sResist, sExtra);
            sExtra2 = this.BuildCs(sChance, sExtra2);
            sExtra2 = this.BuildCs(sDelay, sExtra2);
            sExtra2 = this.BuildCs(sSuppressShort, sExtra2);
            sExtra2 = this.BuildCs(sResist, sExtra2);
            if (sPvx !== '') {
                sExtra = sSpecial !== '' ? this.BuildCs(sPvx + ', if ' + sSpecial, sExtra, resistPresent) : this.BuildCs(sPvx, sExtra, resistPresent);
                sExtra2 = sConditional !== '' ? this.BuildCs(sPvx + ', if ' + sConditional, sExtra2, resistPresent) : this.BuildCs(sPvx, sExtra2, resistPresent);
            } else {
                if (sSpecial !== '') {
                    sExtra = this.BuildCs('if ' + sSpecial, sExtra);
                }
                if (sConditional !== '') {
                    sExtra2 = this.BuildCs('if ' + sConditional, sExtra2);
                }
            }
            sExtra = this.BuildCs(sToHit, sExtra);
            sExtra = ' (' + sExtra + ')';
            sExtra2 = this.BuildCs(sToHit, sExtra2);
            sExtra2 = ' (' + sExtra2 + ')';
            if (this.AttribType === Enums.eAttribType.Expression) {
                if (!editorDisplay && !dvDisplay) {
                    const sType = ' [Expression Based]';
                    sExtra += sType;
                    sExtra2 += sType;
                }
            }
        }

        sExtra = this.BuildCs(sNearGround, sExtra);

        if (sExtra === ' ()') {
            sExtra = '';
        }

        let sFinal = '';
        if (this.AttribType === Enums.eAttribType.Expression && editorDisplay) {
            sFinal = `${(sEnh + sBuild + (sConditional !== '' ? sExtra2 : sExtra) + sBuff + sVariable + sStack + sSuppress).replace(/--/g, '-').trim()}\r\n${sMagExp}\n${sProbExp}`;
        } else {
            sFinal = (sEnh + sBuild + (sConditional !== '' ? sExtra2 : sExtra) + sBuff + sVariable + sStack + sSuppress).replace(/--/g, '-').trim();
        }

        sFinal = sFinal
            .replace('( ', '(')
            .replace(/  /g, ' ')
            .replace('(, ', '(')
            .replace('chance )', 'chance)')
            .replace('SelfFor ', 'Self for ')
            .replace('TargetFor ', 'Target for ');

        return sFinal;
    }

    StoreTo(writer: BinaryWriter): void {
        writer.writeString(this.PowerFullName);
        writer.writeInt(this.UniqueID);
        writer.writeInt(this.EffectClass as number);
        writer.writeInt(this.EffectType as number);
        writer.writeInt(this.DamageType as number);
        writer.writeInt(this.MezType as number);
        writer.writeInt(this.ETModifies as number);
        writer.writeString(this.Summon);
        writer.writeFloat(this.DelayedTime);
        writer.writeInt(this.Ticks);
        writer.writeInt(this.Stacking as number);
        writer.writeFloat(this.BaseProbability);
        writer.writeInt(this.Suppression as number);
        writer.writeBoolean(this.Buffable);
        writer.writeBoolean(this.Resistible);
        writer.writeInt(this.SpecialCase as number);
        writer.writeBoolean(this.VariableModifiedOverride);
        writer.writeBoolean(this.IgnoreScaling);
        writer.writeInt(this.PvMode as number);
        writer.writeInt(this.ToWho as number);
        writer.writeInt(this.DisplayPercentageOverride as number);
        writer.writeFloat(this.Scale);
        writer.writeFloat(this.nMagnitude);
        writer.writeFloat(this.nDuration);
        writer.writeInt(this.AttribType as number);
        writer.writeInt(this.Aspect as number);
        writer.writeString(this.ModifierTable);
        writer.writeBoolean(this.NearGround);
        writer.writeBoolean(this.CancelOnMiss);
        writer.writeBoolean(this.RequiresToHitCheck);
        writer.writeString(this.UIDClassName);
        writer.writeInt(this.nIDClassName);

        writer.writeString(this.Expressions.Duration);
        writer.writeString(this.Expressions.Magnitude);
        writer.writeString(this.Expressions.Probability);

        writer.writeString(this.Reward);
        writer.writeString(this.EffectId);
        writer.writeBoolean(this.IgnoreED);
        writer.writeString(this.Override);
        writer.writeFloat(this.ProcsPerMinute);
        writer.writeInt(this.PowerAttribs as number);
        writer.writeFloat(this.AtrOrigAccuracy);
        writer.writeFloat(this.AtrOrigActivatePeriod);
        writer.writeInt(this.AtrOrigArc);
        writer.writeFloat(this.AtrOrigCastTime);
        writer.writeInt(this.AtrOrigEffectArea as number);
        writer.writeFloat(this.AtrOrigEnduranceCost);
        writer.writeFloat(this.AtrOrigInterruptTime);
        writer.writeInt(this.AtrOrigMaxTargets);
        writer.writeFloat(this.AtrOrigRadius);
        writer.writeFloat(this.AtrOrigRange);
        writer.writeFloat(this.AtrOrigRechargeTime);
        writer.writeFloat(this.AtrOrigSecondaryRange);
        writer.writeFloat(this.AtrModAccuracy);
        writer.writeFloat(this.AtrModActivatePeriod);
        writer.writeInt(this.AtrModArc);
        writer.writeFloat(this.AtrModCastTime);
        writer.writeInt(this.AtrModEffectArea as number);
        writer.writeFloat(this.AtrModEnduranceCost);
        writer.writeFloat(this.AtrModInterruptTime);
        writer.writeInt(this.AtrModMaxTargets);
        writer.writeFloat(this.AtrModRadius);
        writer.writeFloat(this.AtrModRange);
        writer.writeFloat(this.AtrModRechargeTime);
        writer.writeFloat(this.AtrModSecondaryRange);

        writer.writeInt(this.ActiveConditionals.length);
        for (const cVp of this.ActiveConditionals) {
            writer.writeString(cVp.Key);
            writer.writeString(cVp.Value);
        }
    }

    SetTicks(iDuration: number, iInterval: number): number {
        this.Ticks = 0;
        if (iInterval > 0) {
            this.Ticks = Math.floor(1 + iDuration / iInterval);
        }
        return this.Ticks;
    }

    ValidateConditional(cTypeOrIndex?: string | number, cPowername?: string): boolean {
        // Handle overload: ValidateConditional() - no args
        if (cTypeOrIndex === undefined) {
            return BooleanExprPreprocessor.Parse(this as any);
        }
        
        // Handle overload: ValidateConditional(cType: string, powerName: string)
        if (typeof cTypeOrIndex === 'string' && cPowername !== undefined) {
            return BooleanExprPreprocessor.Parse(this as any, cTypeOrIndex, cPowername);
        }
        
        // Handle overload: ValidateConditional(index: number)
        if (typeof cTypeOrIndex === 'number') {
            const index = cTypeOrIndex;
        if (!this.ActiveConditionals || this.ActiveConditionals.length === 0) {
            return true;
        }

        const getCondition = /(:.*)/;
        const getConditionItem = /(.*:)/;

        const cVp = this.ActiveConditionals[index];
        let k = cVp.Key.replace('AND ', '').replace('OR ', '');
        const condition = k.replace(getCondition, '');
        const conditionItemName = k.replace(getConditionItem, '').replace(':', '');
        const conditionPower = DatabaseAPI.GetPowerByFullName(conditionItemName);
        const cVal = cVp.Value.split(' ');

        switch (condition) {
            case 'Active':
                if (conditionPower !== null) {
                    const boolVal = cVp.Value.toLowerCase() === 'true';
                    cVp.Validated = (MidsContext.Character?.CurrentBuild?.PowerActive(conditionPower as any) === boolVal) || false;
                }
                break;
            case 'Taken':
                if (conditionPower !== null) {
                    const boolVal = cVp.Value.toLowerCase() === 'true';
                    cVp.Validated = (MidsContext.Character?.CurrentBuild?.PowerUsed(conditionPower as any) === boolVal) || false;
                }
                break;
            case 'Stacks':
                if (conditionPower !== null) {
                    const pe = MidsContext.Character?.CurrentBuild?.Powers
                        .find(e => e?.Power?.StaticIndex === conditionPower.StaticIndex);
                    const stacks = Math.max(conditionPower.Stacks, pe?.VariableValue || 0);
                    const cStacks = parseInt(cVal[1], 10);

                    switch (cVal[0]) {
                        case '=':
                            cVp.Validated = stacks === cStacks;
                            break;
                        case '>':
                            cVp.Validated = stacks > cStacks;
                            break;
                        case '<':
                            cVp.Validated = stacks < cStacks;
                            break;
                        default:
                            break;
                    }
                }
                break;
            case 'Team':
                switch (cVal[0]) {
                    case '=':
                        cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                            MidsContext.Config?.TeamMembers.get(conditionItemName) === parseInt(cVal[1], 10)) || false;
                        break;
                    case '>':
                        cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                            (MidsContext.Config?.TeamMembers.get(conditionItemName) ?? 0) > parseInt(cVal[1], 10)) || false;
                        break;
                    case '<':
                        cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                            (MidsContext.Config?.TeamMembers.get(conditionItemName) ?? 0) < parseInt(cVal[1], 10)) || false;
                        break;
                }
                break;
        }

        return cVp.Validated || false;
        }
        
        // Default return for invalid input
        return false;
    }

    UpdateAttrib(): void {
        const validConds = this.PowerAttribs === Enums.ePowerAttribs.None || this.ValidateConditional();

        if (!this.power) return;

        switch (this.PowerAttribs) {
            case Enums.ePowerAttribs.Accuracy:
                if (validConds) this.power.Accuracy = this.AtrModAccuracy;
                break;
            case Enums.ePowerAttribs.ActivateInterval:
                if (validConds) this.power.ActivatePeriod = this.AtrModActivatePeriod;
                break;
            case Enums.ePowerAttribs.Arc:
                if (validConds) this.power.Arc = this.AtrModArc;
                break;
            case Enums.ePowerAttribs.CastTime:
                if (validConds) this.power.CastTime = this.AtrModCastTime;
                break;
            case Enums.ePowerAttribs.EffectArea:
                if (validConds) this.power.EffectArea = this.AtrModEffectArea;
                break;
            case Enums.ePowerAttribs.EnduranceCost:
                if (validConds) this.power.EndCost = this.AtrModEnduranceCost;
                break;
            case Enums.ePowerAttribs.InterruptTime:
                if (validConds) this.power.InterruptTime = this.AtrModInterruptTime;
                break;
            case Enums.ePowerAttribs.MaxTargets:
                if (validConds) this.power.MaxTargets = this.AtrModMaxTargets;
                break;
            case Enums.ePowerAttribs.Radius:
                if (validConds) this.power.Radius = this.AtrModRadius;
                break;
            case Enums.ePowerAttribs.Range:
                if (validConds) this.power.Range = this.AtrModRange;
                break;
            case Enums.ePowerAttribs.RechargeTime:
                if (validConds) this.power.RechargeTime = this.AtrModRechargeTime;
                break;
            case Enums.ePowerAttribs.SecondaryRange:
                if (validConds) this.power.RangeSecondary = this.AtrModSecondaryRange;
                break;
        }
    }

    CanInclude(): boolean {
        if (MidsContext.Character === null || !this.ActiveConditionals || (this.ActiveConditionals.length === 0 && this.SpecialCase === Enums.eSpecialCase.None)) {
            return true;
        }

        // SpecialCase Processing
        if (this.SpecialCase !== Enums.eSpecialCase.None) {
            switch (this.SpecialCase) {
                case Enums.eSpecialCase.Hidden:
                    if (MidsContext.Character.IsStalker || MidsContext.Character.IsArachnos) return true;
                    break;
                case Enums.eSpecialCase.Domination:
                    if (MidsContext.Character.Domination) return true;
                    break;
                case Enums.eSpecialCase.Scourge:
                    if (MidsContext.Character.Scourge) return true;
                    break;
                case Enums.eSpecialCase.CriticalHit:
                    if (MidsContext.Character.CriticalHits || MidsContext.Character.IsStalker) return true;
                    break;
                case Enums.eSpecialCase.CriticalBoss:
                    if (MidsContext.Character.CriticalHits) return true;
                    break;
                case Enums.eSpecialCase.Assassination:
                    if (MidsContext.Character.IsStalker && MidsContext.Character.Assassination) return true;
                    break;
                case Enums.eSpecialCase.Containment:
                    if (MidsContext.Character.Containment) return true;
                    break;
                case Enums.eSpecialCase.Defiance:
                    if (MidsContext.Character.Defiance) return true;
                    break;
                case Enums.eSpecialCase.TargetDroneActive:
                    if (MidsContext.Character.IsBlaster && MidsContext.Character.TargetDroneActive) return true;
                    break;
                case Enums.eSpecialCase.NotDisintegrated:
                    if (!MidsContext.Character.DisintegrateActive) return true;
                    break;
                case Enums.eSpecialCase.Disintegrated:
                    if (MidsContext.Character.DisintegrateActive) return true;
                    break;
                case Enums.eSpecialCase.NotAccelerated:
                    if (!MidsContext.Character.AcceleratedActive) return true;
                    break;
                case Enums.eSpecialCase.Accelerated:
                    if (MidsContext.Character.AcceleratedActive) return true;
                    break;
                case Enums.eSpecialCase.NotDelayed:
                    if (!MidsContext.Character.DelayedActive) return true;
                    break;
                case Enums.eSpecialCase.Delayed:
                    if (MidsContext.Character.DelayedActive) return true;
                    break;
                case Enums.eSpecialCase.ComboLevel0:
                    if (MidsContext.Character.ActiveComboLevel === 0) return true;
                    break;
                case Enums.eSpecialCase.ComboLevel1:
                    if (MidsContext.Character.ActiveComboLevel === 1) return true;
                    break;
                case Enums.eSpecialCase.ComboLevel2:
                    if (MidsContext.Character.ActiveComboLevel === 2) return true;
                    break;
                case Enums.eSpecialCase.ComboLevel3:
                    if (MidsContext.Character.ActiveComboLevel === 3) return true;
                    break;
                case Enums.eSpecialCase.FastMode:
                    if (MidsContext.Character.FastModeActive) return true;
                    break;
                case Enums.eSpecialCase.NotAssassination:
                    if (!MidsContext.Character.Assassination) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfBody0:
                    if (MidsContext.Character.PerfectionOfBodyLevel === 0) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfBody1:
                    if (MidsContext.Character.PerfectionOfBodyLevel === 1) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfBody2:
                    if (MidsContext.Character.PerfectionOfBodyLevel === 2) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfBody3:
                    if (MidsContext.Character.PerfectionOfBodyLevel === 3) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfMind0:
                    if (MidsContext.Character.PerfectionOfMindLevel === 0) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfMind1:
                    if (MidsContext.Character.PerfectionOfMindLevel === 1) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfMind2:
                    if (MidsContext.Character.PerfectionOfMindLevel === 2) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfMind3:
                    if (MidsContext.Character.PerfectionOfMindLevel === 3) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfSoul0:
                    if (MidsContext.Character.PerfectionOfSoulLevel === 0) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfSoul1:
                    if (MidsContext.Character.PerfectionOfSoulLevel === 1) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfSoul2:
                    if (MidsContext.Character.PerfectionOfSoulLevel === 2) return true;
                    break;
                case Enums.eSpecialCase.PerfectionOfSoul3:
                    if (MidsContext.Character.PerfectionOfSoulLevel === 3) return true;
                    break;
                case Enums.eSpecialCase.TeamSize1:
                    if (MidsContext.Config?.TeamSize && MidsContext.Config.TeamSize > 1) return true;
                    break;
                case Enums.eSpecialCase.TeamSize2:
                    if (MidsContext.Config?.TeamSize && MidsContext.Config.TeamSize > 2) return true;
                    break;
                case Enums.eSpecialCase.TeamSize3:
                    if (MidsContext.Config?.TeamSize && MidsContext.Config.TeamSize > 3) return true;
                    break;
                case Enums.eSpecialCase.NotComboLevel3:
                    if (MidsContext.Character.ActiveComboLevel !== 3) return true;
                    break;
                case Enums.eSpecialCase.ToHit97:
                    if (MidsContext.Character.DisplayStats.BuffToHit >= 22.0) return true;
                    break;
                case Enums.eSpecialCase.DefensiveAdaptation:
                    if (MidsContext.Character.DefensiveAdaptation) return true;
                    break;
                case Enums.eSpecialCase.EfficientAdaptation:
                    if (MidsContext.Character.EfficientAdaptation) return true;
                    break;
                case Enums.eSpecialCase.OffensiveAdaptation:
                    if (MidsContext.Character.OffensiveAdaptation) return true;
                    break;
                case Enums.eSpecialCase.NotDefensiveAdaptation:
                    if (!MidsContext.Character.DefensiveAdaptation) return true;
                    break;
                case Enums.eSpecialCase.NotDefensiveNorOffensiveAdaptation:
                    if (!MidsContext.Character.OffensiveAdaptation && !MidsContext.Character.DefensiveAdaptation) return true;
                    break;
                case Enums.eSpecialCase.BoxingBuff:
                    if (MidsContext.Character.BoxingBuff) return true;
                    break;
                case Enums.eSpecialCase.NotBoxingBuff:
                    if (MidsContext.Character.NotBoxingBuff) return true;
                    break;
                case Enums.eSpecialCase.KickBuff:
                    if (MidsContext.Character.KickBuff) return true;
                    break;
                case Enums.eSpecialCase.NotKickBuff:
                    if (MidsContext.Character.NotKickBuff) return true;
                    break;
                case Enums.eSpecialCase.CrossPunchBuff:
                    if (MidsContext.Character.CrossPunchBuff) return true;
                    break;
                case Enums.eSpecialCase.NotCrossPunchBuff:
                    if (MidsContext.Character.NotCrossPunchBuff) return true;
                    break;
                case Enums.eSpecialCase.Supremacy:
                    if (MidsContext.Character.Supremacy && !MidsContext.Character.PackMentality) return true;
                    break;
                case Enums.eSpecialCase.SupremacyAndBuffPwr:
                    if (MidsContext.Character.Supremacy && MidsContext.Character.PackMentality) return true;
                    break;
                case Enums.eSpecialCase.PetTier2:
                    if (MidsContext.Character.PetTier2) return true;
                    break;
                case Enums.eSpecialCase.PetTier3:
                    if (MidsContext.Character.PetTier3) return true;
                    break;
                case Enums.eSpecialCase.PackMentality:
                    if (MidsContext.Character.PackMentality) return true;
                    break;
                case Enums.eSpecialCase.NotPackMentality:
                    if (!MidsContext.Character.PackMentality) return true;
                    break;
                case Enums.eSpecialCase.FastSnipe:
                    if (MidsContext.Character.FastSnipe) return true;
                    break;
                case Enums.eSpecialCase.NotFastSnipe:
                    if (!MidsContext.Character.FastSnipe) return true;
                    break;
            }
        }

        // Conditional Processing
        if (this.ActiveConditionals.length > 0) {
            const getCondition = /(:.*)/;
            const getConditionItem = /(.*:)/;
            for (const cVp of this.ActiveConditionals) {
                let condition = cVp.Key.replace(getCondition, '');
                const conditionItemName = cVp.Key.replace(getConditionItem, '').replace(':', '');
                const conditionPower = DatabaseAPI.GetPowerByFullName(conditionItemName);
                const cVal = cVp.Value.split(' ');

                switch (condition) {
                    case 'Active':
                        if (conditionPower !== null) {
                            const boolVal = cVp.Value.toLowerCase() === 'true';
                            if (MidsContext.Character?.CurrentBuild?.PowerActive(conditionPower as any) === boolVal) {
                                cVp.Validated = true;
                            } else {
                                cVp.Validated = false;
                            }
                        }
                        break;
                    case 'Taken':
                        if (conditionPower !== null) {
                            const boolVal = cVp.Value.toLowerCase() === 'true';
                            cVp.Validated = (MidsContext.Character?.CurrentBuild?.PowerUsed(conditionPower as any) === boolVal) || false;
                        }
                        break;
                    case 'Stacks':
                        if (conditionPower !== null) {
                            switch (cVal[0]) {
                                case '=':
                                    cVp.Validated = conditionPower.Stacks === parseInt(cVal[1], 10);
                                    break;
                                case '>':
                                    cVp.Validated = conditionPower.Stacks > parseInt(cVal[1], 10);
                                    break;
                                case '<':
                                    cVp.Validated = conditionPower.Stacks < parseInt(cVal[1], 10);
                                    break;
                            }
                        }
                        break;
                    case 'Team':
                        switch (cVal[0]) {
                            case '=':
                                cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                                    MidsContext.Config?.TeamMembers.get(conditionItemName) === parseInt(cVal[1], 10)) || false;
                                break;
                            case '>':
                                cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                                    (MidsContext.Config?.TeamMembers.get(conditionItemName) ?? 0) > parseInt(cVal[1], 10)) || false;
                                break;
                            case '<':
                                cVp.Validated = (MidsContext.Config?.TeamMembers.has(conditionItemName) &&
                                    (MidsContext.Config?.TeamMembers.get(conditionItemName) ?? 0) < parseInt(cVal[1], 10)) || false;
                                break;
                        }
                        break;
                }
            }

            let allValid = this.ActiveConditionals.length;
            for (const condition of this.ActiveConditionals) {
                if (!condition.Validated) {
                    allValid -= 1;
                }
            }

            if (allValid === this.ActiveConditionals.length) {
                this.Validated = true;
            } else {
                this.Validated = false;
            }

            return this.Validated;
        }

        return false;
    }

    CanGrantPower(): boolean {
        // Same logic as CanInclude but for granting powers
        // For now, we'll use the same implementation
        return this.CanInclude();
    }

    PvXInclude(): boolean {
        if (MidsContext.Archetype === null) return true;
        const config = MidsContext.Config;
        if (!config) return true;
        return ((this.PvMode !== Enums.ePvX.PvP && !config.Inc.DisablePvE) ||
                (this.PvMode !== Enums.ePvX.PvE && config.Inc.DisablePvE)) &&
               (this.nIDClassName === -1 || this.nIDClassName === MidsContext.Archetype.Idx);
    }

    CompareTo(obj: any): number {
        if (obj === null) {
            return 1;
        }

        if (!(obj instanceof Effect)) {
            throw new Error('Compare failed, object is not a Power Effect class');
        }

        const effect = obj as Effect;
        let nVariableFlag = 0;
        if (this.VariableModified && !effect.VariableModified) {
            nVariableFlag = 1;
        } else if (!this.VariableModified && effect.VariableModified) {
            nVariableFlag = -1;
        }

        if (nVariableFlag === 0) {
            if (this.Suppression < effect.Suppression) {
                nVariableFlag = 1;
            } else if (this.Suppression > effect.Suppression) {
                nVariableFlag = -1;
            }
        }

        if (effect.EffectType === Enums.eEffectType.None && this.EffectType !== Enums.eEffectType.None) {
            return -1;
        }
        if (effect.EffectType !== Enums.eEffectType.None && this.EffectType === Enums.eEffectType.None) {
            return 1;
        }

        if (this.EffectType > effect.EffectType) {
            return 1;
        }
        if (this.EffectType < effect.EffectType) {
            return -1;
        }

        if (this.IgnoreED && !effect.IgnoreED) {
            return 1;
        }
        if (!this.IgnoreED && effect.IgnoreED) {
            return -1;
        }

        if (this.EffectId !== effect.EffectId) {
            return this.EffectId.localeCompare(effect.EffectId);
        }
        if (this.Reward !== effect.Reward) {
            return this.Reward.localeCompare(effect.Reward);
        }

        if (this.Expressions.Magnitude !== effect.Expressions.Magnitude) {
            return this.Expressions.Magnitude.localeCompare(effect.Expressions.Magnitude);
        }
        if (this.Expressions.Duration !== effect.Expressions.Duration) {
            return this.Expressions.Duration.localeCompare(effect.Expressions.Duration);
        }
        if (this.Expressions.Probability !== effect.Expressions.Probability) {
            return this.Expressions.Probability.localeCompare(effect.Expressions.Probability);
        }

        // EffectType is the same, go more detailed.
        if (effect.isDamage()) {
            if (this.DamageType > effect.DamageType) {
                return 1;
            }
            if (this.DamageType < effect.DamageType) {
                return -1;
            }
            if (this.Mag > effect.Mag) {
                return 1;
            }
            if (this.Mag < effect.Mag) {
                return -1;
            }
            return nVariableFlag;
        }
        if (effect.EffectType === Enums.eEffectType.ResEffect) {
            if (this.ETModifies > effect.ETModifies) {
                return 1;
            }
            if (this.ETModifies < effect.ETModifies) {
                return -1;
            }
            if (this.Mag > effect.Mag) {
                return 1;
            }
            if (this.Mag < effect.Mag) {
                return -1;
            }
            return nVariableFlag;
        }
        if (effect.EffectType === Enums.eEffectType.Mez || effect.EffectType === Enums.eEffectType.MezResist) {
            if (this.MezType > effect.MezType) {
                return 1;
            }
            if (this.MezType < effect.MezType) {
                return -1;
            }
            if (this.Mag > effect.Mag) {
                return 1;
            }
            if (this.Mag < effect.Mag) {
                return -1;
            }
            if (this.Duration > effect.Duration) {
                return 1;
            }
            if (this.Duration < effect.Duration) {
                return -1;
            }
            return nVariableFlag;
        }
        if (effect.EffectType === Enums.eEffectType.Enhancement) {
            if (this.ETModifies > effect.ETModifies) {
                return 1;
            }
            if (this.ETModifies < effect.ETModifies) {
                return 1;
            }
            if (this.Mag > effect.Mag) {
                return 1;
            }
            if (this.Mag < effect.Mag) {
                return -1;
            }
            if (this.Duration > effect.Duration) {
                return 1;
            }
            if (this.Duration < effect.Duration) {
                return -1;
            }
            return nVariableFlag;
        }
        if (effect.EffectType === Enums.eEffectType.None) {
            return this.Special.localeCompare(effect.Special);
        }
        return nVariableFlag;
    }

    AffectsPetsOnly(): boolean {
        const isSetBonusEffect = this.Reward.includes('Set_Bonus');
        const effectPower = this.GetPower();
        if (!effectPower) return false;
        const enhSet = DatabaseAPI.GetEnhancementSetByBoostName(effectPower.SetName);
        if (!enhSet) return false;
        const setType = DatabaseAPI.GetSetTypeByIndex(enhSet.SetType);
        if (!setType) return false;
        const isPetEnh = setType.Name.includes('Pet');
        return isSetBonusEffect && isPetEnh;
    }

    GetDamage(): Damage {
        if (this.EffectType !== Enums.eEffectType.Damage ||
            (MidsContext.Config?.DamageMath.Calculate === 0 && !(Math.abs(this.Probability) > 0.999000012874603)) || // EDamageMath.Minimum
            this.EffectClass === Enums.eEffectClass.Ignored ||
            (this.DamageType === Enums.eDamage.Special && this.ToWho === Enums.eToWho.Self) ||
            this.Probability <= 0 ||
            !this.CanInclude() ||
            !this.PvXInclude()) {
            return { Type: Enums.eDamage.None, Value: 0 };
        }

        let effectDmg = this.BuffedMag;

        if (MidsContext.Config?.DamageMath.Calculate === 1) { // EDamageMath.Average
            effectDmg *= this.Probability;
        }

        if (this.power?.PowerType === Enums.ePowerType.Toggle && this.isEnhancementEffect) {
            effectDmg = effectDmg * this.power.ActivatePeriod / 10;
        }

        if (this.Ticks > 1) {
            effectDmg *= (this.CancelOnMiss &&
                         MidsContext.Config?.DamageMath.Calculate === 1 && // EDamageMath.Average
                         this.Probability < 1)
                ? ((1 - Math.pow(this.Probability, this.Ticks)) / (1 - this.Probability))
                : this.Ticks;
        }

        return { Type: this.DamageType, Value: effectDmg };
    }

    Clone(): Effect {
        return Effect.fromTemplate(this);
    }

    private BuildCs(iValue: string, iStr: string, noComma: boolean = false): string {
        if (iValue === '' || iValue === null) {
            return iStr;
        }

        if (iStr !== '' && iStr !== null) {
            iStr += noComma ? ' ' : ', ';
        }

        iStr += iValue;
        return iStr;
    }

    GenerateIdentifier(): EffectIdentifier {
        const identifier = new EffectIdentifier();
        identifier.Mag = this.BuffedMag;
        identifier.EffectType = this.EffectType;
        identifier.ETModifies = this.ETModifies;
        identifier.ToWho = this.ToWho;
        identifier.PvMode = this.PvMode;
        identifier.Suppression = this.Suppression;
        identifier.Conditionals = this.ActiveConditionals;
        identifier.IgnoreScaling = this.IgnoreScaling;
        identifier.IgnoreED = this.IgnoreED;
        identifier.Buffable = this.Buffable;
        identifier.Probability = this.Probability;
        identifier.Duration = this.Duration;
        identifier.Ticks = this.Ticks;
        identifier.SpecialCase = this.SpecialCase;
        identifier.Stacking = this.Stacking;
        identifier.RequiresToHitCheck = this.RequiresToHitCheck;
        identifier.CancelOnMiss = this.CancelOnMiss;
        identifier.Resistible = this.Resistible;
        identifier.DelayedTime = this.DelayedTime;
        identifier.PPM = this.ProcsPerMinute;
        return identifier;
    }
}

// Export helper classes/structs
export type { Damage, KeyValue, EffectIdentifier };

