import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import SelectWithIcon from "../select-with-icon";

const PowerSelectorControl = ({
  label,
  powerset,
  powersetOptions,
  setPowerset,
  selectedPowers,
  togglePower,
  onPowerHover,
}: {
  label: string,
  powerset: PowerSet,
  powersetOptions: PowerSet[],
  setPowerset: (powerset: string) => void,
  selectedPowers: ChosenPower[],
  togglePower: (power: Power) => void,
  onPowerHover: (power: Power) => void
}) => {
  return (
    <FormControl size='small' margin='dense' fullWidth>
      <InputLabel>{label}</InputLabel>
      <SelectWithIcon
        selected={powerset}
        onChange={(e) => setPowerset(e.target.value as string)}
        label={label}
        options={powersetOptions}
      />
      <List dense>
        {powerset.powers.map(power => (
          <ListItemButton
            key={power.name}
            selected={selectedPowers.some(selectedPower => selectedPower.power.id === power.id)}
            onClick={() => togglePower(power)}
            onMouseOver={() => onPowerHover(power)}
          >
            <ListItemText primary={power.name} />
          </ListItemButton>
        ))}
      </List>
    </FormControl>
  );
};

export default PowerSelectorControl;
