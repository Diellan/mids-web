// Converted from C# Enums.cs
// This file contains all enum definitions, structs, and utility functions


// ============================================================================
// ENUMS
// ============================================================================

export enum Alignment {
  Hero,
  Rogue,
  Vigilante,
  Villain,
  Loyalist,
  Resistance
}

export enum dmItem {
  None,
  Power,
  Slot
}

export enum dmModes {
  None,
  LevelUp,
  Normal,
  Respec
}

export enum eAspect {
  Res,
  Max,
  Abs,
  Str,
  Cur
}

export enum eAttribType {
  Magnitude,
  Duration,
  Expression
}

export enum eBuffDebuff {
  Any,
  BuffOnly,
  DeBuffOnly
}

export enum eBuffMode {
  Normal,
  Buff,
  Debuff
}

export enum eCastFlags {
  None = 0,
  NearGround = 1,
  TargetNearGround = 2,
  CastableAfterDeath = 4
}

export enum eClassType {
  None,
  Hero,
  HeroEpic,
  Villain,
  VillainEpic,
  Henchman,
  Pet
}

export enum eInherentOrder {
  Class,
  Inherent,
  Powerset,
  Power,
  Prestige,
  Incarnate,
  Accolade,
  Pet,
  Temp
}

export enum eAlphaOrder {
  Boost,
  Core_Boost,
  Radial_Boost,
  Total_Core_Revamp,
  Partial_Core_Revamp,
  Total_Radial_Revamp,
  Partial_Radial_Revamp,
  Core_Paragon,
  Radial_Paragon
}

export enum eJudgementOrder {
  Judgement,
  Core_Judgement,
  Radial_Judgement,
  Total_Core_Judgement,
  Partial_Core_Judgement,
  Total_Radial_Judgement,
  Partial_Radial_Judgement,
  Core_Final_Judgement,
  Radial_Final_Judgement
}

export enum eInterfaceOrder {
  Interface,
  Core_Interface,
  Radial_Interface,
  Total_Core_Conversion,
  Partial_Core_Conversion,
  Total_Radial_Conversion,
  Partial_Radial_Conversion,
  Core_Flawless_Interface,
  Radial_Flawless_Interface
}

export enum eLoreOrder {
  Ally,
  Core_Ally,
  Radial_Ally,
  Total_Core_Improved_Ally,
  Partial_Core_Improved_Ally,
  Total_Radial_Improved_Ally,
  Partial_Radial_Improved_Ally,
  Core_Superior_Ally,
  Radial_Superior_Ally
}

export enum eDestinyOrder {
  Invocation,
  Core_Invocation,
  Radial_Invocation,
  Total_Core_Invocation,
  Partial_Core_Invocation,
  Total_Radial_Invocation,
  Partial_Radial_Invocation,
  Core_Epiphany,
  Radial_Epiphany
}

export enum eHybridOrder {
  Genome,
  Core_Genome,
  Radial_Genome,
  Total_Core_Graft,
  Partial_Core_Graft,
  Total_Radial_Graft,
  Partial_Radial_Graft,
  Core_Embodiment,
  Radial_Embodiment
}

export enum eGenesisOrder {
  Genesis,
  Core_Genesis,
  Radial_Genesis,
  Total_Core_Genesis,
  Partial_Core_Genesis,
  Total_Radial_Genesis,
  Partial_Radial_Genesis,
  Core_Flawless_Genesis,
  Radial_Flawless_Genesis
}

export enum eCSVImport_Damage {
  None,
  Smashing,
  Lethal,
  Fire,
  Cold,
  Energy,
  Negative_Energy,
  Toxic,
  Psionic,
  Special,
  Melee,
  Ranged,
  AoE,
  Unique1,
  Unique2,
  Unique3
}

export enum eCSVImport_Damage_Def {
  None,
  Smashing_Attack,
  Lethal_Attack,
  Fire_Attack,
  Cold_Attack,
  Energy_Attack,
  Negative_Energy_Attack,
  Toxic_Attack,
  Psionic_Attack,
  Special,
  Melee_Attack,
  Ranged_Attack,
  AoE_Attack
}

export enum eCSVImport_Damage_Elusivity {
  None,
  Smashing_Elude,
  Lethal_Elude,
  Fire_Elude,
  Cold_Elude,
  Energy_Elude,
  Negative_Elude,
  Toxic_Elude,
  Psionic_Elude,
  Special_Elude,
  Melee_Elude,
  Ranged_Elude,
  AoE_Elude
}

export enum eDefense {
  None,
  All,
  Smashing,
  Lethal,
  Fire,
  Cold,
  Energy,
  Negative,
  Psionic,
  Melee,
  Ranged,
  AoE
}

export enum eResistance {
  None,
  All,
  Smashing,
  Lethal,
  Fire,
  Cold,
  Energy,
  Negative,
  Toxic,
  Psionic
}

export enum eMezResist {
  None,
  All,
  Confused,
  Held,
  Immobilized,
  Knockback,
  Knockup,
  Placate,
  Repel,
  Sleep,
  Stunned,
  Taunt,
  Terrorized,
  Teleport
}

