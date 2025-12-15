import Title from './title';
import CharacterSettings from './character-settings';
import MidsControls from './mids-controls';
import PowerSelectors from './power-selectors';
import PowersList from './powers-list';
import DataViewer from './data-viewer';
import { Grid, styled } from '@mui/material';

const MainContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export default function MidsBuilder() {
  return (
    <MainContainer container spacing={2}>
      <Grid size={5} container direction={'column'}>
        <Grid size={12}>
          <Title />
        </Grid>
        <Grid size={12} container direction={'row'}>
          <Grid size={6}>
            <CharacterSettings />
          </Grid>
          <Grid size={6}>
            <MidsControls />
          </Grid>
        </Grid>
        <Grid size={12}>
          <PowerSelectors>
            <DataViewer />
          </PowerSelectors>
        </Grid>
      </Grid>
      <Grid size={7} container direction={'column'}>
        <PowersList  />
      </Grid>
    </MainContainer>
  );
}

