import Title from './title';
import CharacterSettings from './character-settings';
import MidsControls from './mids-controls';
import PowerSelectors from './power-selectors';
import PowersList from './powers-list';
import DataViewer from './data-viewer';
import { Box, styled } from '@mui/material';

const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: '1 1 0',
  minWidth: 180,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const RightPanel = styled(Box)({
  flex: '2 1 0',
  minWidth: 220,
});

export default function MidsBuilder() {
  return (
    <MainContainer>
      <LeftPanel>
        <Title />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ flex: '1 1 150px' }}>
            <CharacterSettings />
          </Box>
          <Box sx={{ flex: '1 1 150px' }}>
            <MidsControls />
          </Box>
        </Box>
        <PowerSelectors>
          <DataViewer />
        </PowerSelectors>
      </LeftPanel>
      <RightPanel>
        <PowersList />
      </RightPanel>
    </MainContainer>
  );
}
