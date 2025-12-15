import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import SelectWithIcon from "../select-with-icon";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";

const CharacterSettings = () => {
  const name = useDomainStore(store => store.getCharacterName());
  const archetype = useDomainStore(store => store.getCharacterArchetype());
  const origin = useDomainStore(store => store.getCharacterOrigin());
  const archetypeOptions = useDomainStore(store => store.getArchetypeOptions());
  const originOptions = useDomainStore(store => store.getOriginOptions());
  const store = useDomainStoreInstance();

  const handleArchetypeChange = (value: string) => {
    const found = archetypeOptions.find(at => at.DisplayName === value);
    if (found) {
      store.setCharacterArchetype(found);
    }
  };

  const handleOriginChange = (value: string) => {
    const found = originOptions.find(o => o.Name === value);
    if (found) {
      store.setCharacterOrigin(found);
    }
  };

  return (
    <div>
      <FormControl fullWidth margin='normal' size='small'>
        <TextField variant="outlined" label="Name" value={name} onChange={(e) => store.setCharacterName(e.target.value)} />
      </FormControl>
      <FormControl fullWidth margin='normal' size='small'>
        <InputLabel>Archetype</InputLabel>
        <SelectWithIcon
          selected={{ name: archetype?.DisplayName ?? 'test', icon: `Archetypes/${archetype?.ClassName ?? ''}.png`, key: archetype?.ClassName ?? '' }}
          onChange={(e) => handleArchetypeChange(e.target.value as string)}
          label="Archetype"
          options={archetypeOptions.map(archetype => ({ name: archetype.DisplayName, icon: `Archetypes/${archetype.ClassName}.png`, key: archetype.ClassName }))}
        />
      </FormControl>
      <FormControl fullWidth margin='normal' size='small'>
        <InputLabel>Origin</InputLabel>
        <SelectWithIcon
          selected={{ name: origin?.Name ?? '', icon: `Origins/${origin?.Name ?? ''}.png`, key: origin?.Name ?? '' }}
          onChange={(e) => handleOriginChange(e.target.value as string)}
          label="Origin"
          options={originOptions.map(origin => ({ name: origin.Name, icon: `Origins/${origin.Name}.png`, key: origin.Name }))}
        />
      </FormControl>
    </div>
  );
};

export default CharacterSettings;