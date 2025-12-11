interface Character {
  name: string;
  archetype: Archetype;
  origin: Origin;
  primaryPowerSet: PowerSet;
  secondaryPowerSet: PowerSet;
  powerPool1: PowerSet;
  powerPool2: PowerSet;
  powerPool3: PowerSet;
  powerPool4: PowerSet;
  epicPool: PowerSet;
  powers: ChosenPower[];
  inherentPowers: ChosenPower[];
}

interface IconEntity {
  name: string;
  icon: string;
}

interface Archetype extends IconEntity {}

interface Origin extends IconEntity {}

interface PowerSet extends IconEntity {
  powers: Power[];
}

interface Power {
  name: string;
  id: string;
}

interface ChosenPower {
  power: Power;
  slots: Slot[];
  toggled: boolean;
  level: number;
}

interface Slot {
  level: number;
  enhancement: Enhancement | null;
}

interface Enhancement extends IconEntity {
  id: string;
}