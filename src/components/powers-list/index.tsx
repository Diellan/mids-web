import Box from "@mui/material/Box";
import { styled } from "@mui/material";
import PowerEnhancer from "../power-enhancer";
import Divider from "@mui/material/Divider";
import { useMemo } from "react";
import { useDomainStore } from "@/domainStore/useDomainStore";
import Typography from "@mui/material/Typography";

const PowersGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 300px))',
});

const PowersList = () => {
  const allPowers = useDomainStore(store => store.getPowers());
  const powers = useMemo(() => allPowers.filter(p => p && p.Chosen) ?? [], [allPowers]);
  const inherentPowers = useMemo(() => allPowers.filter(p => p && !p.Chosen) ?? [], [allPowers]);
  return (
    <Box>
      <PowersGrid>
        {powers.filter(p => p !== null).map((power, index) => (
          <PowerEnhancer key={index} powerEntryId={power.id} />
        ))}
      </PowersGrid>
      <Divider />
      <Typography variant="h6" sx={{ padding: 2, textAlign: 'center' }}>Inherent Powers</Typography>
      <PowersGrid>
        {inherentPowers.filter(p => p !== null).map((power) => (
          <PowerEnhancer key={power?.Power?.PowerName} powerEntryId={power.id} />
        ))}
      </PowersGrid>
    </Box>
  )
};

export default PowersList;
