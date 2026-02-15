import { PropsWithChildren } from "react";
import PowerSelectorControl from "../power-selector-control";
import { IPower } from "@/core/IPower";
import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { PowerEntry } from "@/core/PowerEntry";
import { Box } from "@mui/material";

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
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'flex-start' }}>
        <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
          <PowerSelectorControl
            label='Primary Power Set'
            powersetIndex={0}
            powersetOptions={primaryPowerSetOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Box>
        <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
          <PowerSelectorControl
            label='Secondary Power Set'
            powersetIndex={1}
            powersetOptions={secondaryPowerSetOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Box>
        <Box sx={{ flex: '1 1 150px', minWidth: 150, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <PowerSelectorControl
            label='Pool 1'
            powersetIndex={3}
            powersetOptions={powerPoolOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
          <PowerSelectorControl
            label='Pool 2'
            powersetIndex={4}
            powersetOptions={powerPoolOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
          <PowerSelectorControl
            label='Pool 3'
            powersetIndex={5}
            powersetOptions={powerPoolOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
          <PowerSelectorControl
            label='Pool 4'
            powersetIndex={6}
            powersetOptions={powerPoolOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
          <PowerSelectorControl
            label='Ancillary/Epic Pool'
            powersetIndex={7}
            powersetOptions={epicPoolOptions}
            togglePower={togglePower}
            onPowerHover={onPowerHover}
          />
        </Box>
      </Box>
      {!!children && <Box>{children}</Box>}
    </Box>
  );
};

export default PowerSelectors;
