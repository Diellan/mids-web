import Title from './components/title';
import CharacterSettings from './components/character-settings';
import MidsControls from './components/mids-controls';
import PowerSelectors from './components/power-selectors';
import PowersList from './components/powers-list';
import DataViewer from './components/data-viewer';
import { useState } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Grid, styled, ThemeProvider, Toolbar, Typography } from '@mui/material';
import midsTheme from './midsTheme';

const ElectricMelee: PowerSet = {
  name: 'Electric Melee',
  icon: 'Powersets/ElectricMelee.png',
  powers: [
    {
      name: 'Charged Brawl',
      id: 'Charged Brawl'
    },
    {
      name: 'Havoc Punch',
      id: 'Havoc Punch'
    },
    {
      name: 'Jacobs Ladder',
      id: 'Jacobs Ladder'
    },
    {
      name: 'Build Up',
      id: 'Build Up'
    },
    {
      name: 'Thunder Strike',
      id: 'Thunder Strike'
    },
    {
      name: 'Taunt',
      id: 'Taunt'
    },
    {
      name: 'Chain Induction',
      id: 'Chain Induction'
    },
    {
      name: 'Lightning Clap',
      id: 'Lightning Clap'
    },
    {
      name: 'Lightning Rod',
      id: 'Lightning Rod'
    }
  ]
};

const ShieldDefense: PowerSet = {
  name: 'Shield Defense',
  icon: 'Powersets/ShieldDef.png',
  powers: [
    {
      name: 'Deflection',
      id: 'Deflection'
    },
    {
      name: 'Battle Agility',
      id: 'Battle Agility'
    },
    {
      name: 'True Grit',
      id: 'True Grit'
    },
    {
      name: 'Active Defense',
      id: 'Active Defense'
    },
    {
      name: 'Against All Odds',
      id: 'Against All Odds'
    },
    {
      name: 'Phalanx Fighting',
      id: 'Phalanx Fighting'
    },
    {
      name: 'Grant Cover',
      id: 'Grant Cover'
    },
    {
      name: 'Shield Charge',
      id: 'Shield Charge'
    },
    {
      name: 'One with the Shield',
      id: 'One with the Shield'
    }
  ]
};

const speed: PowerSet = {
  name: 'Speed',
  icon: 'Powersets/SuperSpeed.png',
  powers: [
    {
      name: 'Flurry',
      id: 'Flurry'
    },
    {
      name: 'Hasten',
      id: 'Hasten'
    },
    {
      name: 'Super Speed',
      id: 'Super Speed'
    },
    {
      name: 'Burnout',
      id: 'Burnout'
    },
    {
      name: 'Whirlwind',
      id: 'Whirlwind'
    }
  ]
};

const leaping: PowerSet = {
  name: 'Leaping',
  icon: 'Powersets/Leaping.png',
  powers: [
    {
      name: 'Jump Kick',
      id: 'Jump Kick'
    },
    {
      name: 'Combat Jumping',
      id: 'Combat Jumping'
    },
    {
      name: 'Super Jump',
      id: 'Super Jump'
    },
    {
      name: 'Acrobatics',
      id: 'Acrobatics'
    },
    {
      name: 'Spring Attack',
      id: 'Spring Attack'
    }
  ]
};

const fighting: PowerSet = {
  name: 'Fighting',
  icon: 'Powersets/Fighting.png',
  powers: [
    {
      name: 'Boxing',
      id: 'Boxing'
    },
    {
      name: 'Kick',
      id: 'Kick'
    },
    {
      name: 'Tough',
      id: 'Tough'
    },
    {
      name: 'Weave',
      id: 'Weave'
    },
    {
      name: 'Cross Punch',
      id: 'Cross Punch'
    }
  ]
};

const concealment: PowerSet = {
  name: 'Concealment',
  icon: 'Powersets/Invisibility.png',
  powers: [
    {
      name: 'Stealth',
      id: 'Stealth'
    },
    {
      name: 'Grant Invisibility',
      id: 'Grant Invisibility'
    },
    {
      name: 'Infiltration',
      id: 'Infiltration'
    },
    {
      name: 'Misdirection',
      id: 'Misdirection'
    },
    {
      name: 'Phase Shift',
      id: 'Phase Shift'
    }
  ]
};