export enum eDamage {
  None,
  Smashing,
  Lethal,
  Fire,
  Cold,
  Energy,
  Negative,
  Toxic,
  Psionic,
  Special,
  Melee,
  Ranged,
  AoE,
  Unique1,
  Unique2,
  Unique3
}

export enum eDamageShort {
  None,
  Smash,
  Lethal,
  Fire,
  Cold,
  Energy,
  Neg,
  Toxic,
  Psi,
  Spec,
  Melee,
  Rngd,
  AoE
}

export enum eDDAlign {
  Left,
  Center,
  Right
}

export enum eDDGraph {
  Simple,
  Enhanced,
  Both,
  Stacked
}

export enum eDDStyle {
  Text,
  Graph,
  TextOnGraph,
  TextUnderGraph
}

export enum eDDText {
  ActualValues,
  OnlyBase,
  OnlyEnhanced,
  pcOfBase,
  pcMaxBase,
  pcMaxEnh,
  DPS
}

export enum eEffectArea {
  None,
  Character,
  Sphere,
  Cone,
  Location,
  Volume,
  Map,
  Room,
  Touch
}

export enum eEffectClass {
  Primary,
  Secondary,
  Tertiary,
  Special,
  Ignored,
  DisplayOnly
}

export enum eEffectType {
  None,
  Accuracy,
  ViewAttrib,
  Damage,
  DamageBuff,
  Defense,
  DropToggles,
  Endurance,
  EnduranceDiscount,
  Enhancement,
  Fly,
  SpeedFlying,
  GrantPower,
  Heal,
  HitPoints,
  InterruptTime,
  JumpHeight,
  SpeedJumping,
  Meter,
  Mez,
  MezResist,
  MovementControl,
  MovementFriction,
  PerceptionRadius,
  Range,
  RechargeTime,
  Recovery,
  Regeneration,
  ResEffect,
  Resistance,
  RevokePower,
  Reward,
  SpeedRunning,
  SetCostume,
  SetMode,
  Slow,
  StealthRadius,
  StealthRadiusPlayer,
  EntCreate,
  ThreatLevel,
  ToHit,
  Translucency,
  XPDebtProtection,
  SilentKill,
  Elusivity,
  GlobalChanceMod,
  LevelShift,
  UnsetMode,
  Rage,
  MaxRunSpeed,
  MaxJumpSpeed,
  MaxFlySpeed,
  DesignerStatus,
  PowerRedirect,
  TokenAdd,
  ExperienceGain,
  InfluenceGain,
  PrestigeGain,
  AddBehavior,
  RechargePower,
  RewardSourceTeam,
  VisionPhase,
  CombatPhase,
  ClearFog,
  SetSZEValue,
  ExclusiveVisionPhase,
  Absorb,
  XAfraid,
  XAvoid,
  BeastRun,
  ClearDamagers,
  EntCreate_x,
  Glide,
  Hoverboard,
  Jumppack,
  MagicCarpet,
  NinjaRun,
  Null,
  NullBool,
  Stealth,
  SteamJump,
  Walk,
  XPDebt,
  ForceMove,
  ModifyAttrib,
  ExecutePower
}

export enum eEffectTypeShort {
  None,
  Acc,
  Anlyz,
  Dmg,
  DamBuff,
  Def,
  ToglDrop,
  Endrnce,
  EndRdx,
  Enhance,
  Fly,
  FlySpd,
  Grant,
  Heal,
  HP,
  ActRdx,
  Jump,
  JumpSpd,
  Meter,
  Mez,
  MezRes,
  MveCtrl,
  MveFrctn,
  Pceptn,
  Rng,
  Rechg,
  EndRec,
  Regen,
  ResEffect,
  Res,
  Revke,
  Reward,
  RunSpd,
  Costume,
  Smode,
  Slow,
  StealthR,
  StealthP,
  Summon,
  ThreatLvl,
  ToHit,
  Tnslncy,
  DebtProt,
  Expire,
  Elsvty,
  GlobalChance,
  LvlShift,
  ClrMode,
  Fury,
  MaxRunSpd,
  MaxJumpSpd,
  MaxFlySpd,
  DeStatus,
  Redirect,
  TokenAdd,
  RDebuff1,
  RDebuff2,
  RDebuff3,
  AddBehav,
  RechPower,
  LostCure,
  VisionPhase,
  CombatPhase,
  ClearFog,
  SetSZEValue,
  ExVisionPhase,
  Absorb,
  Afraid,
  Avoid,
  BeastRun,
  ClearDamagers,
  EntCreate,
  Glide,
  Hoverboard,
  Jumppack,
  MagicCarpet,
  NinjaRun,
  Null,
  NullBool,
  Stealth,
  SteamJump,
  Walk,
  XPDebt,
  ForceMove,
  ModifyAttrib,
  ExecPower
}

export enum ePowerAttribs {
  None,
  Accuracy,
  ActivateInterval,
  Arc,
  CastTime,
  EffectArea,
  EnduranceCost,
  InterruptTime,
  MaxTargets,
  Radius,
  Range,
  RechargeTime,
  SecondaryRange
}

