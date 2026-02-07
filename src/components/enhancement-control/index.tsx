import { Box, styled, Tooltip } from '@mui/material';
import { useDomainStore } from '@/domainStore/useDomainStore';
import { IEnhancement } from '@/core/IEnhancement';
import { eEnhGrade, eType } from '@/core/Enums';
import EnhancementIcon from '@/components/enhancement-icon';

export interface EnhancementControlProps {
  enhancementId: number;
  grade?: eEnhGrade;
  onEnhancementClick: (enhancement: IEnhancement) => void;
}

const EnhancementContainer = styled(Box)(() => ({
  width: 30,
  height: 30,
  cursor: 'pointer',
}));

/**
 * Get a default grade for display based on enhancement type
 */
function getDefaultGrade(typeId: eType): eEnhGrade {
  if (typeId === eType.Normal) {
    return eEnhGrade.SingleO;
  }
  return eEnhGrade.None;
}

const EnhancementControl = (props: EnhancementControlProps) => {
  const { enhancementId, grade } = props;
  const enhancement = useDomainStore(store => store.getEnhancement(enhancementId));

  if (!enhancement) {
    return null;
  }

  const displayGrade = grade ?? getDefaultGrade(enhancement.TypeID);

  return (
    <Tooltip title={enhancement.LongName}>
        <EnhancementContainer onClick={() => {
            props.onEnhancementClick(enhancement);
        }}>
            <EnhancementIcon enhancement={enhancement} grade={displayGrade} size={30} />
        </EnhancementContainer>
    </Tooltip>
  );
};

export default EnhancementControl;