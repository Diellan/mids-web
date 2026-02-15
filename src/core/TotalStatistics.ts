// TotalStatistics class - aggregates character statistics totals
// This class is used by Character to track total statistics values
import { eDamage, eMez, eEffectType } from './Enums';
export class TotalStatistics {
    public Def: number[] = [];
    public Res: number[] = [];
    public Mez: number[] = [];
    public MezRes: number[] = [];
    public DebuffRes: number[] = [];
    public Elusivity: number[] = [];
    public ElusivityMax: number = 0;
    public HPRegen: number = 0;
    public HPMax: number = 0;
    public Absorb: number = 0;
    public EndRec: number = 0;
    public EndUse: number = 0;
    public EndMax: number = 0;
    public RunSpd: number = 0;
    public MaxRunSpd: number = 0;
    public JumpSpd: number = 0;
    public MaxJumpSpd: number = 0;
    public FlySpd: number = 0;
    public MaxFlySpd: number = 0;
    public JumpHeight: number = 0;
    public StealthPvE: number = 0;
    public StealthPvP: number = 0;
    public ThreatLevel: number = 0;
    public Perception: number = 0;
    public BuffHaste: number = 0;
    public BuffAcc: number = 0;
    public BuffToHit: number = 0;
    public BuffDam: number = 0;
    public BuffEndRdx: number = 0;
    public BuffRange: number = 0;

    public Init(fullReset: boolean = true)
    {
        this.Def = new Array(Object.values(eDamage).filter(value => typeof value === 'number').length).fill(0);
        this.Res = new Array(Object.values(eDamage).filter(value => typeof value === 'number').length).fill(0);
        this.Mez = new Array(Object.values(eMez).filter(value => typeof value === 'number').length).fill(0);
        this.MezRes = new Array(Object.values(eMez).filter(value => typeof value === 'number').length).fill(0);
        this.DebuffRes = new Array(Object.values(eEffectType).filter(value => typeof value === 'number').length).fill(0);
        this.Elusivity = new Array(Object.values(eDamage).filter(value => typeof value === 'number').length).fill(0);
        if (!fullReset) return;
        this.HPRegen = 0;
        this.HPMax = 0;
        this.Absorb = 0;
        this.EndRec = 0;
        this.EndUse = 0;
        this.EndMax = 0;
        this.RunSpd = 0;
        this.JumpSpd = 0;
        this.FlySpd = 0;
        this.JumpHeight = 0;
        this.StealthPvE = 0;
        this.StealthPvP = 0;
        this.ThreatLevel = 0;
        this.Perception = 0;
        this.BuffHaste = 0;
        this.BuffAcc = 0;
        this.BuffToHit = 0;
        this.BuffDam = 0;
        this.BuffEndRdx = 0;
        this.BuffRange = 0;
    }

    public Assign(iSt: TotalStatistics)
    {
        this.Def = iSt.Def.slice();
        this.Res = iSt.Res.slice();
        this.Mez = iSt.Mez.slice();
        this.MezRes = iSt.MezRes.slice();
        this.DebuffRes = iSt.DebuffRes.slice();
        this.Elusivity = iSt.Elusivity.slice();
        this.ElusivityMax = iSt.ElusivityMax;
        this.HPRegen = iSt.HPRegen;
        this.HPMax = iSt.HPMax;
        this.Absorb = iSt.Absorb;
        this.EndRec = iSt.EndRec;
        this.EndUse = iSt.EndUse;
        this.EndMax = iSt.EndMax;
        this.RunSpd = iSt.RunSpd;
        this.MaxRunSpd = iSt.MaxRunSpd;
        this.JumpSpd = iSt.JumpSpd;
        this.MaxJumpSpd = iSt.MaxJumpSpd;
        this.FlySpd = iSt.FlySpd;
        this.MaxFlySpd = iSt.MaxFlySpd;
        this.JumpHeight = iSt.JumpHeight;
        this.StealthPvE = iSt.StealthPvE;
        this.StealthPvP = iSt.StealthPvP;
        this.ThreatLevel = iSt.ThreatLevel;
        this.Perception = iSt.Perception;
        this.BuffHaste = iSt.BuffHaste;
        this.BuffAcc = iSt.BuffAcc;
        this.BuffToHit = iSt.BuffToHit;
        this.BuffDam = iSt.BuffDam;
        this.BuffEndRdx = iSt.BuffEndRdx;
        this.BuffRange = iSt.BuffRange;
    }
}

