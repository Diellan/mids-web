import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import DataViewerInfo from "./info";
import DataViewerEffects from "./effects";
import DataViewerTotals from "./totals";
import DataViewerEnhance from "./enhance";

const DataViewer = () => {
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());

  const [value, setValue] = useState('info');
  const domainStore = useDomainStoreInstance();

  const effectsItemPairs = useMemo(
    () => domainStore.getPowerEffects(highlightedPower),
    [highlightedPower, domainStore]
  );

  if (!highlightedPower) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No power selected
        </Typography>
      </Box>
    );
  }

  return (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(_, newValue) => setValue(newValue)} aria-label="data viewer tabs" variant="fullWidth">
          <Tab label="Info" value="info" />
          <Tab label="Effects" value="effects" />
          <Tab label="Totals" value="totals" />
          <Tab label="Enhance" value="enhance" />
        </TabList>
      </Box>
      <TabPanel value="info">
        <DataViewerInfo power={highlightedPower} />
      </TabPanel>
      <TabPanel value="effects">
        <DataViewerEffects effectsItemPairs={effectsItemPairs} />
      </TabPanel>
      <TabPanel value="totals">
        <DataViewerTotals />
      </TabPanel>
      <TabPanel value="enhance">
        <DataViewerEnhance />
      </TabPanel>
    </TabContext>
  );
};

export default DataViewer;