export enum eEffMode {
  Enhancement,
  FX,
  PowerEnh,
  PowerProc
}

export enum eEnhance {
  None,
  Accuracy,
  Damage,
  Defense,
  EnduranceDiscount,
  Endurance,
  SpeedFlying,
  Heal,
  HitPoints,
  Interrupt,
  JumpHeight,
  SpeedJumping,
  Mez,
  Range,
  RechargeTime,
  X_RechargeTime,
  Recovery,
  Regeneration,
  Resistance,
  SpeedRunning,
  ToHit,
  Slow,
  Absorb
}

export enum eEnhanceShort {
  None,
  Acc,
  Dmg,
  Def,
  EndRdx,
  EndMod,
  Fly,
  Heal,
  HP,
  ActRdx,
  Jump,
  JumpSpd,
  Mez,
  Rng,
  Rchg,
  RchrgTm,
  EndRec,
  Regen,
  Res,
  RunSpd,
  ToHit,
  Slow
}

export enum eEnhGrade {
  None,
  TrainingO,
  DualO,
  SingleO
}

export enum eEnhMutex {
  None,
  Stealth,
  ArchetypeA,
  ArchetypeB,
  ArchetypeC,
  ArchetypeD,
  ArchetypeE,
  ArchetypeF
}

export enum eEnhRelative {
  None,
  MinusThree,
  MinusTwo,
  MinusOne,
  Even,
  PlusOne,
  PlusTwo,
  PlusThree,
  PlusFour,
  PlusFive
}

export enum eEntity {
  None = 0,
  Caster = 1,
  Player = 2,
  DeadPlayer = 4,
  Teammate = 8,
  DeadTeammate = 16,
  DeadOrAliveTeammate = 32,
  Villain = 64,
  DeadVillain = 128,
  NPC = 256,
  Friend = 512,
  DeadFriend = 1024,
  Foe = 2048,
  Location = 8192,
  Teleport = 16384,
  Any = 32768,
  MyPet = 65536,
  DeadFoe = 131072,
  FoeRezzingFoe = 262144,
  Leaguemate = 524288,
  DeadLeaguemate = 1048576,
  AnyLeaguemate = 2097152,
  DeadMyCreation = 4194304,
  DeadMyPet = 8388608,
  DeadOrAliveFoe = 16777216,
  DeadOrAliveLeaguemate = 33554432,
  DeadPlayerFriend = 67108864,
  MyOwner = 134217728
}

export enum eBoosts {
  None,
  Accuracy_Boost,
  Interrupt_Boost,
  Confuse_Boost,
  Damage_Boost,
  Buff_Defense_Boost,
  Debuff_Defense_Boost,
  Recovery_Boost,
  EnduranceDiscount_Boost,
  Fear_Boost,
  SpeedFlying_Boost,
  Heal_Boost,
  Hold_Boost,
  Immobilized_Boost,
  Intangible_Boost,
  Jump_Boost,
  Knockback_Boost,
  Range_Boost,
  Recharge_Boost,
  Res_Damage_Boost,
  SpeedRunning_Boost,
  Sleep_Boost,
  Slow_Boost,
  Stunned_Boost,
  Taunt_Boost,
  Buff_ToHit_Boost,
  Debuff_ToHit_Boost,
  Magic_Boost,
  Mutation_Boost,
  Natural_Boost,
  Science_Boost,
  Technology_Boost,
  Hamidon_Boost,
  Incarnate_Lore_Boost,
  Incarnate_Destiny_Boost,
  Incarnate_Judgement_Boost,
  Incarnate_Interface_Boost
}

export enum eGridType {
  None,
  Accolade,
  Class,
  Incarnate,
  Inherent,
  Pet,
  Power,
  Powerset,
  Prestige,
  Temp
}

export enum eInterfaceMode {
  Normal,
  PowerToggle
}

export enum eMez {
  None,
  Confused,
  Held,
  Immobilized,
  Knockback,
  Knockup,
  OnlyAffectsSelf,
  Placate,
  Repel,
  Sleep,
  Stunned,
  Taunt,
  Terrorized,
  Untouchable,
  Teleport,
  ToggleDrop,
  Afraid,
  Avoid,
  CombatPhase,
  Intangible
}

export enum eMezShort {
  None,
  Conf,
  Held,
  Immob,
  KB,
  KUp,
  AffSelf,
  Placate,
  Repel,
  Sleep,
  Stun,
  Taunt,
  Fear,
  Untouch,
  TP,
  DeTogg,
  Afraid,
  Avoid,
  Phased,
  Intan
}

export enum eMMpets {
  Summon_Wolves,
  Summon_Lions,
  Summon_Dire_Wolf,
  Summon_Demonlings,
  Summon_Demons,
  Hell_on_Earth,
  Summon_Demon_Prince,
  Soldiers,
  Spec_Ops,
  Commando,
  Zombie_Horde,
  Grave_Knight,
  Soul_Extraction,
  Lich,
  Call_Genin,
  Call_Jounin,
  Oni,
  Battle_Drones,
  Protector_Bots,
  Assault_Bot,
  Call_Thugs,
  Call_Enforcer,
  Gang_War,
  Call_Bruiser
}

