import { Box, styled, Tooltip } from '@mui/material';
import { useDomainStore } from '@/domainStore/useDomainStore';
import { IEnhancement } from '@/core/IEnhancement';
import { getImgUrl } from '@/utils/getImgUrl';

export interface EnhancementControlProps {
  enhancementId: number;
  onEnhancementClick: (enhancement: IEnhancement) => void;
}

const EnhancementContainer = styled(Box)(() => ({
  width: 100,
  height: 100,
  backgroundColor: 'lightblue',
  color: 'black',
  cursor: 'pointer',
}));

const EnhancementControl = (props: EnhancementControlProps) => {
  const { enhancementId } = props;
  const enhancement = useDomainStore(store => store.getEnhancement(enhancementId));

  if (!enhancement) {
    return;
  }

  return (
    <Tooltip title={enhancement.LongName}>
        <EnhancementContainer onClick={() => {
            props.onEnhancementClick(enhancement);
        }}>
            <img src={getImgUrl(`/src/assets/Enhancements/${enhancement.Image}`)} alt={enhancement.Name} />
        </EnhancementContainer>
    </Tooltip>
  );
};

export default EnhancementControl;