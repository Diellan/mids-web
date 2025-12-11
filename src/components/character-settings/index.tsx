import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import SelectWithIcon from "../select-with-icon";

const CharacterSettings = ({
  name, archetype, origin, archetypeOptions, originOptions, setName, setArchetype, setOrigin
}: {
  name: string,
  archetype: Archetype,
  origin: Origin,
  archetypeOptions: Archetype[],
  originOptions: Origin[],
  setName: (name: string) => void,
  setArchetype: (archetype: string) => void,
  setOrigin: (origin: string) => void
}) => {
  return (
    <div>
      <FormControl fullWidth margin='normal' size='small'>
        <TextField variant="outlined" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl fullWidth margin='normal' size='small'>
        <InputLabel>Archetype</InputLabel>
        <SelectWithIcon
          selected={archetype}
          onChange={(e) => setArchetype(e.target.value as string)}
          label="Archetype"
          options={archetypeOptions}
        />
      </FormControl>
      <FormControl fullWidth margin='normal' size='small'>
        <InputLabel>Origin</InputLabel>
        <SelectWithIcon
          selected={origin}
          onChange={(e) => setOrigin(e.target.value as string)}
          label="Origin"
          options={originOptions}
        />
      </FormControl>
    </div>
  );
};

export default CharacterSettings;