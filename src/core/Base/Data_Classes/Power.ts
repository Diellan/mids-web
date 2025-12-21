// Converted from C# Power.cs
// This is a large file (2,840 lines in C#). Converting systematically.

import { IPower } from '../../IPower';
import { IPowerset } from '../../IPowerset';
import { IEffect } from '../../IEffect';
import { Requirement } from '../../Requirement';
import * as Enums from '../../Enums';
import { DatabaseAPI } from '../../DatabaseAPI';
import { MidsContext } from '../Master_Classes/MidsContext';
import { ConfigData, EDamageMath, EDamageReturn } from '../../ConfigData';
import { SummonedEntity } from '../../SummonedEntity';
import { Archetype } from './Archetype';
import { Effect } from './Effect';
import { BinaryReader, BinaryWriter } from 'csharp-binary-stream';
import { Utilities } from '../Master_Classes/Utilities';

export class Power implements IPower {
    private Contains: boolean = false;
    AbsorbedPetEffects: boolean = false;
    AppliedExecutes: boolean = false;

    // Properties
    StaticIndex: number = -1;
    FullName: string = '';
    GroupName: string = '';
    SetName: string = '';
    PowerName: string = '';
    DisplayName: string = '';
    Available: number = 0;
    Requires: Requirement = new Requirement();
    ModesRequired: Enums.eModeFlags = Enums.eModeFlags.None;
    ModesDisallowed: Enums.eModeFlags = Enums.eModeFlags.None;
    PowerType: Enums.ePowerType = Enums.ePowerType.Click;
    Accuracy: number = 0;
    AccuracyMult: number = 0;
    AttackTypes: Enums.eVector = Enums.eVector.None;
    GroupMembership: string[] = [];
    NGroupMembership: number[] = [];
    EntitiesAffected: Enums.eEntity = Enums.eEntity.None;
    EntitiesAutoHit: Enums.eEntity = Enums.eEntity.None;
    Target: Enums.eEntity = Enums.eEntity.None;
    TargetLoS: boolean = true;
    Range: number = 0;
    TargetSecondary: Enums.eEntity = Enums.eEntity.None;
    RangeSecondary: number = 0;
    EndCost: number = 0;
    InterruptTime: number = 0;
    RechargeTime: number = 0;
    BaseRechargeTime: number = 0;
    ActivatePeriod: number = 0;
    EffectArea: Enums.eEffectArea = Enums.eEffectArea.None;
    Radius: number = 0;
    Arc: number = 0;
    MaxTargets: number = 0;
    MaxBoosts: string = '';
    CastFlags: Enums.eCastFlags = Enums.eCastFlags.None;
    AIReport: Enums.eNotify = Enums.eNotify.Never;
    NumCharges: number = 0;
    UsageTime: number = 0;
    LifeTime: number = 0;
    LifeTimeInGame: number = 0;
    NumAllowed: number = 0;
    DoNotSave: boolean = false;
    BoostsAllowed: string[] = [];
    Enhancements: number[] = [];
    CastThroughHold: boolean = false;
    IgnoreStrength: boolean = false;
    DescShort: string = '';
    DescLong: string = '';
    SortOverride: boolean = false;
    HiddenPower: boolean = false;
    SetTypes: number[] = [];
    ClickBuff: boolean = false;
    AlwaysToggle: boolean = false;
    Level: number = 0;
    AllowFrontLoading: boolean = false;
    VariableEnabled: boolean = false;
    VariableOverride: boolean = false;
    VariableName: string = '';
    VariableMin: number = 0;
    VariableMax: number = 0;
    VariableStart: number = 0;
    NIDSubPower: number[] = [];
    UIDSubPower: string[] = [];
    SubIsAltColor: boolean = false;
    IgnoreEnh: Enums.eEnhance[] = [];
    Ignore_Buff: Enums.eEnhance[] = [];
    SkipMax: boolean = false;
    MutexAuto: boolean = true;
    MutexIgnore: boolean = false;
    AbsorbSummonEffects: boolean = false;
    AbsorbSummonAttributes: boolean = false;
    ShowSummonAnyway: boolean = false;
    NeverAutoUpdate: boolean = false;
    NeverAutoUpdateRequirements: boolean = false;
    IncludeFlag: boolean = false;
    ForcedClass: string = '';
    InherentType: Enums.eGridType = Enums.eGridType.None;
    ForcedClassID: number = 0;
    Effects: IEffect[] = [];
    BuffMode: Enums.eBuffMode = Enums.eBuffMode.Normal;
    HasGrantPowerEffect: boolean = false;
    HasPowerOverrideEffect: boolean = false;
    BoostBoostable: boolean = false;
    BoostUsePlayerLevel: boolean = false;
    HasProcSlotted: boolean = false;
    IsModified: boolean = false;
    IsNew: boolean = false;
    PowerIndex: number = -1;
    PowerSetID: number = -1;
    PowerSetIndex: number = -1;
    HasAbsorbedEffects: boolean = false;
    LocationIndex: number = -1;
    CastTimeReal: number = 0;
    ParentIdx: number = -1;
    Active: boolean = false;
    Taken: boolean = false;
    private _VirtualStacks: number = 0;
    private _Stacks: number = 0;
    MaxSlots: number = 6;

    constructor(powerOrReader?: IPower | BinaryReader) {
        // Initialize defaults
        this.DescLong = '';
        this.DescShort = '';
        this.Enhancements = [];
        this.MaxBoosts = '';
        this.DisplayName = '';
        this.FullName = '';
        this.BoostsAllowed = [];
        this.BuffMode = Enums.eBuffMode.Normal;
        this.Effects = [];
        this.ForcedClass = '';
        this.MutexAuto = true;
        this.TargetLoS = true;
        this.GroupMembership = [];
        this.PowerName = '';
        this.SetName = '';
        this.GroupName = '';
        this.NGroupMembership = [];
        this.PowerSetIndex = -1;
        this.PowerSetID = -1;
        this.PowerIndex = -1;
        this.SetTypes = [];
        this.VariableName = '';
        this.UIDSubPower = [];
        this.NIDSubPower = [];
        this.Ignore_Buff = [];
        this.IgnoreEnh = [];
        this.SubIsAltColor = false;
        this.BoostsAllowed = [];
        this.Requires = new Requirement();
        this.Active = false;
        this.Taken = false;
        this.Stacks = 0;
        this.VariableStart = 0;

        if (powerOrReader instanceof BinaryReader) {
            // Constructor from BinaryReader
            const reader = powerOrReader;
            this.StaticIndex = reader.readInt();
            this.FullName = reader.readString();
            this.GroupName = reader.readString();
            this.SetName = reader.readString();
            this.PowerName = reader.readString();
            this.DisplayName = reader.readString();
            this.Available = reader.readInt();
            this.Requires = new Requirement(reader);
            this.ModesRequired = reader.readInt() as Enums.eModeFlags;
            this.ModesDisallowed = reader.readInt() as Enums.eModeFlags;
            this.PowerType = reader.readInt() as Enums.ePowerType;
            this.Accuracy = reader.readFloat();
            this.AccuracyMult = this.Accuracy;
            this.AttackTypes = reader.readInt() as Enums.eVector;
            const groupMembershipLength = reader.readInt() + 1;
            this.GroupMembership = [];
            for (let index = 0; index < groupMembershipLength; index++) {
                this.GroupMembership.push(reader.readString());
            }
            this.EntitiesAffected = reader.readInt() as Enums.eEntity;
            this.EntitiesAutoHit = reader.readInt() as Enums.eEntity;
            this.Target = reader.readInt() as Enums.eEntity;
            this.TargetLoS = reader.readBoolean();
            this.Range = reader.readFloat();
            this.TargetSecondary = reader.readInt() as Enums.eEntity;
            this.RangeSecondary = reader.readFloat();
            this.EndCost = reader.readFloat();
            this.InterruptTime = reader.readFloat();
            this.CastTime = reader.readFloat();
            this.RechargeTime = reader.readFloat();
            this.BaseRechargeTime = reader.readFloat();
            this.ActivatePeriod = reader.readFloat();
            this.EffectArea = reader.readInt() as Enums.eEffectArea;
            this.Radius = reader.readFloat();
            this.Arc = reader.readInt();
            this.MaxTargets = reader.readInt();
            this.MaxBoosts = reader.readString();
            this.CastFlags = reader.readInt() as Enums.eCastFlags;
            this.AIReport = reader.readInt() as Enums.eNotify;
            this.NumCharges = reader.readInt();
            this.UsageTime = reader.readInt();
            this.LifeTime = reader.readInt();
            this.LifeTimeInGame = reader.readInt();
            this.NumAllowed = reader.readInt();
            this.DoNotSave = reader.readBoolean();
            const boostsAllowedLength = reader.readInt() + 1;
            this.BoostsAllowed = [];
            for (let index = 0; index < boostsAllowedLength; index++) {
                this.BoostsAllowed.push(reader.readString());
            }
            this.CastThroughHold = reader.readBoolean();
            this.IgnoreStrength = reader.readBoolean();
            this.DescShort = reader.readString();
            this.DescLong = reader.readString();
            const enhancementsLength = reader.readInt() + 1;
            this.Enhancements = [];
            for (let index = 0; index < enhancementsLength; index++) {
                this.Enhancements.push(reader.readInt());
            }
            const setTypeCount = reader.readInt();
            this.SetTypes = [];
            for (let i = 0; i <= setTypeCount; i++) {
                this.SetTypes.push(reader.readInt());
            }
            this.ClickBuff = reader.readBoolean();
            this.AlwaysToggle = reader.readBoolean();
            this.Level = reader.readInt();
            this.AllowFrontLoading = reader.readBoolean();
            this.VariableEnabled = reader.readBoolean();
            this.VariableOverride = reader.readBoolean();
            this.VariableName = reader.readString();
            this.VariableMin = reader.readInt();
            this.VariableMax = reader.readInt();
            const uidSubPowerLength = reader.readInt() + 1;
            this.UIDSubPower = [];
            for (let index = 0; index < uidSubPowerLength; index++) {
                this.UIDSubPower.push(reader.readString());
            }
            const ignoreEnhLength = reader.readInt() + 1;
            this.IgnoreEnh = [];
            for (let index = 0; index < ignoreEnhLength; index++) {
                this.IgnoreEnh.push(reader.readInt() as Enums.eEnhance);
            }
            const ignoreBuffLength = reader.readInt() + 1;
            this.Ignore_Buff = [];
            for (let index = 0; index < ignoreBuffLength; index++) {
                this.Ignore_Buff.push(reader.readInt() as Enums.eEnhance);
            }
            this.SkipMax = reader.readBoolean();
            this.InherentType = reader.readInt() as Enums.eGridType;
            this.DisplayLocation = reader.readInt();
            this.MutexAuto = reader.readBoolean();
            this.MutexIgnore = reader.readBoolean();
            this.AbsorbSummonEffects = reader.readBoolean();
            this.AbsorbSummonAttributes = reader.readBoolean();
            this.ShowSummonAnyway = reader.readBoolean();
            this.NeverAutoUpdate = reader.readBoolean();
            this.NeverAutoUpdateRequirements = reader.readBoolean();
            this.IncludeFlag = reader.readBoolean();
            this.ForcedClass = reader.readString();
            this.SortOverride = reader.readBoolean();
            this.BoostBoostable = reader.readBoolean();
            this.BoostUsePlayerLevel = reader.readBoolean();
            const effectsLength = reader.readInt() + 1;
            this.Effects = [];
            for (let index = 0; index < effectsLength; index++) {
                const eff = new Effect(reader);
                eff.nID = index;
                eff.SetPower(this);
                this.Effects.push(eff);
            }
            this.HiddenPower = reader.readBoolean();
            this.Active = reader.readBoolean();
            this.Taken = reader.readBoolean();
            this.Stacks = reader.readInt();
            this.VariableStart = reader.readInt();
        } else if (powerOrReader) {
            // Constructor from IPower template
            const template = powerOrReader;
            this.IsModified = template.IsModified;
            this.IsNew = template.IsNew;
            this.PowerIndex = template.PowerIndex;
            this.PowerSetID = template.PowerSetID;
            this.PowerSetIndex = template.PowerSetIndex;
            this.BuffMode = template.BuffMode;
            this.HasGrantPowerEffect = template.HasGrantPowerEffect;
            this.HasPowerOverrideEffect = template.HasPowerOverrideEffect;
            this.NGroupMembership = [...template.NGroupMembership];
            this.StaticIndex = template.StaticIndex;
            this.FullName = template.FullName;
            this.GroupName = template.GroupName;
            this.SetName = template.SetName;
            this.PowerName = template.PowerName;
            this.DisplayName = template.DisplayName;
            this.Available = template.Available;
            this.Requires = new Requirement(template.Requires);
            this.ModesRequired = template.ModesRequired;
            this.ModesDisallowed = template.ModesDisallowed;
            this.PowerType = template.PowerType;
            this.Accuracy = template.Accuracy;
            this.AccuracyMult = template.AccuracyMult;
            this.AttackTypes = template.AttackTypes;
            this.GroupMembership = [...template.GroupMembership];
            this.EntitiesAffected = template.EntitiesAffected;
            this.EntitiesAutoHit = template.EntitiesAutoHit;
            this.Target = template.Target;
            this.TargetLoS = template.TargetLoS;
            this.Range = template.Range;
            this.TargetSecondary = template.TargetSecondary;
            this.RangeSecondary = template.RangeSecondary;
            this.EndCost = template.EndCost;
            this.InterruptTime = template.InterruptTime;
            this.CastTime = template.CastTimeReal;
            this.RechargeTime = template.RechargeTime;
            this.BaseRechargeTime = template.BaseRechargeTime;
            this.ActivatePeriod = template.ActivatePeriod;
            this.EffectArea = template.EffectArea;
            this.Radius = template.Radius;
            this.Arc = template.Arc;
            this.MaxTargets = template.MaxTargets;
            this.MaxBoosts = template.MaxBoosts;
            this.CastFlags = template.CastFlags;
            this.AIReport = template.AIReport;
            this.NumCharges = template.NumCharges;
            this.UsageTime = template.UsageTime;
            this.LifeTime = template.LifeTime;
            this.LifeTimeInGame = template.LifeTimeInGame;
            this.NumAllowed = template.NumAllowed;
            this.DoNotSave = template.DoNotSave;
            this.BoostsAllowed = [...template.BoostsAllowed];
            this.Enhancements = [...template.Enhancements];
            this.CastThroughHold = template.CastThroughHold;
            this.IgnoreStrength = template.IgnoreStrength;
            this.DescShort = template.DescShort;
            this.DescLong = template.DescLong;
            this.SetTypes = [...template.SetTypes];
            this.Effects = template.Effects.map((effect, index) => {
                const cloned = effect.Clone() as IEffect;
                cloned.SetPower(this);
                return cloned;
            });
            this.ClickBuff = template.ClickBuff;
            this.AlwaysToggle = template.AlwaysToggle;
            this.Level = template.Level;
            this.AllowFrontLoading = template.AllowFrontLoading;
            this.VariableEnabled = template.VariableEnabled;
            this.VariableOverride = template.VariableOverride;
            this.VariableName = template.VariableName;
            this.VariableMin = template.VariableMin;
            this.VariableMax = template.VariableMax;
            this.VariableStart = template.VariableStart;
            this.NIDSubPower = [...template.NIDSubPower];
            this.UIDSubPower = [...template.UIDSubPower];
            this.SubIsAltColor = template.SubIsAltColor;
            this.IgnoreEnh = [...template.IgnoreEnh];
            this.Ignore_Buff = [...template.Ignore_Buff];
            this.SkipMax = template.SkipMax;
            this.InherentType = template.InherentType;
            this.LocationIndex = template.DisplayLocation;
            this.MutexAuto = template.MutexAuto;
            this.MutexIgnore = template.MutexIgnore;
            this.AbsorbSummonEffects = template.AbsorbSummonEffects;
            this.AbsorbSummonAttributes = template.AbsorbSummonAttributes;
            this.ShowSummonAnyway = template.ShowSummonAnyway;
            this.NeverAutoUpdate = template.NeverAutoUpdate;
            this.NeverAutoUpdateRequirements = template.NeverAutoUpdateRequirements;
            this.IncludeFlag = template.IncludeFlag;
            this.ForcedClass = template.ForcedClass;
            this.ForcedClassID = template.ForcedClassID;
            this.SortOverride = template.SortOverride;
            this.BoostUsePlayerLevel = template.BoostUsePlayerLevel;
            this.BoostBoostable = template.BoostBoostable;
            this.HasAbsorbedEffects = template.HasAbsorbedEffects;
            this.HiddenPower = template.HiddenPower;
        } else {
            // Default constructor - calculate StaticIndex
            let num = -2;
            for (const p of DatabaseAPI.Database.Power) {
                if (p && p.StaticIndex > -1 && p.StaticIndex > num) {
                    num = p.StaticIndex;
                }
            }
            this.StaticIndex = num + 1;
        }
    }

