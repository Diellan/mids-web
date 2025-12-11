import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import PowerEnhancer from "../power-enhancer";
import Divider from "@mui/material/Divider";

const PowersList = ({ powers, inherentPowers, onPowerHover }: { powers: ChosenPower[], inherentPowers: ChosenPower[], onPowerHover: (power: ChosenPower) => void }) => {
  return (
    <Paper>
      <Grid container>
        {powers.map((power) => (
          <Grid size={4} key={power.power.id}>
            <PowerEnhancer chosenPower={power} onPowerHover={onPowerHover} />
          </Grid>
        ))}
      </Grid>
      <Divider />
      <Grid container>
        {inherentPowers.map((power) => (
          <Grid size={4} key={power.power.id}>
            <PowerEnhancer chosenPower={power} onPowerHover={onPowerHover} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
};

export default PowersList;
