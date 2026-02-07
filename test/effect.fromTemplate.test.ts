import { describe, it, expect } from "vitest";
import { Effect } from "../src/core/Base/Data_Classes/Effect";
import { IEffect } from "../src/core/IEffect";
import { IPower } from "../src/core/IPower";
import { IEnhancement } from "../src/core/IEnhancement";
import { Expressions } from "../src/core/Expressions";
import * as Enums from "../src/core/Enums";

/**
 * Creates a mock IEffect template with non-default values for all fields
 * that Effect.fromTemplate() copies.
 */
function createMockTemplate(): IEffect {
  const mockPower = { PowerIndex: 42, DisplayName: "TestPower" } as IPower;
  const mockEnhancement = { nIDSet: 99, Name: "TestEnhancement" } as IEnhancement;
  const mockExpressions = new Expressions();
  mockExpressions.Duration = "test_duration_expr";
  mockExpressions.Magnitude = "test_magnitude_expr";
  mockExpressions.Probability = "test_probability_expr";

  return {
    // Fields copied by fromTemplate
    PowerFullName: "TestPowerFullName",
    GetPower: () => mockPower,
    SetPower: () => {},
    Enhancement: mockEnhancement,
    UniqueID: 12345,
    EffectClass: Enums.eEffectClass.Tertiary,
    EffectType: Enums.eEffectType.Damage,
    DisplayPercentageOverride: Enums.eOverrideBoolean.TrueOverride,
    DamageType: Enums.eDamage.Fire,
    MezType: Enums.eMez.Stun,
    ETModifies: Enums.eEffectType.Defense,
    Summon: "TestSummon",
    Ticks: 5,
    DelayedTime: 2.5,
    Stacking: Enums.eStacking.Yes,
    BaseProbability: 0.75,
    Suppression: Enums.eSuppress.Held,
    Buffable: false,
    Resistible: false,
    SpecialCase: Enums.eSpecialCase.Defiance,
    VariableModifiedOverride: true,
    IgnoreScaling: true,
    isEnhancementEffect: true,
    PvMode: Enums.ePvX.PvP,
    ToWho: Enums.eToWho.Target,
    Scale: 1.5,
    nMagnitude: 10.5,
    nDuration: 30.0,
    AttribType: Enums.eAttribType.Duration,
    Aspect: Enums.eAspect.Abs,
    ModifierTable: "TestModifierTable",
    nModifierTable: 42,
    NearGround: true,
    CancelOnMiss: true,
    ProcsPerMinute: 3.5,
    Absorbed_Duration: 15.0,
    Absorbed_Effect: true,
    Absorbed_PowerType: Enums.ePowerType.Click,
    Absorbed_Class_nID: 7,
    Absorbed_Power_nID: 42,
    Absorbed_Interval: 2.0,
    Absorbed_EffectID: 999,
    buffMode: Enums.eBuffMode.Debuff,
    Math_Duration: 25.0,
    Math_Mag: 12.5,
    RequiresToHitCheck: true,
    UIDClassName: "TestClassName",
    nIDClassName: 88,
    Expressions: mockExpressions,
    Reward: "TestReward",
    EffectId: "TestEffectId",
    MagnitudeExpression: "TestMagnitudeExpression",
    Special: "TestSpecial",

    // Additional IEffect properties (not copied by fromTemplate but required by interface)
    Rand: 0.5,
    Probability: 0.9,
    Mag: 100,
    BuffedMag: 120,
    MagPercent: 50,
    Duration: 60,
    DisplayPercentage: true,
    VariableModified: true,
    InherentSpecial: false,
    InherentSpecial2: false,
    IgnoreED: false,
    nID: 1,
    PowerAttribs: Enums.ePowerAttribs.None,
    nSummon: 0,
    Override: "",
    nOverride: 0,
    AtrOrigAccuracy: 0,
    AtrOrigActivatePeriod: 0,
    AtrOrigArc: 0,
    AtrOrigCastTime: 0,
    AtrOrigEffectArea: Enums.eEffectArea.None,
    AtrOrigEnduranceCost: 0,
    AtrOrigInterruptTime: 0,
    AtrOrigMaxTargets: 0,
    AtrOrigRadius: 0,
    AtrOrigRange: 0,
    AtrOrigRechargeTime: 0,
    AtrOrigSecondaryRange: 0,
    AtrModAccuracy: 0,
    AtrModActivatePeriod: 0,
    AtrModArc: 0,
    AtrModCastTime: 0,
    AtrModEffectArea: Enums.eEffectArea.None,
    AtrModEnduranceCost: 0,
    AtrModInterruptTime: 0,
    AtrModMaxTargets: 0,
    AtrModRadius: 0,
    AtrModRange: 0,
    AtrModRechargeTime: 0,
    AtrModSecondaryRange: 0,
    ActiveConditionals: [],
    Validated: true,
    EffectiveProbability: 0.8,

    // Methods required by interface
    isDamage: () => true,
    UpdateAttrib: () => {},
    ValidateConditional: () => true,
    BuildEffectStringShort: () => "",
    BuildEffectString: () => "",
    StoreTo: () => {},
    SetTicks: () => 0,
    CanInclude: () => true,
    CanGrantPower: () => false,
    PvXInclude: () => true,
    SummonedEntityName: "",
    GenerateIdentifier: () => ({ Mag: 0, EffectType: 0, ETModifies: 0, ToWho: 0, PvMode: 0, Suppression: 0, Conditionals: [], IgnoreScaling: false, IgnoreED: false, Buffable: false, Probability: 0, Duration: 0, Ticks: 0, SpecialCase: 0, Stacking: 0, RequiresToHitCheck: false, CancelOnMiss: false, Resistible: false, DelayedTime: 0, PPM: 0, Compare: () => false }),
    AffectsPetsOnly: () => false,
    GetDamage: () => ({ Type: Enums.eDamage.None, Value: 0 }),
    Clone: () => ({} as IEffect),
    CompareTo: () => 0,
  } as IEffect;
}