    // Computed properties
    get ToggleCost(): number {
        return !((this.PowerType === Enums.ePowerType.Toggle) && (this.ActivatePeriod > 0.0))
            ? this.EndCost
            : this.EndCost / this.ActivatePeriod;
    }

    get IsEpic(): boolean {
        return this.Requires.NPowerID.length > 0 && this.Requires.NPowerID[0][0] !== -1;
    }

    get CastTime(): number {
        return !MidsContext.Config?.UseArcanaTime
            ? this.CastTimeReal
            : (Math.ceil(this.CastTimeReal / 0.132) + 1) * 0.132;
    }

    set CastTime(value: number) {
        this.CastTimeReal = value;
    }

    get CastTimeBase(): number {
        return this.CastTimeReal;
    }

    get ArcanaCastTime(): number {
        return (Math.ceil(this.CastTimeReal / 0.132) + 1) * 0.132;
    }

    get Slottable(): boolean {
        const ps = this.GetPowerSet();
        return this.Enhancements.length > 0 && ps !== null &&
            (ps.SetType === Enums.ePowerSetType.Primary ||
             ps.SetType === Enums.ePowerSetType.Secondary ||
             ps.SetType === Enums.ePowerSetType.Ancillary ||
             ps.SetType === Enums.ePowerSetType.Inherent ||
             ps.SetType === Enums.ePowerSetType.Pool);
    }

    get AoEModifier(): number {
        if (this.EffectArea !== Enums.eEffectArea.Cone) {
            return this.EffectArea !== Enums.eEffectArea.Sphere
                ? 1
                : 1 + this.Radius * 0.150000005960464;
        }
        return 1 + this.Radius * 0.150000005960464 - this.Radius * 0.000366669992217794 * (360 - this.Arc);
    }

    get DisplayLocation(): number {
        return this.LocationIndex;
    }

    set DisplayLocation(value: number) {
        this.LocationIndex = value;
    }

    get HasEntity(): boolean {
        return this.Effects.some(effect => effect.nSummon > -1);
    }

    get FullSetName(): string {
        return `${this.GroupName}.${this.SetName}`;
    }

    get VirtualStacks(): number {
        return this._VirtualStacks;
    }

    set VirtualStacks(value: number) {
        this._VirtualStacks = value;
    }

    get Stacks(): number {
        return this._VirtualStacks;
    }

    set Stacks(value: number) {
        this._Stacks = value;
        this._VirtualStacks = value;
    }

    get InternalStacks(): number {
        return this._Stacks;
    }

    get IsSummonPower(): boolean {
        return this.Effects.some(x => x.EffectType === Enums.eEffectType.EntCreate);
    }

    get IsPetPower(): boolean {
        return this.FullName.startsWith('Pets') ||
               this.FullName.startsWith('Mastermind_Pets') ||
               this.FullName.startsWith('Villain_Pets') ||
               this.FullName.startsWith('Kheldian_Pets');
    }

    // Methods will be added in next part
    GetPowerSet(): IPowerset | null {
        if (!((this.PowerSetID < 0) || (this.PowerSetID > DatabaseAPI.Database.Powersets.length))) {
            return DatabaseAPI.Database.Powersets[this.PowerSetID];
        }
        return null;
    }

    HasMutexID(index: number): boolean {
        return this.NGroupMembership.some(t => t === index);
    }

    // Additional computed properties
    get DescLongFormatted(): string {
        const cfgSettings = ConfigData.GetCombatSettings();
        let formattedDesc = this.DescLong.replace(/  /g, ' ').trim();
        const r = /\{link:([a-zA-Z0-9.\-_]+)\}/g;
        const matches = Array.from(formattedDesc.matchAll(r));
        const g = matches
            .map(e => e[1])
            .filter(e => cfgSettings.has(e));

        if (g.length === 0) {
            return formattedDesc;
        }

        for (const [key] of cfgSettings) {
            formattedDesc = formattedDesc.replace(new RegExp(`\\{link:${key}\\}`, 'gi'), '');
        }

        if (this.VariableEnabled) {
            formattedDesc = `${formattedDesc.trim()} Mids' note: you can use the ${ConfigData.GetCombatSettingName(g[0], cfgSettings)} setting in the Combat Settings window to change the behavior of this power.`;
            if (g.length > 1) {
                formattedDesc += ` It is also affected by ${g.slice(1).map(e => ConfigData.GetCombatSettingName(e, cfgSettings)).join(', ')}.`;
            }
        } else {
            formattedDesc = `${formattedDesc.trim()} Mids' note: you can use the Combat Settings window to change the behavior of this power. It is affected by ${g.map(e => ConfigData.GetCombatSettingName(e, cfgSettings)).join(', ')}`;
        }

        return formattedDesc;
    }

    get CSPrimaryKey(): string | null {
        const cfgSettings = ConfigData.GetCombatSettings();
        const r = /\{link:([a-zA-Z0-9.\-_]+)\}/g;
        const matches = Array.from(this.DescLong.matchAll(r));
        const g = matches
            .map(e => e[1])
            .filter(e => cfgSettings.has(e));

        return g.length === 0 ? null : g[0];
    }

    get CSKeys(): string[] {
        const cfgSettings = ConfigData.GetCombatSettings();
        const r = /\{link:([a-zA-Z0-9.\-_]+)\}/g;
        const matches = Array.from(this.DescLong.matchAll(r));
        return matches
            .map(e => e[1])
            .filter(e => cfgSettings.has(e));
    }

