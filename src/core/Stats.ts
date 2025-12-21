// Converted from C# Stats.cs
// This file contains many nested classes for different stat types

export class BaseStat {
  Base: number = 0;
  Current: number = 0;
  Maximum: number = 0;
}

export class Absorb extends BaseStat {}
export class Accuracy extends BaseStat {}
export class DamageBuff extends BaseStat {}
export class Endurance extends BaseStat {}
export class HitPoints extends BaseStat {}
export class Perception extends BaseStat {}
export class Recharge extends BaseStat {}
export class Recovery extends BaseStat {}
export class Regeneration extends BaseStat {}
export class Threat extends BaseStat {}
export class ToHit extends BaseStat {}

// Damage/Defense types
export class Smashing extends BaseStat {}
export class Lethal extends BaseStat {}
export class Fire extends BaseStat {}
export class Cold extends BaseStat {}
export class Energy extends BaseStat {}
export class Negative extends BaseStat {}
export class Psionic extends BaseStat {}
export class Toxic extends BaseStat {}
export class Melee extends BaseStat {}
export class Ranged extends BaseStat {}
export class Aoe extends BaseStat {}

// Movement types
export class FlySpeed extends BaseStat {}
export class JumpHeight extends BaseStat {}
export class JumpSpeed extends BaseStat {}
export class RunSpeed extends BaseStat {}

// Status types
export class Confused extends BaseStat {}
export class Terrorized extends BaseStat {}
export class Held extends BaseStat {}
export class Immobilized extends BaseStat {}
export class KnockBack extends BaseStat {}
export class KnockUp extends BaseStat {}
export class Placate extends BaseStat {}
export class Repel extends BaseStat {}
export class Sleep extends BaseStat {}
export class Stunned extends BaseStat {}
export class Taunt extends BaseStat {}
export class Teleport extends BaseStat {}

// Stealth types
export class StealthRadiusPve extends BaseStat {}
export class StealthRadiusPvp extends BaseStat {}

// Composite stat classes
export class Defense {
  Smashing: Smashing = new Smashing();
  Lethal: Lethal = new Lethal();
  Fire: Fire = new Fire();
  Cold: Cold = new Cold();
  Energy: Energy = new Energy();
  Negative: Negative = new Negative();
  Psionic: Psionic = new Psionic();
  Toxic: Toxic = new Toxic();
  Melee: Melee = new Melee();
  Ranged: Ranged = new Ranged();
  Aoe: Aoe = new Aoe();
}

export class DefenseDebuff {
  Smashing: Smashing = new Smashing();
  Lethal: Lethal = new Lethal();
  Fire: Fire = new Fire();
  Cold: Cold = new Cold();
  Energy: Energy = new Energy();
  Negative: Negative = new Negative();
  Psionic: Psionic = new Psionic();
  Toxic: Toxic = new Toxic();
  Melee: Melee = new Melee();
  Ranged: Ranged = new Ranged();
  Aoe: Aoe = new Aoe();
}

export class Elusivity {
  Smashing: Smashing = new Smashing();
  Lethal: Lethal = new Lethal();
  Fire: Fire = new Fire();
  Cold: Cold = new Cold();
  Energy: Energy = new Energy();
  Negative: Negative = new Negative();
  Psionic: Psionic = new Psionic();
  Toxic: Toxic = new Toxic();
  Melee: Melee = new Melee();
  Ranged: Ranged = new Ranged();
  Aoe: Aoe = new Aoe();
}

export class Resistance {
  Smashing: Smashing = new Smashing();
  Lethal: Lethal = new Lethal();
  Fire: Fire = new Fire();
  Cold: Cold = new Cold();
  Energy: Energy = new Energy();
  Negative: Negative = new Negative();
  Psionic: Psionic = new Psionic();
  Toxic: Toxic = new Toxic();
}

export class ResistanceDebuff {
  Smashing: Smashing = new Smashing();
  Lethal: Lethal = new Lethal();
  Fire: Fire = new Fire();
  Cold: Cold = new Cold();
  Energy: Energy = new Energy();
  Negative: Negative = new Negative();
  Psionic: Psionic = new Psionic();
  Toxic: Toxic = new Toxic();
}

