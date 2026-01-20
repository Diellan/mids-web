import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab, Typography } from "@mui/material";
import { useState, useMemo } from "react";

const DataViewer = () => {
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());
  const [value, setValue] = useState('info');
  const domainStore = useDomainStoreInstance();
  
  const effectsItemPairs = useMemo(
    () => domainStore.getPowerEffects(highlightedPower),
    [highlightedPower]
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
        <Typography variant="h6">{highlightedPower?.Power?.DisplayName}</Typography>
        <Typography variant="body1">{highlightedPower?.Power?.DescShort}</Typography>
        <Typography variant="body1">{highlightedPower?.Power?.DescLong}</Typography>
      </TabPanel>
      <TabPanel value="effects">
        {effectsItemPairs.length > 0 ? (
          <Box>
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
        <Typography variant="body2" color="text.secondary">
          Totals view coming soon
        </Typography>
      </TabPanel>
      <TabPanel value="enhance">
        <Typography variant="body2" color="text.secondary">
          Enhancements view coming soon
        </Typography>
      </TabPanel>
    </TabContext>
  );
};

export default DataViewer;