    // IPower interface methods - will be implemented incrementally
    StoreTo(writer: BinaryWriter): void {
        writer.writeInt(this.StaticIndex);
        writer.writeString(this.FullName);
        writer.writeString(this.GroupName);
        writer.writeString(this.SetName);
        writer.writeString(this.PowerName);
        writer.writeString(this.DisplayName);
        writer.writeInt(this.Available);
        this.Requires.StoreTo(writer);
        writer.writeInt(this.ModesRequired as number);
        writer.writeInt(this.ModesDisallowed as number);
        writer.writeInt(this.PowerType as number);
        writer.writeFloat(this.Accuracy);
        writer.writeInt(this.AttackTypes as number);
        writer.writeInt(this.GroupMembership.length - 1);
        for (let index = 0; index < this.GroupMembership.length; index++) {
            writer.writeString(this.GroupMembership[index]);
        }
        writer.writeInt(this.EntitiesAffected as number);
        writer.writeInt(this.EntitiesAutoHit as number);
        writer.writeInt(this.Target as number);
        writer.writeBoolean(this.TargetLoS);
        writer.writeFloat(this.Range);
        writer.writeInt(this.TargetSecondary as number);
        writer.writeFloat(this.RangeSecondary);
        writer.writeFloat(this.EndCost);
        writer.writeFloat(this.InterruptTime);
        writer.writeFloat(this.CastTimeReal);
        writer.writeFloat(this.RechargeTime);
        writer.writeFloat(this.BaseRechargeTime);
        writer.writeFloat(this.ActivatePeriod);
        writer.writeInt(this.EffectArea as number);
        writer.writeFloat(this.Radius);
        writer.writeInt(this.Arc);
        writer.writeInt(this.MaxTargets);
        writer.writeString(this.MaxBoosts);
        writer.writeInt(this.CastFlags as number);
        writer.writeInt(this.AIReport as number);
        writer.writeInt(this.NumCharges);
        writer.writeInt(this.UsageTime);
        writer.writeInt(this.LifeTime);
        writer.writeInt(this.LifeTimeInGame);
        writer.writeInt(this.NumAllowed);
        writer.writeBoolean(this.DoNotSave);
        writer.writeInt(this.BoostsAllowed.length - 1);
        for (let index = 0; index < this.BoostsAllowed.length; index++) {
            writer.writeString(this.BoostsAllowed[index]);
        }
        writer.writeBoolean(this.CastThroughHold);
        writer.writeBoolean(this.IgnoreStrength);
        writer.writeString(this.DescShort);
        writer.writeString(this.DescLong);
        writer.writeInt(this.Enhancements.length - 1);
        for (let index = 0; index < this.Enhancements.length; index++) {
            writer.writeInt(this.Enhancements[index]);
        }
        writer.writeInt(this.SetTypes.length - 1);
        for (const setType of this.SetTypes) {
            writer.writeInt(setType);
        }
        writer.writeBoolean(this.ClickBuff);
        writer.writeBoolean(this.AlwaysToggle);
        writer.writeInt(this.Level);
        writer.writeBoolean(this.AllowFrontLoading);
        writer.writeBoolean(this.VariableEnabled);
        writer.writeBoolean(this.VariableOverride);
        writer.writeString(this.VariableName);
        writer.writeInt(this.VariableMin);
        writer.writeInt(this.VariableMax);
        writer.writeInt(this.UIDSubPower.length - 1);
        for (const sp of this.UIDSubPower) {
            writer.writeString(sp);
        }
        writer.writeInt(this.IgnoreEnh.length - 1);
        for (const ie of this.IgnoreEnh) {
            writer.writeInt(ie as number);
        }
        writer.writeInt(this.Ignore_Buff.length - 1);
        for (const ib of this.Ignore_Buff) {
            writer.writeInt(ib as number);
        }
        writer.writeBoolean(this.SkipMax);
        writer.writeInt(this.InherentType as number);
        writer.writeInt(this.LocationIndex);
        writer.writeBoolean(this.MutexAuto);
        writer.writeBoolean(this.MutexIgnore);
        writer.writeBoolean(this.AbsorbSummonEffects);
        writer.writeBoolean(this.AbsorbSummonAttributes);
        writer.writeBoolean(this.ShowSummonAnyway);
        writer.writeBoolean(this.NeverAutoUpdate);
        writer.writeBoolean(this.NeverAutoUpdateRequirements);
        writer.writeBoolean(this.IncludeFlag);
        writer.writeString(this.ForcedClass);
        writer.writeBoolean(this.SortOverride);
        writer.writeBoolean(this.BoostBoostable);
        writer.writeBoolean(this.BoostUsePlayerLevel);
        writer.writeInt(this.Effects.length - 1);
        for (const fx of this.Effects) {
            fx.StoreTo(writer);
        }
        writer.writeBoolean(this.HiddenPower);
        writer.writeBoolean(this.Active);
        writer.writeBoolean(this.Taken);
        writer.writeInt(this.Stacks);
        writer.writeInt(this.VariableStart);
    }

    GetEntities(): SummonedEntity[] | null {
        if (!this.IsSummonPower) {
            return null;
        }
        return this.Effects
            .filter(effect => effect.EffectType === Enums.eEffectType.EntCreate && effect.nSummon > -1)
            .map(effect => DatabaseAPI.Database.Entities[effect.nSummon]);
    }

    // Placeholder methods - will be fully implemented in next iteration
    FXGetDamageValue(absorb: boolean = false): number {
        let totalDamage = 0;
        const power = new Power(this);
        if (absorb) {
            power.AbsorbPetEffects();
        }

        if (!power.AppliedExecutes) {
            power.ProcessExecutes();
        }

        for (const effect of power.Effects) {
            if (effect.EffectType !== Enums.eEffectType.Damage ||
                (MidsContext.Config?.DamageMath.Calculate === EDamageMath.Minimum && !(Math.abs(effect.Probability) > 0.999000012874603)) ||
                effect.EffectClass === Enums.eEffectClass.Ignored ||
                (effect.DamageType === Enums.eDamage.Special && effect.ToWho === Enums.eToWho.Self) ||
                effect.Probability <= 0 ||
                !effect.CanInclude() ||
                !effect.PvXInclude()) {
                continue;
            }

            let effectDmg = effect.BuffedMag;
            
            if (MidsContext.Config?.DamageMath.Calculate === EDamageMath.Average) {
                effectDmg *= effect.Probability;
            }

            if (power.PowerType === Enums.ePowerType.Toggle && effect.isEnhancementEffect) {
                effectDmg = effectDmg * power.ActivatePeriod / 10;
            }

            if (effect.Ticks > 1) {
                effectDmg *= effect.CancelOnMiss &&
                        MidsContext.Config?.DamageMath.Calculate === EDamageMath.Average &&
                        effect.Probability < 1
                    ? (1 - Math.pow(effect.Probability, effect.Ticks)) / (1 - effect.Probability)
                    : effect.Ticks;
            }

            totalDamage += effectDmg;
        }

        switch (MidsContext.Config?.DamageMath.ReturnValue) {
            case EDamageReturn.DPS:
                if (power.PowerType === Enums.ePowerType.Toggle && power.ActivatePeriod > 0) {
                    totalDamage /= power.ActivatePeriod;
                    break;
                }

                if (power.RechargeTime + power.CastTime + power.InterruptTime > 0) {
                    totalDamage /= power.RechargeTime + power.CastTime + power.InterruptTime;
                }

                break;
            case EDamageReturn.DPA:
                if (power.PowerType === Enums.ePowerType.Toggle && power.ActivatePeriod > 0) {
                    totalDamage /= power.ActivatePeriod;
                    break;
                }

                if (power.CastTime > 0) {
                    totalDamage /= power.CastTime;
                }

                break;
        }

        return totalDamage;
    }

    GetDamageTip(): string {
        let tip = '';
        let hasSpecialEnhFx = -1;
        let includedFxForToggle = -1;
        let hasPvePvpEffect = 0;
        const damageTotals = new Map<Enums.eDamage, number>();

        if (this.Effects.length <= 0) {
            return '';
        }

        for (const effect of this.Effects) {
            if (effect.EffectType !== Enums.eEffectType.Damage) {
                continue;
            }

            if (effect.CanInclude() && effect.PvXInclude() && Math.abs(effect.BuffedMag) >= 0.0001) {
                if (tip !== '') {
                    tip += '\r\n';
                }

                const str = effect.BuildEffectString(false, '', false, false, false, false, false, true);
                if (effect.EffectType === Enums.eEffectType.Damage) {
                    const fxDmg = effect.GetDamage();
                    if (fxDmg.Type !== Enums.eDamage.None && fxDmg.Value > Number.EPSILON) {
                        const current = damageTotals.get(fxDmg.Type) || 0;
                        damageTotals.set(fxDmg.Type, current + fxDmg.Value);
                    }
                }
                
                if (effect.isEnhancementEffect && this.PowerType === Enums.ePowerType.Toggle) {
                    hasSpecialEnhFx++;
                    tip += str + ' (Special, only every 10s)';
                } else if (this.PowerType === Enums.ePowerType.Toggle) {
                    includedFxForToggle++;
                    tip += str;
                } else {
                    tip += str;
                }
            } else {
                hasPvePvpEffect++;
            }
        }

        if (hasPvePvpEffect > 0) {
            if (tip !== '') {
                tip += '\r\n';
            }

            tip += '\r\nThis power deals different damage in PvP and PvE modes.';
        }

        if (!(this.PowerType === Enums.ePowerType.Toggle && hasSpecialEnhFx === -1 && includedFxForToggle === -1) && 
            this.PowerType === Enums.ePowerType.Toggle && includedFxForToggle > -1 && tip !== '') {
            tip = `Applied every ${this.ActivatePeriod} s:\r\n${tip}`;
        }

        if (damageTotals.size > 0) {
            const total = Array.from(damageTotals.values()).reduce((a, b) => a + b, 0);
            const details = Array.from(damageTotals.entries())
                .map(([type, value]) => `${Enums.GetDamageName(type)}: ${Utilities.FixDP(value)}`)
                .join(', ');
            tip += `\r\n\r\nTotal: ${Utilities.FixDP(total)} (${details})`;
        }

        return tip;
    }