export class StatusProtection {
  Confuse: Confused = new Confused();
  Fear: Terrorized = new Terrorized();
  Hold: Held = new Held();
  Immobilize: Immobilized = new Immobilized();
  KnockBack: KnockBack = new KnockBack();
  KnockUp: KnockUp = new KnockUp();
  Placate: Placate = new Placate();
  Repel: Repel = new Repel();
  Sleep: Sleep = new Sleep();
  Stun: Stunned = new Stunned();
  Taunt: Taunt = new Taunt();
  Teleport: Teleport = new Teleport();
}

export class StatusResistance {
  Confuse: Confused = new Confused();
  Fear: Terrorized = new Terrorized();
  Hold: Held = new Held();
  Immobilize: Immobilized = new Immobilized();
  KnockBack: KnockBack = new KnockBack();
  KnockUp: KnockUp = new KnockUp();
  Placate: Placate = new Placate();
  Repel: Repel = new Repel();
  Sleep: Sleep = new Sleep();
  Stun: Stunned = new Stunned();
  Taunt: Taunt = new Taunt();
  Teleport: Teleport = new Teleport();
}

export class Movement {
  FlySpeed: FlySpeed = new FlySpeed();
  JumpHeight: JumpHeight = new JumpHeight();
  JumpSpeed: JumpSpeed = new JumpSpeed();
  RunSpeed: RunSpeed = new RunSpeed();
}

export class StealthRadius {
  PvE: StealthRadiusPve = new StealthRadiusPve();
  PvP: StealthRadiusPvp = new StealthRadiusPvp();
}

export class DebuffResistance {
  Defense: Defense = new Defense();
  Endurance: Endurance = new Endurance();
  Perception: Perception = new Perception();
  Recharge: Recharge = new Recharge();
  Recovery: Recovery = new Recovery();
  Regeneration: Regeneration = new Regeneration();
  RunSpeed: RunSpeed = new RunSpeed();
  ToHit: ToHit = new ToHit();
}

export class Display {
  private static _instance: Display | null = null;

  Absorb: Absorb = new Absorb();
  Accuracy: Accuracy = new Accuracy();
  DamageBuff: DamageBuff = new DamageBuff();
  DebuffResistance: DebuffResistance = new DebuffResistance();
  Defense: Defense = new Defense();
  DefenseDebuff: DefenseDebuff = new DefenseDebuff();
  Elusivity: Elusivity = new Elusivity();
  Endurance: Endurance = new Endurance();
  EnduranceReduction: number = 0;
  EnduranceUsage: number = 0;
  HitPoints: HitPoints = new HitPoints();
  Movement: Movement = new Movement();
  Perception: Perception = new Perception();
  Recharge: Recharge = new Recharge();
  Recovery: Recovery = new Recovery();
  Regeneration: Regeneration = new Regeneration();
  Resistance: Resistance = new Resistance();
  ResistanceDebuff: ResistanceDebuff = new ResistanceDebuff();
  StatusProtection: StatusProtection = new StatusProtection();
  StatusResistance: StatusResistance = new StatusResistance();
  StealthRadius: StealthRadius = new StealthRadius();
  Threat: Threat = new Threat();
  ToHit: ToHit = new ToHit();

  constructor() {
    this.Initialize();
  }

  Initialize(noReset: boolean = true): void {
    // Initialize all stat objects with default values
    this.DebuffResistance = new DebuffResistance();
    this.Defense = new Defense();
    this.DefenseDebuff = new DefenseDebuff();
    this.Elusivity = new Elusivity();
    this.Resistance = new Resistance();
    this.ResistanceDebuff = new ResistanceDebuff();
    this.StatusProtection = new StatusProtection();
    this.StatusResistance = new StatusResistance();
    this.Movement = new Movement();
    this.StealthRadius = new StealthRadius();

    if (!noReset) {
      return;
    }

    this.Absorb = new Absorb();
    this.Accuracy = new Accuracy();
    this.DamageBuff = new DamageBuff();
    this.Endurance = new Endurance();
    this.EnduranceReduction = 0;
    this.EnduranceUsage = 0;
    this.HitPoints = new HitPoints();
    this.Perception = new Perception();
    this.Recharge = new Recharge();
    this.Recovery = new Recovery();
    this.Regeneration = new Regeneration();
    this.Threat = new Threat();
    this.ToHit = new ToHit();
  }
}

export class Stats {
  static Display: Display = new Display();
}

