import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import SelectWithIcon from "../select-with-icon";
import { IPowerset } from "@/core/IPowerset";
import { IPower } from "@/core/IPower";
import { useDomainStore } from "@/domainStore/useDomainStore";

const PowerSelectorControl = ({
  label,
  powersetIndex,
  powersetOptions,
  setPowerset,
  togglePower,
  onPowerHover,
}: {
  label: string,
  powersetIndex: number,
  powersetOptions: IPowerset[],
  setPowerset: (powerset: string) => void,
  togglePower: (power: IPower) => void,
  onPowerHover: (power: IPower) => void
}) => {
  const powerset = useDomainStore(store => store.getPowersetByIndex(powersetIndex));
  const powers = useDomainStore(store => store.getPowers());
  const powerNames = new Set(powers.filter(p => p?.NIDPowerset === powerset?.nID).map(p => p?.NIDPower).filter(Boolean));
  console.log('powerNames', powerset?.nID, powerset?.DisplayName, powerNames);
  

  return (
    <FormControl size='small' margin='dense' fullWidth>
      <InputLabel>{label}</InputLabel>
      <SelectWithIcon
        selected={{ name: powerset?.DisplayName ?? '', icon: `Powersets/${powerset?.ImageName ?? ''}`, key: powerset?.SetName ?? '' }}
        onChange={(e) => setPowerset(e.target.value as string)}
        label={label}
        options={powersetOptions
          .filter(powerset => powerset !== null)
          .map(powerset => ({ 
            name: powerset.DisplayName, 
            icon: `Powersets/${powerset.ImageName}`, 
            key: powerset.SetName 
          }))}
      />
      <List dense>
        {powerset?.Powers.filter(power => power !== null).map(power => (
          <ListItemButton
            key={power?.PowerName ?? ''}
            selected={power?.PowerIndex ? powerNames.has(power.PowerIndex) : false}
            onClick={() => togglePower(power!)}
            onMouseOver={() => onPowerHover(power!)}
          >
            <ListItemText primary={power?.DisplayName ?? ''} />
          </ListItemButton>
        ))}
      </List>
    </FormControl>
  );
};

export default PowerSelectorControl;