    FXGetDamageString(absorb: boolean = false): string {
        const damageTypeNames = Object.keys(Enums.eDamage).filter(k => isNaN(Number(k)));
        const totalDamageArray = new Array<number>(damageTypeNames.length).fill(0);
        const tickDamageArray: number[][] = Array(damageTypeNames.length).fill(null).map(() => [0, 0]);
        const tickCountArray: number[][] = Array(damageTypeNames.length).fill(null).map(() => [0, 0]);
        let damageString = '';
        let totalDamage = 0;

        const power = new Power(this);
        if (absorb) {
            power.AbsorbPetEffects();
        }

        const hasPercentDamage = power.Effects.some(e => 
            e.EffectType === Enums.eEffectType.Damage && (e.DisplayPercentage || e.Aspect === Enums.eAspect.Str)
        );

        for (const effect of power.Effects) {
            if (effect.EffectType !== Enums.eEffectType.Damage ||
                (MidsContext.Config?.DamageMath.Calculate === EDamageMath.Minimum &&
                    !(Math.abs(effect.Probability) > 0.999000012874603)) ||
                effect.EffectClass === Enums.eEffectClass.Ignored ||
                (effect.DamageType === Enums.eDamage.Special && effect.ToWho === Enums.eToWho.Self) ||
                !(effect.Probability > 0) ||
                !effect.CanInclude() ||
                !effect.PvXInclude()) {
                continue;
            }

            let effectMagnitude = Math.abs(effect.BuffedMag);

            if (MidsContext.Config?.DamageMath.Calculate === EDamageMath.Average) {
                effectMagnitude *= effect.Probability;
            }

            if (power.PowerType === Enums.ePowerType.Toggle && effect.isEnhancementEffect) {
                effectMagnitude = effectMagnitude * power.ActivatePeriod / 10;
            }

            if (Math.abs(effectMagnitude) < 0.0001) {
                continue;
            }

            switch (MidsContext.Config?.DamageMath.ReturnValue) {
                case EDamageReturn.DPS:
                    if (power.PowerType === Enums.ePowerType.Toggle && power.ActivatePeriod > 0) {
                        effectMagnitude /= power.ActivatePeriod;
                        break;
                    }

                    if (power.RechargeTime + power.CastTime > 0) {
                        effectMagnitude /= power.RechargeTime + power.CastTime;
                    }

                    break;
                case EDamageReturn.DPA:
                    if (power.PowerType === Enums.ePowerType.Toggle && power.ActivatePeriod > 0) {
                        effectMagnitude /= power.ActivatePeriod;
                        break;
                    }

                    if (power.CastTime > 0) {
                        effectMagnitude /= power.CastTime;
                    }

                    break;
            }

            if (effect.Ticks !== 0) {
                const effectiveTicks = !effect.CancelOnMiss ||
                    MidsContext.Config?.DamageMath.Calculate !== EDamageMath.Average ||
                    effect.Probability >= 1
                    ? effect.Ticks
                    : (1 - Math.pow(effect.Probability, effect.Ticks)) / (1 - effect.Probability);

                const index = Math.abs(tickDamageArray[effect.DamageType][0]) > 0.01 ? 1 : 0;

                tickDamageArray[effect.DamageType][index] = effectMagnitude;
                tickCountArray[effect.DamageType][index] = effectiveTicks;
                totalDamage += effectMagnitude * effectiveTicks;
            } else {
                totalDamage += effectMagnitude;
                totalDamageArray[effect.DamageType] += effectMagnitude;
            }
        }

        if (Math.abs(totalDamage) < 0.0001) {
            return '0';
        }

        for (let index = 0; index < totalDamageArray.length; index++) {
            if (!(totalDamageArray[index] > 0 || tickDamageArray[index][0] > 0)) {
                continue;
            }

            if (damageString !== '') {
                damageString += ', ';
            }

            let damageEntry = `${Enums.GetDamageName(index as Enums.eDamage)}(`;
            if (totalDamageArray[index] > 0) {
                damageEntry += hasPercentDamage
                    ? `${Utilities.FixDP(totalDamageArray[index] * 100)}%`
                    : Utilities.FixDP(totalDamageArray[index]);
            }

            if (Math.abs(tickDamageArray[index][0]) > 0.01) {
                if (totalDamageArray[index] > 0) {
                    damageEntry += '+';
                }

                damageEntry +=
                    `${hasPercentDamage ? `${Utilities.FixDP(tickDamageArray[index][0] * 100)}%` : Utilities.FixDP(tickDamageArray[index][0])}x${Utilities.FixDP(tickCountArray[index][0])}`;
                if (Math.abs(tickDamageArray[index][1]) > 0.01) {
                    damageEntry +=
                        `+${hasPercentDamage ? `${Utilities.FixDP(tickDamageArray[index][1] * 100)}%` : Utilities.FixDP(tickDamageArray[index][1])}x${Utilities.FixDP(tickCountArray[index][1])}`;
                }
            }

            damageString += `${damageEntry})`;
        }

        const hpmax = MidsContext.Character?.Totals.HPMax ?? 0;
        return hasPercentDamage
            ? `${damageString} = ${Utilities.FixDP(totalDamage * 100)}% | ${Utilities.FixDP(totalDamage * hpmax)}`
            : `${damageString} = ${Utilities.FixDP(totalDamage)}`;
    }

    GetRankedEffects(newMode: boolean): number[] {
        interface WeightedEffect {
            effect: IEffect;
            index: number;
            weight: number;
        }

        const weightedEffects: WeightedEffect[] = this.Effects.map((e, i) => ({
            effect: e,
            index: i,
            weight: 0
        }));

        for (let i = 0; i < weightedEffects.length; i++) {
            const wfx = weightedEffects[i];
            if ((MidsContext.Config?.Suppression && (MidsContext.Config.Suppression & wfx.effect.Suppression) !== Enums.eSuppress.None) ||
                (MidsContext.Config?.Inc.DisablePvE && wfx.effect.PvMode === Enums.ePvX.PvE) ||
                (!MidsContext.Config?.Inc.DisablePvE && wfx.effect.PvMode === Enums.ePvX.PvP)) {
                wfx.weight = Number.MIN_SAFE_INTEGER;
                continue;
            }

            if (wfx.effect.ToWho !== Enums.eToWho.Target && wfx.effect.ToWho !== Enums.eToWho.Self) {
                continue;
            }

            let weight = wfx.effect.EffectClass + 1;
            if (Math.abs(wfx.effect.Probability - 1) < 0.01) {
                weight += 10;
            }

            if (this.HasAbsorbedEffects && wfx.effect.EffectType !== Enums.eEffectType.EntCreate) {
                weight += 50;
            }

            if (wfx.effect.DelayedTime > 1) {
                weight -= 100;
            }

            if (wfx.effect.DelayedTime > 0 && wfx.effect.DelayedTime <= 1) {
                weight -= 25;
            }

            if (wfx.effect.InherentSpecial) {
                weight -= 100;
            }

            if (wfx.effect.InherentSpecial2) {
                weight -= 100;
            }

            if (wfx.effect.ToWho === Enums.eToWho.Self && (wfx.effect.BuffedMag > 0 || wfx.effect.EffectType === Enums.eEffectType.Mez)) {
                weight += 10;
            }

            if (wfx.effect.ToWho === Enums.eToWho.Target && wfx.effect.BuffedMag < 0) {
                weight += 10;
            }

            if (wfx.effect.ToWho === Enums.eToWho.Target && wfx.effect.BuffedMag > 0 && wfx.effect.Absorbed_Effect) {
                weight += 10;
            }

            if (wfx.effect.ToWho === Enums.eToWho.Self && wfx.effect.BuffedMag > 0 && wfx.effect.Absorbed_Effect) {
                weight += 10;
            }

            if (wfx.effect.isEnhancementEffect) {
                weight -= 30;
            }

            if (wfx.effect.VariableModified) {
                weight += 30;
            }

            switch (wfx.effect.EffectType) {
                case Enums.eEffectType.None:
                    weight -= 1000;
                    break;
                case Enums.eEffectType.Damage:
                    weight -= 500;
                    break;
                case Enums.eEffectType.DamageBuff:
                    weight += 10;
                    break;
                case Enums.eEffectType.Defense:
                    weight += 25;
                    break;
                case Enums.eEffectType.Endurance:
                    weight += 15;
                    break;
                case Enums.eEffectType.Enhancement:
                    switch (wfx.effect.ETModifies) {
                        case Enums.eEffectType.SpeedFlying:
                        case Enums.eEffectType.SpeedJumping:
                        case Enums.eEffectType.SpeedRunning:
                            weight += 5;
                            break;
                        case Enums.eEffectType.JumpHeight:
                            weight -= 5;
                            break;
                        default:
                            weight += 9;
                            break;
                    }
                    break;
                case Enums.eEffectType.Fly:
                    weight += 3;
                    break;
                case Enums.eEffectType.SpeedFlying:
                    weight += 5;
                    break;
                case Enums.eEffectType.GrantPower:
                    weight += -20;
                    break;
                case Enums.eEffectType.Heal:
                    weight += 15;
                    break;
                case Enums.eEffectType.Absorb:
                    weight += 13;
                    break;
                case Enums.eEffectType.HitPoints:
                    weight += 10;
                    break;
                case Enums.eEffectType.JumpHeight:
                    weight += 5;
                    break;
                case Enums.eEffectType.SpeedJumping:
                    weight += 5;
                    break;
                case Enums.eEffectType.Mez:
                    if (!weightedEffects[i].effect.Buffable) {
                        weight -= 1;
                    }
                    else if (weightedEffects[i].effect.MezType === Enums.eMez.OnlyAffectsSelf || weightedEffects[i].effect.MezType === Enums.eMez.Untouchable) {
                        weight -= 9;
                    }
                    else if (weightedEffects[i].effect.MezType === Enums.eMez.Knockback || weightedEffects[i].effect.MezType === Enums.eMez.Knockup) {
                        weight += Math.round(8 * weightedEffects[i].effect.Probability);
                    } else {
                        weight += Math.round(9 * weightedEffects[i].effect.Probability);
                    }
                    break;
                case Enums.eEffectType.MezResist:
                    weight += 5;
                    break;
                case Enums.eEffectType.MovementControl:
                    weight += 3;
                    break;
                case Enums.eEffectType.MovementFriction:
                    weight += 3;
                    break;
                case Enums.eEffectType.Recovery:
                    weight += 10;
                    break;
                case Enums.eEffectType.Resistance:
                    weight += 20;
                    break;
                case Enums.eEffectType.RevokePower:
                    weight -= 20;
                    break;
                case Enums.eEffectType.SpeedRunning:
                    weight += 5;
                    break;
                case Enums.eEffectType.SetMode:
                    weight -= 500;
                    break;
                case Enums.eEffectType.StealthRadius:
                    weight += 7;
                    break;
                case Enums.eEffectType.StealthRadiusPlayer:
                    weight += 6;
                    break;
                case Enums.eEffectType.EntCreate:
                    if (this.HasAbsorbedEffects) {
                        weight -= 500;
                    }
                    break;
                case Enums.eEffectType.ToHit:
                    weight += 10;
                    break;
                case Enums.eEffectType.Translucency:
                    weight -= 20;
                    break;
                case Enums.eEffectType.GlobalChanceMod:
                    weight += 1;
                    break;
                case Enums.eEffectType.DesignerStatus:
                    weight = Number.MIN_SAFE_INTEGER;
                    break;
                case Enums.eEffectType.Null:
                    weight = Number.MIN_SAFE_INTEGER;
                    break;
                case Enums.eEffectType.NullBool:
                    weight = Number.MIN_SAFE_INTEGER;
                    break;
                default:
                    weight += 9;
                    break;
            }

            wfx.weight = weight;
        }

        return weightedEffects
            .filter(wfx => wfx.weight !== Number.MIN_SAFE_INTEGER)
            .sort((a, b) => b.weight - a.weight)
            .map(wfx => wfx.index);
    }

