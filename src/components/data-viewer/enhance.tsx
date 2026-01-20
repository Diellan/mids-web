import { useDomainStore } from "@/domainStore/useDomainStore";
import { Box, Typography, Grid, Paper, Chip } from "@mui/material";
import { useMemo } from "react";

const DataViewerEnhance = () => {
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());
  const domainStore = useDomainStore(store => store);

  const enhancements = useMemo(() => {
    if (!highlightedPower?.Slots) return [];

    return highlightedPower.Slots.map((slot, index) => ({
      slotIndex: index,
      enhancement: slot.Enhancement,
      level: slot.Level
    }));
  }, [highlightedPower]);

  if (!highlightedPower) {
    return <Typography variant="body2" color="text.secondary">No power selected</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Enhancements for {highlightedPower.Power?.DisplayName}
      </Typography>

      {enhancements.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No enhancements slotted</Typography>
      ) : (
        <Grid container spacing={1}>
          {enhancements.map((slot, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Slot {index + 1} (Level {slot.level + 1})
                    </Typography>
                    {slot.enhancement.Enh > -1 ? (
                      <Typography variant="body1">
                        {domainStore.getEnhancement(slot.enhancement.Enh).Name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Empty
                      </Typography>
                    )}
                  </Box>
                  {slot.enhancement.Enh > -1 && (
                    <Chip
                      label={`+${slot.enhancement.IOLevel + 1}`}
                      size="small"
                      color="primary"
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DataViewerEnhance;