describe("Effect.fromTemplate", () => {
  it("copies all fields from template to new Effect", () => {
    const template = createMockTemplate();
    const effect = Effect.fromTemplate(template);

    // Verify all 49 fields that fromTemplate copies

    // Basic identity fields
    expect(effect.PowerFullName).toBe("TestPowerFullName");
    expect(effect.GetPower()).toEqual({ PowerIndex: 42, DisplayName: "TestPower" });
    expect(effect.Enhancement).toEqual({ nIDSet: 99, Name: "TestEnhancement" });
    expect(effect.UniqueID).toBe(12345);

    // Effect classification
    expect(effect.EffectClass).toBe(Enums.eEffectClass.Tertiary);
    expect(effect.EffectType).toBe(Enums.eEffectType.Damage);
    expect(effect.DisplayPercentageOverride).toBe(Enums.eOverrideBoolean.TrueOverride);
    expect(effect.DamageType).toBe(Enums.eDamage.Fire);
    expect(effect.MezType).toBe(Enums.eMez.Stun);
    expect(effect.ETModifies).toBe(Enums.eEffectType.Defense);

    // Summon and timing
    expect(effect.Summon).toBe("TestSummon");
    expect(effect.Ticks).toBe(5);
    expect(effect.DelayedTime).toBe(2.5);

    // Stacking and probability
    expect(effect.Stacking).toBe(Enums.eStacking.Yes);
    expect(effect.BaseProbability).toBe(0.75);
    expect(effect.Suppression).toBe(Enums.eSuppress.Held);

    // Boolean flags
    expect(effect.Buffable).toBe(false);
    expect(effect.Resistible).toBe(false);
    expect(effect.VariableModifiedOverride).toBe(true);
    expect(effect.IgnoreScaling).toBe(true);
    expect(effect.isEnhancementEffect).toBe(true);
    expect(effect.NearGround).toBe(true);
    expect(effect.CancelOnMiss).toBe(true);
    expect(effect.RequiresToHitCheck).toBe(true);

    // Special case and targeting
    expect(effect.SpecialCase).toBe(Enums.eSpecialCase.Defiance);
    expect(effect.PvMode).toBe(Enums.ePvX.PvP);
    expect(effect.ToWho).toBe(Enums.eToWho.Target);

    // Magnitude and scaling
    expect(effect.Scale).toBe(1.5);
    expect(effect.nMagnitude).toBe(10.5);
    expect(effect.nDuration).toBe(30.0);
    expect(effect.AttribType).toBe(Enums.eAttribType.Duration);
    expect(effect.Aspect).toBe(Enums.eAspect.Abs);

    // Modifier table
    expect(effect.ModifierTable).toBe("TestModifierTable");
    expect(effect.nModifierTable).toBe(42);

    // Procs per minute
    expect(effect.ProcsPerMinute).toBe(3.5);

    // Absorbed effect fields
    expect(effect.Absorbed_Duration).toBe(15.0);
    expect(effect.Absorbed_Effect).toBe(true);
    expect(effect.Absorbed_PowerType).toBe(Enums.ePowerType.Click);
    expect(effect.Absorbed_Class_nID).toBe(7);
    expect(effect.Absorbed_Power_nID).toBe(42);
    expect(effect.Absorbed_Interval).toBe(2.0);
    expect(effect.Absorbed_EffectID).toBe(999);

    // Buff mode
    expect(effect.buffMode).toBe(Enums.eBuffMode.Debuff);

    // Math fields
    expect(effect.Math_Duration).toBe(25.0);
    expect(effect.Math_Mag).toBe(12.5);

    // Class name identifiers
    expect(effect.UIDClassName).toBe("TestClassName");
    expect(effect.nIDClassName).toBe(88);

    // Expressions
    expect(effect.Expressions.Duration).toBe("test_duration_expr");
    expect(effect.Expressions.Magnitude).toBe("test_magnitude_expr");
    expect(effect.Expressions.Probability).toBe("test_probability_expr");

    // Reward and effect ID
    expect(effect.Reward).toBe("TestReward");
    expect(effect.EffectId).toBe("TestEffectId");

    // MagnitudeExpression and Special
    expect(effect.MagnitudeExpression).toBe("TestMagnitudeExpression");
    expect(effect.Special).toBe("TestSpecial");
  });

  it("creates a new Effect instance (not the same reference)", () => {
    const template = createMockTemplate();
    const effect = Effect.fromTemplate(template);

    expect(effect).toBeInstanceOf(Effect);
    expect(effect).not.toBe(template);
  });

  it("handles null Enhancement", () => {
    const template = createMockTemplate();
    (template as any).Enhancement = null;

    const effect = Effect.fromTemplate(template);

    expect(effect.Enhancement).toBeNull();
  });

  it("handles null power from GetPower()", () => {
    const template = createMockTemplate();
    (template as any).GetPower = () => null;

    const effect = Effect.fromTemplate(template);

    expect(effect.GetPower()).toBeNull();
  });

  it("handles default/zero numeric values", () => {
    const template = createMockTemplate();
    (template as any).Ticks = 0;
    (template as any).DelayedTime = 0;
    (template as any).Scale = 0;
    (template as any).nMagnitude = 0;
    (template as any).nDuration = 0;
    (template as any).BaseProbability = 0;
    (template as any).ProcsPerMinute = 0;

    const effect = Effect.fromTemplate(template);

    expect(effect.Ticks).toBe(0);
    expect(effect.DelayedTime).toBe(0);
    expect(effect.Scale).toBe(0);
    expect(effect.nMagnitude).toBe(0);
    expect(effect.nDuration).toBe(0);
    expect(effect.BaseProbability).toBe(0);
    expect(effect.ProcsPerMinute).toBe(0);
  });

  it("handles empty string values", () => {
    const template = createMockTemplate();
    (template as any).PowerFullName = "";
    (template as any).Summon = "";
    (template as any).ModifierTable = "";
    (template as any).UIDClassName = "";
    (template as any).Reward = "";
    (template as any).EffectId = "";

    const effect = Effect.fromTemplate(template);

    expect(effect.PowerFullName).toBe("");
    expect(effect.Summon).toBe("");
    expect(effect.ModifierTable).toBe("");
    expect(effect.UIDClassName).toBe("");
    expect(effect.Reward).toBe("");
    expect(effect.EffectId).toBe("");
  });
});