    GetDurationEffectID(): number {
        // Helper function to compare effects by duration
        const compareEffects = (a: IEffect, b: IEffect): number => {
            if (a.Duration !== b.Duration) {
                return b.Duration - a.Duration;
            }
            if (a.BuffedMag !== b.BuffedMag) {
                return b.BuffedMag - a.BuffedMag;
            }
            return 0;
        };

        const hasMez = this.Effects.some(e => 
            e.EffectType !== Enums.eEffectType.Null && 
            e.EffectType !== Enums.eEffectType.NullBool && 
            e.EffectType !== Enums.eEffectType.DesignerStatus &&
            e.EffectType === Enums.eEffectType.Mez
        );

        if (hasMez) {
            const mezEffects = this.Effects
                .map((e, i) => ({ index: i, effect: e }))
                .filter(({ effect }) =>
                    ((effect.PvMode === Enums.ePvX.Any) ||
                        ((effect.PvMode === Enums.ePvX.PvE) && !MidsContext.Config?.Inc.DisablePvE) ||
                        ((effect.PvMode === Enums.ePvX.PvP) && MidsContext.Config?.Inc.DisablePvE)) &&
                    (effect.EffectType === Enums.eEffectType.Mez) &&
                    (effect.EffectClass !== Enums.eEffectClass.Ignored) &&
                    (effect.Duration > 0) &&
                    effect.ValidateConditional() &&
                    (effect.Probability > Number.EPSILON) &&
                    (effect.SpecialCase !== Enums.eSpecialCase.Defiance)
                );

            if (mezEffects.length > 0) {
                mezEffects.sort((a, b) => compareEffects(a.effect, b.effect));
                return mezEffects[0].index;
            }
        }

        const allEffects = this.Effects
            .map((e, i) => ({ index: i, effect: e }))
            .filter(({ effect }) =>
                ((effect.PvMode === Enums.ePvX.Any) ||
                    ((effect.PvMode === Enums.ePvX.PvE) && !MidsContext.Config?.Inc.DisablePvE) ||
                    ((effect.PvMode === Enums.ePvX.PvP) && MidsContext.Config?.Inc.DisablePvE)) &&
                (effect.EffectClass !== Enums.eEffectClass.Ignored) &&
                (effect.Duration > 0) &&
                effect.ValidateConditional() &&
                (effect.Probability > Number.EPSILON) &&
                (effect.SpecialCase !== Enums.eSpecialCase.Defiance)
            );

        if (allEffects.length > 0) {
            allEffects.sort((a, b) => compareEffects(a.effect, b.effect));
            return allEffects[0].index;
        }

        return -1;
    }

    GetRes(pvE: boolean = true): number[] {
        const damageEnumValues = Object.keys(Enums.eDamage).filter(k => !isNaN(Number(k))).map(k => Number(k));
        const resists = new Array<number>(damageEnumValues.length).fill(0);
        let hasDamage = false;

        for (const fx of this.Effects) {
            if (!(fx.EffectType === Enums.eEffectType.Resistance && fx.Probability > 0 && fx.CanInclude()) ||
                !(fx.PvMode !== Enums.ePvX.PvP && pvE || fx.PvMode !== Enums.ePvX.PvE && !pvE)) {
                continue;
            }

            resists[fx.DamageType] += fx.BuffedMag;
            if (fx.DamageType !== Enums.eDamage.None) {
                hasDamage = true;
            }
        }

        if (hasDamage) {
            return resists;
        }

        const num = resists[0];
        for (let index = 0; index < resists.length; index++) {
            resists[index] = num;
        }

        return resists;
    }

    HasAttribModEffects(): boolean {
        return this.Effects.some(t => t.EffectType === Enums.eEffectType.ModifyAttrib);
    }

    GetEnhancementMagSum(iEffect: Enums.eEffectType, subType: number = 0): Enums.ShortFX {
        const shortFx = new Enums.ShortFXImpl();
        for (let iIndex = 0; iIndex < this.Effects.length; iIndex++) {
            const fx = this.Effects[iIndex];
            if (!fx.PvXInclude() || !(fx.Probability > 0) ||
                (fx.ETModifies !== iEffect || !fx.CanInclude()) ||
                (fx.EffectType !== Enums.eEffectType.Enhancement &&
                    fx.EffectType !== Enums.eEffectType.DamageBuff) ||
                (fx.Absorbed_Effect &&
                    fx.Absorbed_PowerType === Enums.ePowerType.GlobalBoost)) {
                continue;
            }

            if (iEffect === Enums.eEffectType.Mez && fx.ToWho !== Enums.eToWho.Target) {
                if (subType === fx.MezType || subType < 0) {
                    shortFx.Add(iIndex, fx.BuffedMag);
                }
            } else if (fx.ToWho !== Enums.eToWho.Target) {
                shortFx.Add(iIndex, fx.BuffedMag);
            }
        }

        return shortFx;
    }

    GetEffectMagSum(
        iEffect: Enums.eEffectType,
        etModifiesOrIncludeDelayed?: Enums.eEffectType | boolean,
        damageTypeOrOnlySelf?: Enums.eDamage | boolean,
        mezTypeOrOnlyTarget?: Enums.eMez | boolean,
        includeDelayedOrMaxMode?: boolean,
        onlySelf?: boolean,
        onlyTarget?: boolean,
        maxMode?: boolean
    ): Enums.ShortFX {
        // Handle overload: GetEffectMagSum(iEffect, includeDelayed, onlySelf, onlyTarget, maxMode)
        if (typeof etModifiesOrIncludeDelayed === 'boolean') {
            const includeDelayed = etModifiesOrIncludeDelayed;
            const onlySelf = damageTypeOrOnlySelf === true;
            const onlyTarget = mezTypeOrOnlyTarget === true;
            const maxMode = includeDelayedOrMaxMode === true;

            const shortFx = new Enums.ShortFXImpl();
            for (let iIndex = 0; iIndex < this.Effects.length; iIndex++) {
                const fx = this.Effects[iIndex];
                let flag = false;

                switch (fx.ToWho) {
                    case Enums.eToWho.Target:
                        if (!onlySelf) flag = true;
                        break;
                    case Enums.eToWho.Self:
                        if (!onlyTarget) flag = true;
                        break;
                    case Enums.eToWho.All:
                        flag = true;
                        break;
                }

                if (((iEffect === Enums.eEffectType.SpeedFlying) && !maxMode &&
                    fx.Aspect === Enums.eAspect.Max) ||
                    (iEffect === Enums.eEffectType.SpeedRunning) && !maxMode &&
                    (fx.Aspect === Enums.eAspect.Max) ||
                    (iEffect === Enums.eEffectType.SpeedJumping) &&
                    !maxMode && (fx.Aspect === Enums.eAspect.Max)) {
                    flag = false;
                }

                if (MidsContext.Config?.Suppression && (MidsContext.Config.Suppression & fx.Suppression) !== Enums.eSuppress.None) {
                    flag = false;
                }

                if (!flag || !(fx.Probability > 0) ||
                    (maxMode && fx.Aspect !== Enums.eAspect.Max) ||
                    fx.EffectType !== iEffect ||
                    fx.EffectClass === Enums.eEffectClass.Ignored ||
                    fx.EffectClass === Enums.eEffectClass.Special ||
                    !(fx.DelayedTime <= 5) && !includeDelayed ||
                    !fx.CanInclude() ||
                    !fx.PvXInclude()) {
                    continue;
                }

                if (fx.ActiveConditionals && fx.ActiveConditionals.length > 0) {
                    if (!fx.ValidateConditional()) {
                        continue;
                    }
                }

                let mag = fx.BuffedMag;
                if (fx.Ticks > 1 && fx.Stacking === Enums.eStacking.Yes) {
                    mag *= fx.Ticks;
                }

                shortFx.Add(iIndex, mag);
            }

            return shortFx;
        }
        
        // Handle overload: GetEffectMagSum(iEffect, etModifies, damageType, mezType, includeDelayed, onlySelf, onlyTarget, maxMode)
        if (typeof etModifiesOrIncludeDelayed === 'number' && typeof damageTypeOrOnlySelf === 'number') {
            const etModifies = etModifiesOrIncludeDelayed;
            const damageType = damageTypeOrOnlySelf;
            const mezType = mezTypeOrOnlyTarget as Enums.eMez;
            const includeDelayed = includeDelayedOrMaxMode === true;

            const shortFx = new Enums.ShortFXImpl();
            for (let i = 0; i < this.Effects.length; i++) {
                const fx = this.Effects[i];
                if (fx.EffectType !== iEffect || fx.ETModifies !== etModifies || fx.DamageType !== damageType || fx.MezType !== mezType) {
                    continue;
                }

                let includeFlag = false;
                switch (fx.ToWho) {
                    case Enums.eToWho.Target:
                        if (!onlySelf) includeFlag = true;
                        break;
                    case Enums.eToWho.Self:
                        if (!onlyTarget) includeFlag = true;
                        break;
                    case Enums.eToWho.All:
                        includeFlag = true;
                        break;
                }

                if (((iEffect === Enums.eEffectType.SpeedFlying) && !maxMode &&
                    fx.Aspect === Enums.eAspect.Max) ||
                    (iEffect === Enums.eEffectType.SpeedRunning) && !maxMode &&
                    (fx.Aspect === Enums.eAspect.Max) ||
                    (iEffect === Enums.eEffectType.SpeedJumping) &&
                    !maxMode && (fx.Aspect === Enums.eAspect.Max)) {
                    includeFlag = false;
                }

                if (MidsContext.Config?.Suppression && (MidsContext.Config.Suppression & fx.Suppression) !== Enums.eSuppress.None) {
                    includeFlag = false;
                }

                if (!includeFlag || fx.Probability <= 0 ||
                    (maxMode && fx.Aspect !== Enums.eAspect.Max) ||
                    fx.EffectType !== iEffect ||
                    (fx.EffectClass === Enums.eEffectClass.Ignored || fx.EffectClass === Enums.eEffectClass.Special) ||
                    (fx.DelayedTime > 5 && !includeDelayed) ||
                    !fx.CanInclude() ||
                    !fx.PvXInclude()) {
                    continue;
                }

                if (fx.ActiveConditionals && fx.ActiveConditionals.length > 0) {
                    if (!fx.ValidateConditional()) {
                        continue;
                    }
                }

                let mag = fx.BuffedMag;
                if (fx.Ticks > 1 && fx.Stacking === Enums.eStacking.Yes) {
                    mag *= fx.Ticks;
                }

                if (Math.abs(mag) < Number.EPSILON) {
                    continue;
                }

                shortFx.Add(i, mag);
            }

            return shortFx;
        }
        
        // Default return
        return new Enums.ShortFXImpl();
    }

    GetDamageMagSum(iEffect: Enums.eEffectType, iSub: Enums.eDamage, includeDelayed: boolean = false): Enums.ShortFX {
        const shortFx = new Enums.ShortFXImpl();
        for (let iIndex = 0; iIndex < this.Effects.length; iIndex++) {
            const fx = this.Effects[iIndex];
            if (!fx.CanInclude() ||
                !((fx.EffectType === iEffect) && (fx.EffectClass !== Enums.eEffectClass.Ignored)) ||
                !fx.PvXInclude() ||
                !(((fx.DelayedTime <= 5) || includeDelayed) && (fx.DamageType === iSub))) {
                continue;
            }

            if (fx.ActiveConditionals && fx.ActiveConditionals.length > 0) {
                if (!fx.ValidateConditional()) {
                    continue;
                }
            }

            let mag = fx.BuffedMag;
            if ((this.PowerType === Enums.ePowerType.Toggle) && fx.isEnhancementEffect) {
                mag /= 10;
            }

            shortFx.Add(iIndex, mag);
        }

        return shortFx;
    }

    GetEffectMag(iEffect: Enums.eEffectType, iTarget: Enums.eToWho = Enums.eToWho.Unspecified, allowDelay: boolean = false): Enums.ShortFX {
        const shortFx = new Enums.ShortFXImpl();
        for (let iIndex = 0; iIndex < this.Effects.length; iIndex++) {
            const fx = this.Effects[iIndex];
            if (fx.EffectType !== iEffect ||
                fx.EffectClass === Enums.eEffectClass.Ignored ||
                fx.InherentSpecial ||
                fx.InherentSpecial2 ||
                !fx.PvXInclude() ||
                (!(fx.DelayedTime <= 5) && !allowDelay) ||
                (iTarget !== Enums.eToWho.Unspecified && fx.ToWho !== Enums.eToWho.All && iTarget !== fx.ToWho)) {
                continue;
            }

            let mag = fx.BuffedMag;
            if (fx.Ticks > 1) {
                mag *= fx.Ticks;
            }

            if (fx.DisplayPercentage && (fx.EffectType === Enums.eEffectType.Heal || fx.EffectType === Enums.eEffectType.HitPoints)) {
                const hp = MidsContext.Archetype?.Hitpoints ?? 0;
                shortFx.Add(iIndex, mag / 100 * hp);
            } else if (fx.EffectType === Enums.eEffectType.Heal || fx.EffectType === Enums.eEffectType.HitPoints) {
                const hp = MidsContext.Archetype?.Hitpoints ?? 0;
                shortFx.Add(iIndex, mag / hp * 100);
            } else {
                shortFx.Add(iIndex, mag);
            }
        }

        return shortFx;
    }