export enum eModeFlags {
  None = 0,
  Arena = 1,
  Disable_All = 2,
  Disable_Enhancements = 4,
  Disable_Epic = 8,
  Disable_Inspirations = 16,
  Disable_Market_TP = 32,
  Disable_Pool = 64,
  Disable_Rez_Insp = 128,
  Disable_Teleport = 256,
  Disable_Temp = 512,
  Disable_Toggle = 1024,
  Disable_Travel = 2048,
  Domination = 4096,
  Peacebringer_Blaster_Mode = 8192,
  Peacebringer_Lightform_Mode = 16384,
  Peacebringer_Tanker_Mode = 32768,
  Raid_Attacker_Mode = 65536,
  Shivan_Mode = 131072,
  Unknown18 = 262144,
  Warshade_Blaster_Mode = 524288,
  Warshade_Tanker_Mode = 1048576
}

export enum eMutex {
  NoGroup,
  NoConflict,
  MutexFound,
  DetoggleMaster,
  DetoggleSlave
}

export enum eNotify {
  Always,
  Never,
  MissOnly,
  HitOnly
}

export enum eOverrideBoolean {
  NoOverride,
  TrueOverride,
  FalseOverride
}

export enum ePowerSetType {
  None,
  Primary,
  Secondary,
  Ancillary,
  Inherent,
  Pool,
  Accolade,
  Temp,
  Pet,
  SetBonus,
  Boost,
  Incarnate,
  Redirect
}

export enum ePowerState {
  Disabled,
  Empty,
  Used,
  Open
}

export enum ePowerType {
  Click,
  Auto_,
  Toggle,
  Boost,
  Inspiration,
  GlobalBoost
}

export enum ePvX {
  Any,
  PvE,
  PvP
}

export enum eSchedule {
  None = -1,
  A = 0,
  B = 1,
  C = 2,
  D = 3,
  Multiple = 4
}

export enum eSetType {
  Untyped,
  MeleeST,
  RangedST,
  RangedAoE,
  MeleeAoE,
  Snipe,
  Pets,
  Defense,
  Resistance,
  Heal,
  Hold,
  Stun,
  Immob,
  Slow,
  Sleep,
  Fear,
  Confuse,
  Flight,
  Jump,
  Run,
  Teleport,
  DefDebuff,
  EndMod,
  Knockback,
  Threat,
  ToHit,
  ToHitDeb,
  PetRech,
  Travel,
  AccHeal,
  AccDefDeb,
  AccToHitDeb,
  Arachnos,
  Blaster,
  Brute,
  Controller,
  Corruptor,
  Defender,
  Dominator,
  Kheldian,
  Mastermind,
  Scrapper,
  Stalker,
  Tanker,
  UniversalDamage,
  Sentinel,
  RunNoSprint,
  JumpNoSprint,
  FlightNoSprint,
  TeleportNoSprint
}

export enum eSpecialCase {
  None,
  Hidden,
  Domination,
  Scourge,
  Mezzed,
  CriticalHit,
  CriticalBoss,
  CriticalMinion,
  Robot,
  Assassination,
  Containment,
  Defiance,
  TargetDroneActive,
  Combo,
  VersusSpecial,
  NotDisintegrated,
  Disintegrated,
  NotAccelerated,
  Accelerated,
  NotDelayed,
  Delayed,
  ComboLevel0,
  ComboLevel1,
  ComboLevel2,
  ComboLevel3,
  FastMode,
  NotAssassination,
  PerfectionOfBody0,
  PerfectionOfBody1,
  PerfectionOfBody2,
  PerfectionOfBody3,
  PerfectionOfMind0,
  PerfectionOfMind1,
  PerfectionOfMind2,
  PerfectionOfMind3,
  PerfectionOfSoul0,
  PerfectionOfSoul1,
  PerfectionOfSoul2,
  PerfectionOfSoul3,
  TeamSize1,
  TeamSize2,
  TeamSize3,
  NotComboLevel3,
  ToHit97,
  DefensiveAdaptation,
  EfficientAdaptation,
  OffensiveAdaptation,
  NotDefensiveAdaptation,
  NotDefensiveNorOffensiveAdaptation,
  BoxingBuff,
  KickBuff,
  Supremacy,
  SupremacyAndBuffPwr,
  PetTier2,
  PetTier3,
  PackMentality,
  NotPackMentality,
  FastSnipe,
  NotFastSnipe,
  CrossPunchBuff,
  NotCrossPunchBuff,
  NotBoxingBuff,
  NotKickBuff
}

export enum eSpeedMeasure {
  FeetPerSecond,
  MetersPerSecond,
  MilesPerHour,
  KilometersPerHour
}

export enum eStacking {
  No,
  Yes
}