const soulMastery: PowerSet = {
  name: 'Soul Mastery',
  icon: 'Powersets/PatronDrain.png',
  powers: [
    {
      name: 'Gloom',
      id: 'Gloom'
    },
    {
      name: 'Soul Tentacles',
      id: 'Soul Tentacles'
    },
    {
      name: 'Darkest Night',
      id: 'Darkest Night'
    },
    {
      name: 'Dark Obliteration',
      id: 'Dark Obliteration'
    },
    {
      name: 'Summon Widow',
      id: 'Summon Widow'
    }
  ]
};

const originOptions = [
  { name: 'Magic', icon: 'Origins/Magic.png' },
  { name: 'Mutation', icon: 'Origins/Mutation.png' },
  { name: 'Natural', icon: 'Origins/Natural.png' },
  { name: 'Science', icon: 'Origins/Science.png' },
  { name: 'Technology', icon: 'Origins/Technology.png' },
];

const archetypeOptions = [
  { name: 'Brute', icon: 'Archetypes/Class_Brute.png' }
];

const inherentPowers: ChosenPower[] = [
  { level: 0, slots: [
    { level: 0, enhancement: null },
    { level: 1, enhancement: { id: 'Accuracy', name: 'Accuracy', icon: 'Enhancements/Acc.png' }},
  ], toggled: false, power: { name: 'Brawl', id: 'Brawl' }}
];

const MainContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

function App() {
  const [character, setCharacter] = useState<Character>({
    name: 'Lorenzo Mondavi',
    archetype: archetypeOptions[0],
    origin: originOptions[0],
    primaryPowerSet: ElectricMelee,
    secondaryPowerSet: ShieldDefense,
    powerPool1: speed,
    powerPool2: leaping,
    powerPool3: fighting,
    powerPool4: concealment,
    epicPool: soulMastery,
    powers: [],
    inherentPowers: inherentPowers,
  });

  const togglePower = (power: Power) => {
    let powers = character.powers;
    if (powers.some(chosenPower => chosenPower.power.id === power.id)) {
      powers = character.powers.filter(chosenPower => chosenPower.power.id !== power.id);
    } else {
      powers.push({ power: power, level: 0, slots: [ { level: 0, enhancement: null } ], toggled: false });
    }
    setCharacter({ ... character, powers });
  };

  const [power, setPower] = useState<Power>();
  return (
    <ThemeProvider theme={midsTheme}>
      <CssBaseline />
      <AppBar position='static'>
        <Toolbar>
          <Typography variant="h6">Mids Hero Designer</Typography>
        </Toolbar>
      </AppBar>
      <MainContainer container spacing={2}>
        <Grid size={5} container direction={'column'}>
          <Grid size={12}>
            <Title character={character} />
          </Grid>
          <Grid size={12} container direction={'row'}>
            <Grid size={6}>
              <CharacterSettings
                name={character.name}
                archetype={character.archetype}
                origin={character.origin}
                archetypeOptions={archetypeOptions}
                originOptions={originOptions}
                setName={(name: string) => setCharacter({ ...character, name })}
                setArchetype={(archetype: string) => setCharacter({ ...character, archetype: archetypeOptions.find(at => at.name === archetype)! })}
                setOrigin={(origin: string) => setCharacter({ ...character, origin: originOptions.find(at => at.name === origin)! })}
              />
            </Grid>
            <Grid size={6}>
              <MidsControls />
            </Grid>
          </Grid>
          <Grid size={12}>
            <PowerSelectors
              character={character}
              togglePower={(power) => togglePower(power)}
              primaryPowerSetOptions={[ ElectricMelee ]}
              secondaryPowerSetOptions={[ ShieldDefense ]}
              powerPoolOptions={[ speed, leaping, fighting, concealment ]}
              epicPoolOptions={[ soulMastery ]}
              onPowerHover={setPower}
            >
              <DataViewer power={power} />
            </PowerSelectors>
          </Grid>
        </Grid>
        <Grid size={7} container direction={'column'}>
          <PowersList powers={character.powers} inherentPowers={character.inherentPowers} onPowerHover={(chosenPower: ChosenPower) => setPower(chosenPower.power)} />
        </Grid>
      </MainContainer>
    </ThemeProvider>
  );
}

export default App;