    AffectsTarget(iEffect: Enums.eEffectType): boolean {
        return this.Effects.some(t => t.EffectType === iEffect && t.ToWho === Enums.eToWho.Target);
    }

    I9FXPresentP(iEffect: Enums.eEffectType, iMez?: Enums.eMez): boolean {
        return this.Effects
            .filter(t => t.EffectType === iEffect && t.BuffedMag > 0 && !(t.EffectType === Enums.eEffectType.Damage && t.DamageType === Enums.eDamage.Special))
            .some(t => iMez === undefined || iMez === Enums.eMez.None || t.MezType === iMez);
    }

    IgnoreEnhancement(iEffect: Enums.eEnhance): boolean {
        return this.IgnoreEnh.includes(iEffect);
    }

    IgnoreBuff(iEffect: Enums.eEnhance): boolean {
        return this.Ignore_Buff.includes(iEffect);
    }

    SetMathMag(): void {
        for (const fx of this.Effects) {
            fx.Math_Duration = fx.Duration;
            fx.Math_Mag = fx.BuffedMag;
        }
    }

    GetEffectStringGrouped(idEffect: number, returnString: { value: string }, returnMask: { value: number[] }, shortForm: boolean, simple: boolean, noMag: boolean = false, fromPopup: boolean = false, ignoreConditions: boolean = false): boolean {
        if (idEffect < 0 || idEffect > this.Effects.length - 1) {
            return false;
        }

        let str = '';
        let array: number[] = [];
        const effect = this.Effects[idEffect].Clone() as IEffect;
        
        switch (effect.EffectType) {
            case Enums.eEffectType.DamageBuff:
            case Enums.eEffectType.Defense:
            case Enums.eEffectType.Resistance:
            case Enums.eEffectType.Elusivity: {
                const damageEnumValues = Object.keys(Enums.eDamage).filter(k => !isNaN(Number(k))).map(k => Number(k));
                const iDamage = new Array<boolean>(damageEnumValues.length).fill(false);
                
                for (let index1 = 0; index1 < this.Effects.length; index1++) {
                    for (let index2 = 0; index2 < iDamage.length; index2++) {
                        effect.DamageType = index2 as Enums.eDamage;
                        if (effect.CompareTo(this.Effects[index1]) !== 0) {
                            continue;
                        }

                        iDamage[index2] = true;
                        array.push(index1);
                    }
                }

                if (array.length <= 1) {
                    return false;
                }

                effect.DamageType = Enums.eDamage.Special;
                const newValue = effect.EffectType === Enums.eEffectType.Defense
                    ? Enums.GetGroupedDefense(iDamage, shortForm)
                    : Enums.GetGroupedDamage(iDamage, shortForm);
                str = shortForm
                    ? effect.BuildEffectStringShort(noMag, simple).replace(/Spec/g, newValue)
                    : effect.BuildEffectString(simple, '', false, false, false, fromPopup, false, true, ignoreConditions).replace(/Special/g, newValue);
                break;
            }
            case Enums.eEffectType.RechargePower: {
                for (let index1 = 0; index1 < this.Effects.length; index1++) {
                    if (this.Effects[index1].EffectType !== Enums.eEffectType.RechargePower) {
                        continue;
                    }

                    array.push(index1);
                }

                str = shortForm
                    ? effect.BuildEffectStringShort(noMag, simple).replace(/RechargePower/g, "RechargePower(Stalker's Build-Ups)")
                    : effect.BuildEffectString(simple, '', false, false, false, fromPopup, false, true, ignoreConditions).replace(/RechargePower/g, "RechargePower(Stalker's Build-Ups)");
                break;
            }
            case Enums.eEffectType.Mez:
            case Enums.eEffectType.MezResist: {
                const mezEnumValues = Object.keys(Enums.eMez).filter(k => !isNaN(Number(k))).map(k => Number(k));
                const iMez = new Array<boolean>(mezEnumValues.length).fill(false);
                
                for (let index1 = 0; index1 < this.Effects.length; index1++) {
                    for (let index2 = 0; index2 < iMez.length; index2++) {
                        effect.MezType = index2 as Enums.eMez;
                        if (effect.CompareTo(this.Effects[index1]) !== 0) {
                            continue;
                        }

                        iMez[index2] = true;
                        array.push(index1);
                    }
                }

                if (array.length <= 1) {
                    return false;
                }

                effect.MezType = Enums.eMez.None;
                let newValue = Enums.GetGroupedMez(iMez, shortForm);

                if (newValue === 'Knocked' && effect.BuffedMag < 0) {
                    newValue = 'Knockback Protection';
                }

                str = shortForm
                    ? effect.BuildEffectStringShort(noMag, simple).replace(/None/g, newValue)
                    : effect.BuildEffectString(simple, '', false, false, false, fromPopup, false, true, ignoreConditions).replace(/None/g, newValue);

                switch (effect.EffectType) {
                    case Enums.eEffectType.MezResist:
                        if (newValue === 'Mez') {
                            str = str.replace(/MezResist\(Mez\)/g, 'Status Resistance');
                        }
                        break;
                    case Enums.eEffectType.Mez:
                        if (newValue === 'Mez' && effect.BuffedMag < 0) {
                            str = str.replace(/Mez/g, 'Status Protection').replace(/-/g, '');
                        } else if (newValue !== 'Knockback Protection') {
                            str = str.replace(/\(Mag -/g, 'protection (Mag ');
                        }
                        break;
                }

                break;
            }
            case Enums.eEffectType.Enhancement: {
                let num = 0;
                if (this.Effects.length === 4) {
                    num += this.Effects.filter(t =>
                        t.EffectType === Enums.eEffectType.Enhancement &&
                        (t.ETModifies === Enums.eEffectType.SpeedRunning ||
                            t.ETModifies === Enums.eEffectType.SpeedFlying ||
                            t.ETModifies === Enums.eEffectType.SpeedJumping ||
                            t.ETModifies === Enums.eEffectType.JumpHeight)
                    ).length;

                    if (num === this.Effects.length) {
                        array = new Array(this.Effects.length).fill(0).map((_, i) => i);

                        effect.ETModifies = Enums.eEffectType.Slow;
                        str = shortForm
                            ? effect.BuildEffectStringShort(noMag, simple)
                            : effect.BuildEffectString(simple, '', false, false, false, fromPopup, false, true, ignoreConditions);
                        if (this.BuffMode !== Enums.eBuffMode.Debuff) {
                            str = str.replace(/Slow/g, 'Movement');
                        }
                    }
                }

                break;
            }
        }

        returnMask.value = [...array];
        returnString.value = str;
        
        return str !== '';
    }

    AbsorbEffects(source: IPower | null, nDuration: number, nDelay: number, archetype: Archetype | null, stacking: number, isGrantPower: boolean = false, fxid: number = -1, effectId: number = -1): number[] {
        const lst: number[] = [];
        let num2 = 0;
        
        if (source && source.PowerSetID > -1 && DatabaseAPI.Database.Powersets[source.PowerSetID]?.SetType === Enums.ePowerSetType.Pet) {
            const powerset = DatabaseAPI.Database.Powersets[source.PowerSetID];
            if (powerset) {
                for (const power of powerset.Powers) {
                    if (!power) continue;
                    for (const effect of power.Effects) {
                        if ((effect.EffectType === Enums.eEffectType.SilentKill) && (effect.ToWho === Enums.eToWho.Self) && (effect.DelayedTime > 0)) {
                            num2 = effect.DelayedTime;
                        }
                    }
                }
            }
        }

        if (num2 > 0 && (nDuration < 0.01 || nDuration > num2)) {
            nDuration = num2;
        }

        if (!source) return lst;

        if (effectId === -1) {
            const fxList = [...this.Effects];
            for (let index = 0; index < source.Effects.length; index++) {
                if (!isGrantPower && (source.EntitiesAffected === Enums.eEntity.Caster) && (source.Effects[index].EffectType !== Enums.eEffectType.EntCreate)) {
                    continue;
                }

                if (source.Effects[index].EffectType === Enums.eEffectType.EntCreate && source.Effects[index].nSummon > -1) {
                    lst.push(index);
                }

                const effect = source.Effects[index].Clone() as IEffect;
                effect.Absorbed_Effect = true;
                effect.Absorbed_PowerType = source.PowerType;
                effect.Absorbed_Class_nID = archetype?.Idx ?? -1;
                effect.Absorbed_EffectID = fxid;
                effect.Absorbed_Power_nID = source.PowerIndex;
                
                if (source.PowerType === Enums.ePowerType.Auto_ || source.PowerType === Enums.ePowerType.Toggle) {
                    effect.SetTicks(nDuration, source.ActivatePeriod);
                }

                if (((source.EntitiesAutoHit & Enums.eEntity.Friend) === Enums.eEntity.Friend) && ((source.EntitiesAutoHit & Enums.eEntity.Caster) !== Enums.eEntity.Caster)) {
                    effect.ToWho = Enums.eToWho.Target;
                    if (effect.Stacking === Enums.eStacking.Yes) {
                        effect.Scale *= stacking;
                    }
                }

                if (((source.EntitiesAutoHit & Enums.eEntity.MyPet) === Enums.eEntity.MyPet) && ((source.EntitiesAutoHit & Enums.eEntity.Caster) !== Enums.eEntity.Caster)) {
                    effect.ToWho = Enums.eToWho.Target;
                    if (effect.Stacking === Enums.eStacking.Yes) {
                        effect.Scale *= stacking;
                    }
                }

                effect.Absorbed_Duration = nDuration;
                if ((source.RechargeTime > 0) && (source.PowerType === Enums.ePowerType.Click)) {
                    effect.Absorbed_Interval = source.RechargeTime + source.CastTime;
                }

                if (nDelay > 0) {
                    effect.DelayedTime = nDelay;
                }

                if ((effect.Absorbed_Duration > 0) && (num2 > 0)) {
                    effect.nDuration = effect.Absorbed_Duration;
                }

                fxList.push(effect);
            }

            this.Effects = fxList;
        } else if (isGrantPower || source.EntitiesAffected !== Enums.eEntity.Caster || source.Effects[effectId].EffectType === Enums.eEffectType.EntCreate) {
            if (source.Effects[effectId].EffectType === Enums.eEffectType.EntCreate && source.Effects[effectId].nSummon > -1) {
                lst.push(effectId);
            }

            const fxList = [...this.Effects];
            const effect = source.Effects[effectId].Clone() as IEffect;
            effect.Absorbed_Effect = true;
            effect.Absorbed_PowerType = source.PowerType;
            effect.Absorbed_Class_nID = archetype?.Idx ?? -1;
            effect.Absorbed_EffectID = fxid;
            effect.Absorbed_Power_nID = source.PowerIndex;
            
            if (source.PowerType === Enums.ePowerType.Auto_ || source.PowerType === Enums.ePowerType.Toggle) {
                effect.SetTicks(nDuration, source.ActivatePeriod);
            }

            if ((source.EntitiesAutoHit & Enums.eEntity.Friend) === Enums.eEntity.Friend) {
                effect.ToWho = Enums.eToWho.Target;
                if (effect.Stacking === Enums.eStacking.Yes) {
                    effect.Scale *= stacking;
                }
            }

            if ((source.EntitiesAutoHit & Enums.eEntity.MyPet) === Enums.eEntity.MyPet) {
                effect.ToWho = Enums.eToWho.Target;
                if (effect.Stacking === Enums.eStacking.Yes) {
                    effect.Scale *= stacking;
                }
            }

            effect.Absorbed_Duration = nDuration;
            if ((source.RechargeTime > 0) && (source.PowerType === Enums.ePowerType.Click)) {
                effect.Absorbed_Interval = source.RechargeTime + source.CastTime;
            }

            if (nDelay > 0) {
                effect.DelayedTime = nDelay;
            }

            if ((effect.Absorbed_Duration > 0) && (num2 > 0)) {
                effect.nDuration = effect.Absorbed_Duration;
            }

            fxList.push(effect);
            this.Effects = fxList;
        }

        return lst;
    }

    ApplyGrantPowerEffects(): void {
        let flag = true;
        let num1 = 0;
        if (this.HasGrantPowerEffect) {
            while (flag && num1 < 100) {
                flag = false;
                const lFxIndex: number[] = [];
                const lFxSummons: number[] = [];
                
                for (let index = 0; index < this.Effects.length; index++) {
                    if (this.Effects[index].EffectType !== Enums.eEffectType.GrantPower ||
                        !this.Effects[index].CanGrantPower() ||
                        this.Effects[index].EffectClass === Enums.eEffectClass.Ignored ||
                        this.Effects[index].nSummon <= -1) {
                        continue;
                    }

                    lFxIndex.push(index);
                    lFxSummons.push(this.Effects[index].nSummon);
                }

                for (let index1 = 0; index1 < lFxIndex.length; index1++) {
                    flag = true;
                    this.Effects[lFxIndex[index1]].EffectClass = Enums.eEffectClass.Ignored;
                    
                    this.AbsorbEffects(
                        DatabaseAPI.Database.Power[lFxSummons[index1]],
                        this.Effects[lFxIndex[index1]].Duration,
                        0,
                        MidsContext.Archetype,
                        1,
                        true,
                        lFxIndex[index1]
                    );
                    
                    if (this.Effects.length > 0 && this.Effects[lFxIndex[index1]].Absorbed_Power_nID > -1) {
                        this.Effects[this.Effects.length - 1].Absorbed_PowerType = this.Effects[lFxIndex[index1]].Absorbed_PowerType;
                    }

                    if (this.Effects.length > 0 && this.Effects[this.Effects.length - 1].EffectType !== Enums.eEffectType.GrantPower) {
                        this.Effects[this.Effects.length - 1].ToWho = this.Effects[lFxIndex[index1]].ToWho;
                    }

                    if (this.Effects.length > 0) {
                        const lastEffect = this.Effects[this.Effects.length - 1];
                        if ((lastEffect.ToWho === Enums.eToWho.All && 
                            ((this.EntitiesAffected & Enums.eEntity.Caster) !== Enums.eEntity.Caster || 
                             (this.EntitiesAffected & Enums.eEntity.Friend) !== Enums.eEntity.Friend)) ||
                            (lastEffect.ToWho === Enums.eToWho.All &&
                                ((this.EntitiesAffected & Enums.eEntity.Caster) !== Enums.eEntity.Caster ||
                                 (this.EntitiesAffected & Enums.eEntity.Foe) !== Enums.eEntity.Foe))) {
                            lastEffect.ToWho = Enums.eToWho.Target;
                        }

                        lastEffect.isEnhancementEffect = this.Effects[lFxIndex[index1]].isEnhancementEffect;
                        if (this.Effects[lFxIndex[index1]].BaseProbability < 1) {
                            lastEffect.EffectiveProbability = lastEffect.Probability * this.Effects[lFxIndex[index1]].Probability;
                        }
                    }
                }
                num1++;
            }
        }

        this.ProcessExecutes();
    }

    GetValidEnhancements(iType: Enums.eType, iSubType: number = 0): number[] {
        if (iType === Enums.eType.SetO) {
            return this.GetValidEnhancementsFromSets();
        }
        
        const validEnhancements: number[] = [];
        for (let index = 0; index < DatabaseAPI.Database.Enhancements.length; index++) {
            const enhancement = DatabaseAPI.Database.Enhancements[index];
            if (enhancement.TypeID !== iType) {
                continue;
            }
            
            // Check if enhancement class matches any of this power's enhancement classes
            const hasMatchingClass = enhancement.ClassID.some(classId => 
                this.Enhancements.includes(DatabaseAPI.Database.EnhancementClasses[classId].ID)
            );
            
            if (!hasMatchingClass) {
                continue;
            }
            
            // Check subtype match
            if (enhancement.SubTypeID !== 0 && iSubType !== 0 && enhancement.SubTypeID !== iSubType) {
                continue;
            }
            
            validEnhancements.push(index);
        }
        
        return validEnhancements;
    }

    IsEnhancementValid(iEnh: number): boolean {
        if (iEnh < 0 || iEnh > DatabaseAPI.Database.Enhancements.length - 1) {
            return false;
        }

        const validEnhancements = this.GetValidEnhancements(DatabaseAPI.Database.Enhancements[iEnh].TypeID);
        return validEnhancements.includes(iEnh);
    }

    private GetValidEnhancementsFromSets(): number[] {
        const validEnhancements: number[] = [];
        for (const enhancementSet of DatabaseAPI.Database.EnhancementSets) {
            if (this.SetTypes.some(setType => enhancementSet.SetType === setType)) {
                validEnhancements.push(...enhancementSet.Enhancements);
            }
        }
        return validEnhancements;
    }

    AbsorbPetEffects(hIdx: number = -1, stackingOverride: number = -1): void {
        if (!this.AbsorbSummonAttributes && !this.AbsorbSummonEffects) {
            return;
        }
        
        const intList: number[] = [];
        for (let index = 0; index < this.Effects.length; index++) {
            if (this.Effects[index].EffectType === Enums.eEffectType.EntCreate &&
                this.Effects[index].nSummon > -1 &&
                Math.abs(this.Effects[index].Probability - 1) < 0.01 &&
                DatabaseAPI.Database.Entities.length > this.Effects[index].nSummon) {
                intList.push(index);
            }
        }

        if (intList.length > 0) {
            this.HasAbsorbedEffects = true;
        }

        for (const t of intList) {
            const effect = this.Effects[t];
            const nSummon1 = effect.nSummon;
            let stacking = 1;
            
            if (this.VariableEnabled && effect.VariableModified && hIdx > -1 && MidsContext.Character && MidsContext.Character.CurrentBuild?.Powers[hIdx].VariableValue && MidsContext.Character.CurrentBuild.Powers[hIdx].VariableValue > stacking) {
                stacking = MidsContext.Character.CurrentBuild.Powers[hIdx].VariableValue;
            }

            if (stackingOverride > 0) {
                stacking = stackingOverride;
            }

            const entity = DatabaseAPI.Database.Entities[nSummon1];
            const nPowerset = entity.GetNPowerset();
            if (nPowerset.length === 0) {
                continue;
            }

            if (this.AbsorbSummonAttributes && nPowerset[0] > -1 && nPowerset[0] < DatabaseAPI.Database.Powersets.length) {
                const powerset = DatabaseAPI.Database.Powersets[nPowerset[0]];
                if (powerset && powerset.Powers.length > 0) {
                    for (const power of powerset.Powers) {
                        if (!power) continue;
                        this.AttackTypes = power.AttackTypes;
                        this.EffectArea = power.EffectArea;
                        this.EntitiesAffected = power.EntitiesAffected;
                        if (this.EntitiesAutoHit !== Enums.eEntity.None) {
                            this.EntitiesAutoHit = power.EntitiesAutoHit;
                        }

                        this.Ignore_Buff = power.Ignore_Buff;
                        this.IgnoreEnh = power.IgnoreEnh;
                        this.MaxTargets = power.MaxTargets;
                        this.Radius = power.Radius;
                        this.Target = power.Target;
                        
                        const basePower = DatabaseAPI.Database.Power[this.PowerIndex];
                        if (basePower && (basePower.EntitiesAutoHit === Enums.eEntity.None || basePower.EntitiesAutoHit === Enums.eEntity.Caster)) {
                            continue;
                        }

                        this.Accuracy = power.Accuracy;
                        break;
                    }
                }
            }

            if (!this.AbsorbSummonEffects) {
                continue;
            }

            for (const setIndex of nPowerset) {
                if (setIndex < 0 || setIndex >= DatabaseAPI.Database.Powersets.length) {
                    continue;
                }

                const powerset = DatabaseAPI.Database.Powersets[setIndex];
                if (!powerset) continue;
                
                for (const power1 of powerset.Powers) {
                    if (!power1) continue;
                    const absorbEffects = this.AbsorbEffects(
                        power1,
                        effect.Duration,
                        effect.DelayedTime,
                        DatabaseAPI.Database.Classes[entity.GetNClassId()],
                        stacking
                    );
                    
                    for (const absorbEffect of absorbEffects) {
                        const nSummon2 = power1.Effects[absorbEffect].nSummon;
                        const entity2 = DatabaseAPI.Database.Entities[nSummon2];
                        const nPowerset2 = entity2.GetNPowerset();
                        if (nPowerset2[0] < 0) {
                            continue;
                        }

                        const powerset2 = DatabaseAPI.Database.Powersets[nPowerset2[0]];
                        if (!powerset2) continue;
                        
                        for (const power2 of powerset2.Powers) {
                            if (!power2) continue;
                            this.AbsorbEffects(
                                power2,
                                effect.Duration,
                                effect.DelayedTime,
                                DatabaseAPI.Database.Classes[entity.GetNClassId()],
                                stacking
                            );
                        }
                    }
                }
            }

            this.AbsorbedPetEffects = true;
        }
    }

    AllowedForClass(classId: number): boolean {
        if (this.Requires.NClassName.length === 0 && this.Requires.NClassNameNot.length === 0) {
            return true;
        }
        if (this.Requires.NClassName.length > 0) {
            return this.Requires.NClassName.includes(classId);
        }
        if (this.Requires.NClassNameNot.length > 0) {
            return !this.Requires.NClassNameNot.includes(classId);
        }
        return true;
    }

    ProcessExecutes(): void {
        this.ProcessExecutesInner(this);
        for (const fx of this.Effects) {
            fx.SetPower(this);
        }
        this.AppliedExecutes = true;
    }

    ProcessExecutesInner(power: IPower | null = null, rLevel: number = 0): IEffect[] | null {
        // Max recursion level
        if (rLevel > 5) {
            return [];
        }

        power = power || this;
        const pEffects: IEffect[] = [];
        let k = 0;

        for (const fx of power.Effects) {
            if (fx.EffectType !== Enums.eEffectType.ExecutePower) {
                pEffects.push(fx.Clone() as IEffect);
                k++;
                continue;
            }

            if (!fx.Summon || fx.Summon.trim() === '') {
                continue;
            }

            const fxPower = DatabaseAPI.GetPowerByFullName(fx.Summon);
            if (fxPower === null) {
                continue;
            }

            const subEffects = this.ProcessExecutesInner(fxPower, rLevel + 1);
            if (subEffects === null) {
                continue;
            }

            for (const t of subEffects) {
                pEffects.push(t.Clone() as IEffect);
            }

            for (let j = k; j < k + subEffects.length; j++) {
                const sFx = pEffects[j];
                
                // Cap effect duration to root power
                // Clone duration if caller has one > 0
                sFx.nDuration = fx.nDuration > 0
                    ? fx.nDuration
                    : sFx.nDuration;
                sFx.DelayedTime += fx.DelayedTime;
                sFx.Probability = (fx.Probability === 0 || fx.Probability === 1)
                    ? sFx.Probability
                    : Math.min(sFx.Probability, fx.Probability);
                sFx.ProcsPerMinute = fx.ProcsPerMinute;
                if (fx.ActiveConditionals && fx.ActiveConditionals.length > 0) {
                    if (!sFx.ActiveConditionals) {
                        sFx.ActiveConditionals = [];
                    }
                    sFx.ActiveConditionals.push(...fx.ActiveConditionals);
                }

                if (fx.Ticks > 0 && sFx.Ticks === 0) {
                    sFx.Ticks = fx.Ticks;
                }

                sFx.SetPower(this);
            }

            k += subEffects.length;
        }

        if (rLevel > 0) {
            return pEffects;
        }

        this.Effects = pEffects;
        return null;
    }

    private GetEffectsInSummons(): Map<number, string> {
        const effectsInSummons = new Map<number, string>();
        
        const powerSummonsEffects = this.Effects
            .map((e, i) => ({ index: i, effect: e }))
            .filter(({ effect }) =>
                this.AbsorbSummonEffects &&
                this.AbsorbSummonAttributes &&
                effect.EffectType === Enums.eEffectType.EntCreate &&
                effect.nSummon > -1 &&
                effect.nSummon < DatabaseAPI.Database.Entities.length
            )
            .filter(({ effect }) => {
                const entity = DatabaseAPI.Database.Entities[effect.nSummon];
                return entity.GetNPowerset().length > 0;
            });

        let k = 0;
        for (const { index: baseIndex, effect } of powerSummonsEffects) {
            const entity = DatabaseAPI.Database.Entities[effect.nSummon];
            const nPowerset = entity.GetNPowerset();
            if (nPowerset.length === 0) continue;
            
            const powerset = DatabaseAPI.Database.Powersets[nPowerset[0]];
            if (!powerset) continue;
            
            for (const power of powerset.Powers) {
                if (!power) continue;
                for (let i = 0; i < power.Effects.length; i++) {
                    const pIndex = baseIndex + 1 + i + k;
                    if (!effectsInSummons.has(pIndex)) {
                        effectsInSummons.set(pIndex, power.FullName);
                    }
                }
                k += power.Effects.length;
            }
        }

        return effectsInSummons;
    }

    BuildTooltipStringAllVectorsEffects(effectType: Enums.eEffectType, etModifies: Enums.eEffectType, damageType: Enums.eDamage, mezType: Enums.eMez, groupName: string = '', includeEnhEffects: boolean = false): string {
        if (!groupName) {
            groupName = `${effectType} (All)`;
        }

        const baseEffectType = (effectType === Enums.eEffectType.Enhancement ? etModifies : effectType);
        let damageVectors: Enums.eDamage[];
        
        if (baseEffectType === Enums.eEffectType.Resistance || baseEffectType === Enums.eEffectType.DamageBuff) {
            damageVectors = [
                Enums.eDamage.Smashing,
                Enums.eDamage.Lethal,
                Enums.eDamage.Fire,
                Enums.eDamage.Cold,
                Enums.eDamage.Energy,
                Enums.eDamage.Negative,
                Enums.eDamage.Toxic,
                Enums.eDamage.Psionic
            ];
        } else if (baseEffectType === Enums.eEffectType.Defense && !DatabaseAPI.RealmUsesToxicDef()) {
            damageVectors = [
                Enums.eDamage.Smashing,
                Enums.eDamage.Lethal,
                Enums.eDamage.Fire,
                Enums.eDamage.Cold,
                Enums.eDamage.Energy,
                Enums.eDamage.Negative,
                Enums.eDamage.Psionic,
                Enums.eDamage.Melee,
                Enums.eDamage.Ranged,
                Enums.eDamage.AoE
            ];
        } else {
            damageVectors = [
                Enums.eDamage.Smashing,
                Enums.eDamage.Lethal,
                Enums.eDamage.Fire,
                Enums.eDamage.Cold,
                Enums.eDamage.Energy,
                Enums.eDamage.Negative,
                Enums.eDamage.Toxic,
                Enums.eDamage.Psionic,
                Enums.eDamage.Melee,
                Enums.eDamage.Ranged,
                Enums.eDamage.AoE
            ];
        }

        let effectsList = '';
        const pvModes = [Enums.ePvX.Any];

        for (const pvMode of pvModes) {
            const effectIdentifiers2 = this.Effects
                .filter(e =>
                    e.EffectType === effectType &&
                    e.ETModifies === etModifies &&
                    e.MezType === mezType &&
                    e.DamageType === damageType &&
                    e.PvMode === pvMode &&
                    (includeEnhEffects || !e.isEnhancementEffect)
                )
                .map(e => e.GenerateIdentifier());

            const effectIdentifiers: typeof effectIdentifiers2 = [];
            for (const fxId2 of effectIdentifiers2) {
                if (effectIdentifiers.some(e => e.Compare(fxId2))) {
                    continue;
                }
                effectIdentifiers.push(fxId2);
            }

            const pvxEffects: string[] = [];
            for (const effectId of effectIdentifiers) {
                const effectsVectors = this.Effects
                    .filter(e => (includeEnhEffects || !e.isEnhancementEffect) && e.GenerateIdentifier().Compare(effectId))
                    .map(e => e.DamageType)
                    .filter((v, i, a) => a.indexOf(v) === i);

                let effectsInMode = '';
                const allVectorsPresent = damageVectors.every(v => effectsVectors.includes(v));
                
                if (allVectorsPresent) {
                    const effectsInModeBase = this.Effects
                        .map((e, i) => ({ index: i, effect: e }))
                        .find(({ effect }) => (includeEnhEffects || !effect.isEnhancementEffect) && effect.GenerateIdentifier().Compare(effectId));
                    
                    if (effectsInModeBase) {
                        effectsInMode = effectsInModeBase.effect.BuildEffectString(false, groupName, false, false, false, true) + this.GetDifferentAttributesSubPower(effectsInModeBase.index);
                    }
                } else {
                    const excludedVectors = damageVectors.filter(v => !effectsVectors.includes(v));
                    const vectors = (damageVectors.length - effectsVectors.length <= 3)
                        ? `All but ${excludedVectors.map(v => Enums.GetDamageName(v)).join(', ')}`
                        : effectsVectors.map(v => Enums.GetDamageName(v)).join(', ');

                    const fxLabel = effectType === Enums.eEffectType.Enhancement || effectType === Enums.eEffectType.ResEffect
                        ? `${effectType}(${etModifies})`
                        : effectType === Enums.eEffectType.Mez || effectType === Enums.eEffectType.MezResist
                            ? `${effectType}(${mezType})`
                            : `${effectType} (${vectors})`;

                    const effectsInModeBase = this.Effects
                        .map((e, i) => ({ index: i, effect: e }))
                        .find(({ effect }) => (includeEnhEffects || !effect.isEnhancementEffect) && effect.GenerateIdentifier().Compare(effectId));
                    
                    if (effectsInModeBase) {
                        effectsInMode = effectsInModeBase.effect.BuildEffectString(false, fxLabel, false, false, false, true) + this.GetDifferentAttributesSubPower(effectsInModeBase.index);
                    }
                }

                effectsInMode = effectsInMode.trim().replace(/\n\n/g, '\n');
                if (!effectsInMode) {
                    continue;
                }

                pvxEffects.push(effectsInMode);
            }

            if (pvxEffects.length > 0) {
                effectsList += (effectsList ? '\n---------------------\n' : '') + pvxEffects.join('\n');
            }
        }

        return effectsList;
    }

    GetDifferentAttributesSubPower(fxIndex: number): string {
        if (fxIndex <= -1) {
            return '';
        }

        const effectsInSummons = this.GetEffectsInSummons();
        if (!effectsInSummons.has(fxIndex)) {
            return '';
        }

        const subPowerName = effectsInSummons.get(fxIndex)!;
        const subPower = DatabaseAPI.GetPowerByFullName(subPowerName);
        if (!subPower) {
            return '';
        }

        const extraAttribs: string[] = [];
        if (Math.abs(subPower.Range - this.Range) > Number.EPSILON && subPower.Range > Number.EPSILON) {
            extraAttribs.push(`Range: ${Utilities.FixDP(subPower.Range)}ft`);
        }

        if (Math.abs(subPower.RangeSecondary - this.RangeSecondary) > Number.EPSILON && subPower.RangeSecondary > Number.EPSILON) {
            extraAttribs.push(`Secondary Range: ${Utilities.FixDP(subPower.RangeSecondary)}ft`);
        }

        if (Math.abs(subPower.Radius - this.Radius) > Number.EPSILON && subPower.Radius > Number.EPSILON) {
            extraAttribs.push(`Radius: ${Utilities.FixDP(subPower.Radius)}ft`);
        }

        if (subPower.Arc !== this.Arc && subPower.Arc > Number.EPSILON) {
            extraAttribs.push(`Arc: ${Utilities.FixDP(subPower.Arc)}deg`);
        }

        if (subPower.MaxTargets !== this.MaxTargets && subPower.MaxTargets > 0) {
            extraAttribs.push(`Max Targets: ${subPower.MaxTargets}`);
        }

        return extraAttribs.length <= 0 ? '' : `, ${extraAttribs.join(', ')}`;
    }

    ApplyModifyEffects(): void {
        for (const fx of this.Effects) {
            fx.UpdateAttrib();
        }
    }

    ExportToJson(): string {
        return JSON.stringify(this, null, 2);
    }

    // IPower interface methods from IEffect
    GetEffect(index: number): IEffect {
        if (index >= 0 && index < this.Effects.length) {
            return this.Effects[index];
        }
        throw new Error('Effect index out of range');
    }

    GetEffectById(id: number): IEffect | null {
        return this.Effects.find(e => e.nID === id) || null;
    }

    GetEffectByUID(uid: string): IEffect | null {
        return this.Effects.find(e => e.UniqueID.toString() === uid) || null;
    }

    GetEffectByClass(effectClass: Enums.eEffectClass): IEffect | null {
        return this.Effects.find(e => e.EffectClass === effectClass) || null;
    }

    GetEffectByType(effectType: Enums.eEffectType): IEffect | null {
        return this.Effects.find(e => e.EffectType === effectType) || null;
    }

    GetEffectByDamageType(damageType: Enums.eDamage): IEffect | null {
        return this.Effects.find(e => e.DamageType === damageType) || null;
    }

    GetEffectByMezType(mezType: Enums.eMez): IEffect | null {
        return this.Effects.find(e => e.MezType === mezType) || null;
    }

    GetArchetype(): Archetype | null {
        return MidsContext.Archetype;
    }

    GetSummonedEntity(): SummonedEntity | null {
        const entities = this.GetEntities();
        return entities && entities.length > 0 ? entities[0] : null;
    }
}

