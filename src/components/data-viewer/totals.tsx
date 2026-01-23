import { useDomainStore } from "@/domainStore/useDomainStore";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { eDamage, eMez } from "@/core/Enums";

const DataViewerTotals = () => {
  const totals = useDomainStore(store => store.getTotalStatistics());

  const formatStat = (value: number, multiplier: number = 100, suffix: string = '%') => {
    return `${(value * multiplier).toFixed(1)}${suffix}`;
  };

  const damageTypes = Object.values(eDamage).filter(v => typeof v === 'number') as eDamage[];
  const mezTypes = Object.values(eMez).filter(v => typeof v === 'number') as eMez[];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Total Statistics</Typography>

      <Grid container spacing={2}>
        {/* Defense */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Defense</Typography>
            {damageTypes.map((damageType, index) => (
              <Box key={damageType} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{eDamage[damageType]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatStat(totals.Def[index] || 0)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Resistance */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Resistance</Typography>
            {damageTypes.map((damageType, index) => (
              <Box key={damageType} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{eDamage[damageType]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatStat(totals.Res[index] || 0)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Mez */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Mez</Typography>
            {mezTypes.map((mezType, index) => (
              <Box key={mezType} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">{eMez[mezType]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {formatStat(totals.Mez[index] || 0)}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Other Stats */}
        <Grid xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Other</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">HP Regen</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {totals.HPRegen.toFixed(1)}/min
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">End Recovery</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {totals.EndRec.toFixed(1)}/min
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Run Speed</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {totals.RunSpd.toFixed(1)} mph
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Jump Height</Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {totals.JumpHeight.toFixed(1)} ft
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataViewerTotals;