import { useDomainStore } from "@/domainStore/useDomainStore";
import { Typography } from "@mui/material";

const Title = () => {
  const name = useDomainStore(store => store.getCharacterName());
  const archetype = useDomainStore(store => store.getCharacterArchetype());
  const origin = useDomainStore(store => store.getCharacterOrigin());
  const primaryPowerSet = useDomainStore(store => store.getPowersetByIndex(0));
  const secondaryPowerSet = useDomainStore(store => store.getPowersetByIndex(1));

  const displayName = `${name} : ${origin?.Name ?? ''} ${archetype?.DisplayName ?? ''} (${primaryPowerSet?.DisplayName ?? ''} / ${secondaryPowerSet?.DisplayName ?? ''})`;

  return <Typography variant="h6">{displayName}</Typography>;
};

export default Title;
