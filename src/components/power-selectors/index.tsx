import { PropsWithChildren } from "react";
import PowerSelectorControl from "../power-selector-control";
import Grid from "@mui/material/Grid";
import { IPower } from "@/core/IPower";
import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { PowerEntry } from "@/core/PowerEntry";

const PowerSelectors = ({
  children
}: PropsWithChildren) => {
  const domainStore = useDomainStoreInstance();
  const primaryPowerSetOptions = useDomainStore(store => store.getPrimaryPowerSetOptions());
  const secondaryPowerSetOptions = useDomainStore(store => store.getSecondaryPowerSetOptions());
  const powerPoolOptions = useDomainStore(store => store.getPowerPoolOptions());
  const epicPoolOptions = useDomainStore(store => store.getEpicPoolOptions());

  const togglePower = (power: IPower) => {
    domainStore.togglePower(power);
  };
  
  const onPowerHover = (power: IPower) => {
    domainStore.setHighlightedPower(new PowerEntry(power));
  };
  
  return (
    <Grid container>
      <Grid size={8} container>
        <Grid size={6}>
          <PowerSelectorControl
            label='Primary Power Set'
            powersetIndex={0}
            powersetOptions={primaryPowerSetOptions}
            setPowerset={(powerset) => {}}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Grid>
        <Grid size={6}>
          <PowerSelectorControl
            label='Secondary Power Set'
            powersetIndex={1}
            powersetOptions={secondaryPowerSetOptions}
            setPowerset={(powerset) => {}}
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
          powersetIndex={3}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 2'
          powersetIndex={4}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 3'
          powersetIndex={5}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Pool 4'
          powersetIndex={6}
          powersetOptions={powerPoolOptions}
          setPowerset={(powerset) => {}}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
        <PowerSelectorControl
          label='Ancillary/Epic Pool'
          powersetIndex={7}
          powersetOptions={epicPoolOptions}
          setPowerset={(powerset) => {}}
          togglePower={togglePower}
          onPowerHover={onPowerHover}
        />
      </Grid>
    </Grid>
  );
};

export default PowerSelectors;
