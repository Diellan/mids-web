import { PropsWithChildren } from "react";
import PowerSelectorControl from "../power-selector-control";
import Grid from "@mui/material/Grid";

const PowerSelectors = ({
  character,
  togglePower,
  primaryPowerSetOptions,
  secondaryPowerSetOptions,
  powerPoolOptions,
  epicPoolOptions,
  onPowerHover,
  children
}: PropsWithChildren<{
  character: Character,
  togglePower: (power: Power) => void,
  primaryPowerSetOptions: PowerSet[],
  secondaryPowerSetOptions: PowerSet[],
  powerPoolOptions: PowerSet[],
  epicPoolOptions: PowerSet[],
  onPowerHover: (power: Power) => void
}>) => {
  return (
    <Grid container>
      <Grid size={8} container>
        <Grid size={6}>
          <PowerSelectorControl
            label='Primary Power Set'
            powerset={character.primaryPowerSet}
            powersetOptions={primaryPowerSetOptions}
            setPowerset={(powerset) => {}}
            selectedPowers={character.powers}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Grid>
        <Grid size={6}>
          <PowerSelectorControl
            label='Secondary Power Set'
            powerset={character.secondaryPowerSet}
            powersetOptions={secondaryPowerSetOptions}
            setPowerset={(powerset) => {}}
            selectedPowers={character.powers}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Grid>
        <Grid size={12}>
          {children}
        </Grid>
      </Grid>
      <Grid size={4}>
        <PowerSelectorControl
          label='Pool 1'
          powerset={character.powerPool1}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          selectedPowers={character.powers}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 2'
          powerset={character.powerPool2}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          selectedPowers={character.powers}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 3'
          powerset={character.powerPool3}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          selectedPowers={character.powers}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 4'
          powerset={character.powerPool4}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          selectedPowers={character.powers}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Ancillary/Epic Pool'
          powerset={character.epicPool}
          powersetOptions={epicPoolOptions}
          setPowerset={(powerset) => {}}
          selectedPowers={character.powers}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
      </Grid>
    </Grid>
  );
};

export default PowerSelectors;