export enum eStats {
  None,
  Smashing_Defense,
  Lethal_Defense,
  Fire_Defense,
  Cold_Defense,
  Energy_Defense,
  Negative_Defense,
  Psionic_Defense,
  Melee_Defense,
  Ranged_Defense,
  AOE_Defense,
  Smashing_Resistance,
  Lethal_Resistance,
  Fire_Resistance,
  Cold_Resistance,
  Energy_Resistance,
  Negative_Resistance,
  Toxic_Resistance,
  Psionic_Resistance,
  Damage_Buff,
  Endurance_Usage,
  Global_Recharge,
  Recovery,
  Regen,
  ToHit
}

export enum eSubtype {
  None,
  Hamidon,
  Hydra,
  Titan,
  DSync
}

export enum eSummonEntity {
  Pet,
  Henchman
}

export enum eSuppress {
  None = 0,
  Held = 1,
  Sleep = 2,
  Stunned = 4,
  Immobilized = 8,
  Terrorized = 16,
  Knocked = 32,
  Attacked = 64,
  HitByFoe = 128,
  MissionObjectClick = 256,
  ActivateAttackClick = 512,
  Damaged = 1024,
  Phased1 = 2048,
  Confused = 4096,
  Repelled = 8192
}

export enum eToWho {
  Unspecified,
  Target,
  Self,
  All
}

export enum eType {
  None,
  Normal,
  InventO,
  SpecialO,
  SetO
}

export enum eValidationType {
  Power,
  Powerset
}

export enum eVector {
  None = 0,
  Melee_Attack = 1,
  Ranged_Attack = 2,
  AOE_Attack = 4,
  Smashing_Attack = 8,
  Lethal_Attack = 16,
  Cold_Attack = 32,
  Fire_Attack = 64,
  Energy_Attack = 128,
  Negative_Energy_Attack = 256,
  Psionic_Attack = 512,
  Toxic_Attack = 1024
}

export enum eVisibleSize {
  Full,
  Small,
  VerySmall,
  Compact
}

export enum GraphStyle {
  Twin,
  Stacked,
  baseOnly,
  enhOnly
}

export enum PowersetType {
  None = -1,
  Primary = 0,
  Secondary = 1,
  Inherent = 2,
  Pool0 = 3,
  Pool1 = 4,
  Pool2 = 5,
  Pool3 = 6,
  Ancillary = 7
}

export enum eStatType {
  Endurance = 7,
  Enhancement = 9,
  FlySpeed = 11,
  Heal = 13,
  HPMax = 14,
  JumpHeight = 16,
  JumpSpeed = 17,
  MezResist = 20,
  Perception = 23,
  Range = 24,
  EndRec = 26,
  HPRegen = 27,
  RunSpeed = 32,
  StealthPvE = 36,
  StealthPvP = 37,
  ThreatLevel = 39,
  ToHit = 40,
  Elusivity = 44,
  MaxRunSpeed = 49,
  MaxJumpSpeed = 50,
  MaxFlySpeed = 51,
  Absorb = 66,
  BuffEndRdx = 8,
  Haste = 25,
  BuffAcc = 1
}

export enum eBarGroup {
  Defense = 0,
  Resistance = 1,
  HP = 2,
  Endurance = 3,
  Movement = 4,
  Stealth = 5,
  MiscBuffs = 6,
  StatusProtection = 7,
  StatusResistance = 8,
  DebuffResistance = 9
}

export enum eBarType {
  DefenseSmashing = 0,
  DefenseLethal = 1,
  DefenseFire = 2,
  DefenseCold = 3,
  DefenseEnergy = 4,
  DefenseNegative = 5,
  DefensePsionic = 6,
  DefenseMelee = 7,
  DefenseRanged = 8,
  DefenseAoE = 9,
  ResistanceSmashing = 10,
  ResistanceLethal = 11,
  ResistanceFire = 12,
  ResistanceCold = 13,
  ResistanceEnergy = 14,
  ResistanceNegative = 15,
  ResistanceToxic = 16,
  ResistancePsionic = 17,
  Regeneration = 18,
  MaxHPAbsorb = 19,
  EndRec = 20,
  EndUse = 21,
  MaxEnd = 22,
  RunSpeed = 23,
  JumpSpeed = 24,
  JumpHeight = 25,
  FlySpeed = 26,
  StealthPvE = 27,
  StealthPvP = 28,
  Perception = 29,
  Haste = 30,
  ToHit = 31,
  Accuracy = 32,
  Damage = 33,
  EndRdx = 34,
  ThreatLevel = 35,
  Elusivity = 36,
  MezProtectionHold = 37,
  MezProtectionStunned = 38,
  MezProtectionSleep = 39,
  MezProtectionImmob = 40,
  MezProtectionKnockback = 41,
  MezProtectionRepel = 42,
  MezProtectionConfuse = 43,
  MezProtectionFear = 44,
  MezProtectionTaunt = 45,
  MezProtectionPlacate = 46,
  MezProtectionTeleport = 47,
  MezResistanceHold = 48,
  MezResistanceStunned = 49,
  MezResistanceSleep = 50,
  MezResistanceImmob = 51,
  MezResistanceKnockback = 52,
  MezResistanceRepel = 53,
  MezResistanceConfuse = 54,
  MezResistanceFear = 55,
  MezResistanceTaunt = 56,
  MezResistancePlacate = 57,
  MezResistanceTeleport = 58,
  DebuffResistanceDefense = 59,
  DebuffResistanceEndurance = 60,
  DebuffResistanceRecovery = 61,
  DebuffResistancePerception = 62,
  DebuffResistanceToHit = 63,
  DebuffResistanceRechargeTime = 64,
  DebuffResistanceSpeedRunning = 65,
  DebuffResistanceRegen = 66
}

