import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import PowerEnhancer from "../power-enhancer";
import Divider from "@mui/material/Divider";
import { useMemo } from "react";
import { useDomainStore } from "@/domainStore/useDomainStore";
import Typography from "@mui/material/Typography";

const PowersList = () => {
  const allPowers = useDomainStore(store => store.getPowers());
  const powers = useMemo(() => allPowers.filter(p => p && p.Chosen) ?? [], [allPowers]);
  const inherentPowers = useMemo(() => allPowers.filter(p => p && !p.Chosen) ?? [], [allPowers]);
  return (
    <Paper>
      <Grid container>
        {powers.filter(p => p !== null).map((power, index) => (
          <Grid size={4} key={index} sx={{ minWidth: 235}}>
            <PowerEnhancer powerEntry={power} />
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Typography variant="h6" sx={{ padding: 2, textAlign: 'center' }}>Inherent Powers</Typography>
      <Grid container>
        {inherentPowers.filter(p => p !== null).map((power) => (
          <Grid size={4} key={power?.Power?.PowerName} sx={{ minWidth: 235}}>
            <PowerEnhancer powerEntry={power} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
};

export default PowersList;
