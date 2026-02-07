import { PowerEntry } from "@/core/PowerEntry";
import { Typography, Box, Grid, Paper } from "@mui/material";
import { useMemo } from "react";
import { useDomainStore } from "@/domainStore/useDomainStore";

interface DataItem {
  label: string;
  baseValue: string | number;
  enhancedValue: string | number;
  suffix?: string;
  tooltip?: string;
}

const DataViewerInfo = ({ power }: { power: PowerEntry }) => {
    const domainStore = useDomainStore(store => store);
    const basePower = useDomainStore(store => store.getBasePower());
    const enhancedPower = useDomainStore(store => store.getEnhancedPower());
  const dataItems = useMemo((): DataItem[] => {
    if (!power?.Power || !basePower) return [];
    const pBase = basePower;
    const pEnh = enhancedPower ?? pBase; // For now, using same power

    const items: DataItem[] = [];

    // End Cost
    const suffix1 = pBase.PowerType !== 1 ? "" : "/s"; // Assuming PowerType.Toggle = 1
    let tip1 = "";
    if (pBase.PowerType === 0) { // Click
      if (pEnh.ToggleCost > 0 && pEnh.RechargeTime + pEnh.CastTime + pEnh.InterruptTime > 0) {
        tip1 = `Effective end drain per second: ${(pEnh.ToggleCost / (pEnh.RechargeTime + pEnh.CastTime + pEnh.InterruptTime)).toFixed(2)}/s`;
      }
    }
    items.push({
      label: "End Cost",
      baseValue: pBase.ToggleCost,
      enhancedValue: pEnh.ToggleCost,
      suffix: suffix1,
      tooltip: tip1
    });

    // Accuracy (simplified)
    if (pBase.Accuracy > 0) {
      items.push({
        label: "Accuracy",
        baseValue: (pBase.Accuracy * 100).toFixed(1),
        enhancedValue: (pEnh.Accuracy * 100).toFixed(1),
        suffix: "%"
      });
    }

    // Recharge Time
    items.push({
      label: "Recharge",
      baseValue: pBase.RechargeTime,
      enhancedValue: pEnh.RechargeTime,
      suffix: "s"
    });

    // Cast Time
    if (pBase.CastTime > 0) {
      items.push({
        label: "Cast Time",
        baseValue: pBase.CastTime,
        enhancedValue: pEnh.CastTime,
        suffix: "s"
      });
    }

    // Range
    if (pBase.Range > 0) {
      items.push({
        label: "Range",
        baseValue: pBase.Range,
        enhancedValue: pEnh.Range,
        suffix: "ft"
      });
    }

    return items;
  }, [power, domainStore]);

  if (!power?.Power) {
    return <Typography variant="body2" color="text.secondary">No power selected</Typography>;
  }

  const pBase = power.Power;
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        [{power.Level + 1}] {pBase.DisplayName}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
        {pBase.DescShort}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {pBase.DescLong}
      </Typography>

      <Grid container spacing={2}>
        {dataItems.map((item, index) => (
          <Grid key={index}>
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {item.label}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {typeof item.enhancedValue === 'number' ? item.enhancedValue.toFixed(2) : item.enhancedValue}
                  {item.suffix}
                </Typography>
                {item.baseValue !== item.enhancedValue && (
                  <Typography variant="caption" color="text.secondary">
                    Base: {typeof item.baseValue === 'number' ? item.baseValue.toFixed(2) : item.baseValue}
                    {item.suffix}
                  </Typography>
                )}
              </Box>
              {item.tooltip && (
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {item.tooltip}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DataViewerInfo;