export enum eFXGroup {
  Offense = 0,
  Defense = 1,
  Survival = 2,
  StatusEffects = 3,
  Movement = 4,
  Perception = 5,
  Misc = 6
}

export enum eFXSubGroup {
  NoGroup = 0,
  DamageAll = 1,
  MezResistAll = 2,
  SmashLethalDefense = 3,
  FireColdDefense = 4,
  EnergyNegativeDefense = 5,
  SmashLethalResistance = 6,
  FireColdResistance = 7,
  EnergyNegativeResistance = 8,
  SlowResistance = 9,
  SlowBuffs = 10,
  KnockProtection = 11,
  KnockResistance = 12,
  Jump = 13
}

export enum RewardCurrency {
  RewardMerit = 0,
  AstralMerit = 1,
  EmpyreanMerit = 2,
  AlignmentMerit = 3,
  VanguardMerit = 4,
  AETicket = 5,
  Influence = 6
}

export enum eColorSetting {
  ColorBackgroundHero = 0,
  ColorBackgroundVillain = 1,
  ColorText = 2,
  ColorInvention = 3,
  ColorInventionInv = 4,
  ColorFaded = 5,
  ColorEnhancement = 6,
  ColorWarning = 7,
  ColorPlName = 8,
  ColorPlSpecial = 9,
  ColorPowerAvailable = 10,
  ColorPowerDisabled = 11,
  ColorPowerTakenHero = 12,
  ColorPowerTakenDarkHero = 13,
  ColorPowerHighlightHero = 14,
  ColorPowerTakenVillain = 15,
  ColorPowerTakenDarkVillain = 16,
  ColorPowerHighlightVillain = 17,
  ColorDamageBarBase = 18,
  ColorDamageBarEnh = 19
}

export enum eFontSizeSetting {
  PairedBase = 0,
  PowersSelectBase = 1,
  PowersBase = 2
}

export enum WordwrapMode {
  Legacy = 0,
  New = 1,
  UseEllipsis = 2
}

export enum eColumnStacking {
  None = 0,
  Vertical = 1,
  Horizontal = 2
}

export enum eHTextAlign {
  Left,
  Center,
  Right
}

export enum eVTextAlign {
  Top,
  Middle,
  Bottom,
  BaseLine
}

// ============================================================================
// STRUCTS / INTERFACES
// ============================================================================

export interface sEnhClass {
  ID: number;
  Name: string;
  ShortName: string;
  ClassID: string;
  Desc: string;
}

export interface sTwinID {
  ID: number;
  SubID: number;
}

export interface ShortFX {
  Index: number[] | null;
  Value: number[];
  Sum: number;
  readonly Present: boolean;
  readonly Multiple: boolean;
  readonly Max: number;
  Add(iIndex: number, iValue: number): void;
  Remove(iIndex: number): void;
  Assign(iFX: ShortFX): void;
  Multiply(): void;
  ReSum(): void;
}

export class ShortFXImpl implements ShortFX {
  Index: number[] | null = null;
  Value: number[] = [];
  Sum: number = 0;

  get Present(): boolean {
    return this.Index !== null && this.Index.length >= 1 && this.Index[0] !== -1;
  }

  get Multiple(): boolean {
    return this.Index !== null && this.Index.length > 1;
  }

