import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import DataViewerInfo from "./info";
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
        {highlightedPower && <DataViewerInfo power={highlightedPower} />}
      </TabPanel>
      <TabPanel value="effects">
        {effectsItemPairs.length > 0 ? (
          <Box sx={{ p: 2 }}>
            {effectsItemPairs.map((item, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: item.value.UseUniqueColor
                      ? 'primary.main'
                      : item.value.UseAlternateColor
                        ? 'secondary.main'
                        : 'text.primary',
                    fontWeight: 'bold'
                  }}
                >
                  {item.value.Name || 'Effect'}
                </Typography>
                <Typography variant="body2">{item.value.Value}</Typography>
                {item.value.ToolTip && (
                  <Typography variant="caption" color="text.secondary">
                    {item.value.ToolTip}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No effects available
          </Typography>
        )}
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