  get Max(): number {
    if (!this.Present) {
      return -1;
    }

    let maxValue = 0;
    let maxIndex = 0;

    for (let i = 0; i < this.Value.length; i++) {
      if (this.Value[i] > maxValue) {
        maxValue = this.Value[i];
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  Add(iIndex: number, iValue: number): void {
    if (this.Value === null || this.Index === null) {
      this.Value = [];
      this.Index = [];
      this.Sum = 0;
    }

    this.Value.push(iValue);
    this.Index!.push(iIndex);
    this.Sum += iValue;
  }

  Remove(iIndex: number): void {
    if (this.Index === null || this.Value === null) {
      return;
    }

    const newValue: number[] = [];
    const newIndex: number[] = [];
    let newIdx = 0;

    for (let i = 0; i < this.Index.length; i++) {
      if (i !== iIndex) {
        newValue[newIdx] = this.Value[i];
        newIndex[newIdx] = this.Index[i];
        newIdx++;
      }
    }

    this.Value = newValue;
    this.Index = newIndex;
  }

  Assign(iFX: ShortFX): void {
    if (iFX.Present) {
      this.Index = iFX.Index;
      this.Value = iFX.Value;
      this.Sum = iFX.Sum;
    } else {
      this.Index = [];
      this.Value = [];
      this.Sum = 0;
    }
  }

  Multiply(): void {
    if (this.Value === null) {
      return;
    }

    for (let i = 0; i < this.Value.length; i++) {
      this.Value[i] *= 100;
    }

    this.Sum *= 100;
  }

  ReSum(): void {
    this.Sum = 0;
    for (const val of this.Value) {
      this.Sum += val;
    }
  }
}

export interface CompMap {
  readonly UBound: number;
  IdxAT: number[];
  IdxSet: number[];
  Map: number[][];
  Init(): void;
}

export class CompMapImpl implements CompMap {
  readonly UBound = 21;
  IdxAT: number[] = [];
  IdxSet: number[] = [];
  Map: number[][] = [];

  Init(): void {
    this.IdxAT = new Array(2);
    this.IdxSet = new Array(2);
    this.Map = [];
    for (let i = 0; i < 21; i++) {
      this.Map[i] = [-1, -1];
    }
  }
}

export interface CompOverride {
  Powerset: string;
  Power: string;
  Override: string;
}

export interface BuffsX {
  Effect: number[];
  EffectAux: number[];
  Mez: number[];
  MezRes: number[];
  Damage: number[];
  Defense: number[];
  Resistance: number[];
  Elusivity: number[];
  StatusProtection: number[];
  StatusResistance: number[];
  DebuffResistance: number[];
  MaxEnd: number;
  Reset(): void;
}

export class BuffsXImpl implements BuffsX {
  Effect: number[] = [];
  EffectAux: number[] = [];
  Mez: number[] = [];
  MezRes: number[] = [];
  Damage: number[] = [];
  Defense: number[] = [];
  Resistance: number[] = [];
  Elusivity: number[] = [];
  StatusProtection: number[] = [];
  StatusResistance: number[] = [];
  DebuffResistance: number[] = [];
  MaxEnd: number = 0;

  Reset(): void {
    this.MaxEnd = 0;
    // Note: These would need the actual enum lengths - using approximate sizes
    this.Effect = new Array(Object.keys(eEffectType).length / 2).fill(0);
    this.EffectAux = new Array(this.Effect.length - 1).fill(0);
    this.Mez = new Array(Object.keys(eMez).length / 2).fill(0);
    this.MezRes = new Array(this.Mez.length).fill(0);
    this.Damage = new Array(Object.keys(eDamage).length / 2).fill(0);
    this.Defense = new Array(this.Damage.length).fill(0);
    this.Resistance = new Array(this.Damage.length).fill(0);
    this.Elusivity = new Array(this.Damage.length).fill(0);
    this.StatusProtection = new Array(this.Mez.length).fill(0);
    this.StatusResistance = new Array(this.Mez.length).fill(0);
    this.DebuffResistance = new Array(this.Effect.length).fill(0);
  }
}

export interface VersionData {
  Revision: number;
  RevisionDate: Date;
  SourceFile: string;
  // Note: Load and StoreTo methods removed as they use BinaryReader/Writer
  // These would need to be implemented separately for TypeScript
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function MezDurationEnhanceable(mezEnum: eMez): boolean {
  return [
    eMez.Confused,
    eMez.Held,
    eMez.Immobilized,
    eMez.Placate,
    eMez.Sleep,
    eMez.Stunned,
    eMez.Taunt,
    eMez.Terrorized,
    eMez.Untouchable
  ].includes(mezEnum);
}

export function GetEffectName(iID: eEffectType): string {
  return eEffectType[iID];
}

export function GetEffectNameShort(iID: eEffectType): string {
  return iID !== eEffectType.Endurance ? eEffectTypeShort[iID] : 'End';
}

export function GetMezName(iID: eMezShort | eMez): string {
  return eMez[iID];
}

export function GetMezNameShort(iID: eMezShort): string {
  return eMezShort[iID];
}

export function GetDamageName(iID: eDamage): string {
  return eDamage[iID];
}

export function GetDamageNameShort(iID: eDamage): string {
  return eDamageShort[iID];
}

export function GetRelativeString(iRel: eEnhRelative, onlySign: boolean): string {
  if (onlySign) {
    switch (iRel) {
      case eEnhRelative.MinusThree:
        return '---';
      case eEnhRelative.MinusTwo:
        return '--';
      case eEnhRelative.MinusOne:
        return '-';
      case eEnhRelative.Even:
        return '';
      case eEnhRelative.PlusOne:
        return '+';
      case eEnhRelative.PlusTwo:
        return '++';
      case eEnhRelative.PlusThree:
        return '+++';
      case eEnhRelative.PlusFour:
        return '+4';
      case eEnhRelative.PlusFive:
        return '+5';
      default:
        return '';
    }
  }

  switch (iRel) {
    case eEnhRelative.MinusThree:
      return '-3';
    case eEnhRelative.MinusTwo:
      return '-2';
    case eEnhRelative.MinusOne:
      return '-1';
    case eEnhRelative.Even:
      return '';
    case eEnhRelative.PlusOne:
      return '+1';
    case eEnhRelative.PlusTwo:
      return '+2';
    case eEnhRelative.PlusThree:
      return '+3';
    case eEnhRelative.PlusFour:
      return '+4';
    case eEnhRelative.PlusFive:
      return '+5';
    default:
      return '';
  }
}

// Helper function to split comma-separated string into sorted array
export function StringToArray(iStr: string | null | undefined): string[] {
  if (iStr == null || iStr === '') {
    return [];
  }

  const normalized = iStr.replace(/, /g, ',');
  const array = normalized.split(',');
  array.sort();

  return array;
}

// Convert string to enum value(s), supporting both single values and flagged (bitwise) enums
// For flagged enums, multiple values separated by commas or spaces are summed together
export function StringToFlaggedEnum(
  iStr: string,
  enumObj: Record<string, number | string>,
  noFlag: boolean = false
): number {
  let result = 0;
  const upperStr = iStr.toUpperCase();

  // Split by comma or space
  const strArray = upperStr.includes(',')
    ? StringToArray(upperStr)
    : upperStr.split(' ');

  if (strArray.length < 1) {
    return result;
  }

  // Get enum names (filter out reverse mappings for numeric enums)
  // TypeScript numeric enums have both string->number and number->string mappings
  const enumNames = Object.keys(enumObj).filter(key => isNaN(Number(key)));
  const upperNames = enumNames.map(name => name.toUpperCase());

  for (const str of strArray) {
    if (str.length === 0) {
      continue;
    }

    const index = upperNames.indexOf(str);
    if (index === -1) {
      continue;
    }

    const enumName = enumNames[index];
    const enumValue = enumObj[enumName] as number;

    if (noFlag) {
      return enumValue;
    }

    result += enumValue;
  }

  return result;
}

// Check if a string is a valid enum value name
export function IsEnumValue(
  iStr: string | null | undefined,
  enumObj: Record<string, number | string>
): boolean {
  if (iStr == null) {
    return false;
  }

  // Get enum names (filter out reverse mappings for numeric enums)
  const enumNames = Object.keys(enumObj).filter(key => isNaN(Number(key)));
  const upperStr = iStr.toUpperCase();
  const upperNames = enumNames.map(name => name.toUpperCase());

  return upperNames.indexOf(upperStr) > -1;
}

// Note: StringToEnumArray can be added if needed

export function GetGroupedDamage(iDamage: boolean[], shortForm: boolean): string {
  const damageEnumLength = Object.keys(eDamage).length / 2 - 1;
  if (iDamage.length < damageEnumLength) {
    return 'Error: Array Length Mismatch';
  }

  let result = '';
  const validList = [1, 2, 3, 4, 5, 6, 7, 8];
  const foundTypes: number[] = [];
  for (let i = 0; i < iDamage.length; i++) {
    if (iDamage[i]) {
      foundTypes.push(i);
    }
  }

  const allElementsFound = validList.every((val, idx) => foundTypes[idx] === val);
  if (allElementsFound && foundTypes.length === validList.length) {
    return 'All';
  }

  for (let i = 0; i < iDamage.length; i++) {
    if (!iDamage[i]) {
      continue;
    }

    const damageName = shortForm ? GetDamageNameShort(i as eDamage) : GetDamageName(i as eDamage);
    if (result !== '') {
      result += ',';
    }
    result += damageName;
  }

  return result;
}

export function GetGroupedDefense(iDamage: boolean[], shortForm: boolean): string {
  const damageEnumLength = Object.keys(eDamage).length / 2 - 1;
  if (iDamage.length < damageEnumLength) {
    return 'Error: Array Length Mismatch';
  }

  let result = '';
  if (
    iDamage[1] &&
    iDamage[2] &&
    iDamage[3] &&
    iDamage[4] &&
    iDamage[5] &&
    iDamage[6] &&
    iDamage[8] &&
    iDamage[10] &&
    iDamage[11] &&
    iDamage[12]
  ) {
    return 'All';
  }

  for (let i = 0; i < iDamage.length; i++) {
    if (!iDamage[i]) {
      continue;
    }

    const damageName = shortForm ? GetDamageNameShort(i as eDamage) : GetDamageName(i as eDamage);
    if (result !== '') {
      result += ',';
    }
    result += damageName;
  }

  return result;
}

export function GetGroupedMez(iMez: boolean[], shortForm: boolean): string {
  const mezEnumLength = Object.keys(eMez).length / 2 - 1;
  if (iMez.length < mezEnumLength) {
    return 'Error: Array Length Mismatch';
  }

  let result = '';
  if (iMez[1] && iMez[2] && iMez[10] && iMez[9]) {
    return 'Mez';
  }

  if (iMez[4] && iMez[5] && iMez[1] && iMez[2] && iMez[10] && iMez[9]) {
    return 'Knocked';
  }

  for (let i = 0; i < iMez.length; i++) {
    if (!iMez[i]) {
      continue;
    }

    const mezName = shortForm ? GetMezNameShort(i as eMezShort) : GetMezName(i as eMezShort);
    if (result !== '') {
      result += ',';
    }
    result += mezName;
  }

  return result;
}
