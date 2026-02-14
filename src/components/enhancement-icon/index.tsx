import { Box, styled } from '@mui/material';
import { useDomainStore } from '@/domainStore/useDomainStore';
import { IEnhancement } from '@/core/IEnhancement';
import { eType, eEnhGrade } from '@/core/Enums';
import { OriginGrade } from '@/core/Base/Data_Classes/Origin';
import AssetImage from '@/components/asset-image';

export interface EnhancementIconProps {
  enhancement: IEnhancement;
  grade?: eEnhGrade;
  size?: number;
}

interface IconContainerProps {
  iconSize: number;
}

const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'iconSize',
})<IconContainerProps>(({ iconSize }) => ({
  width: iconSize,
  height: iconSize,
  position: 'relative',
  display: 'inline-block',
}));

const EnhancementImage = styled(AssetImage)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const BorderImage = styled(AssetImage)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  pointerEvents: 'none',
});

/**
 * Converts enhancement TypeID and Grade to OriginGrade for border selection
 */
function toOriginGrade(typeId: eType, grade: eEnhGrade): OriginGrade {
  switch (typeId) {
    case eType.None:
      return OriginGrade.None;
    case eType.Normal:
      switch (grade) {
        case eEnhGrade.None:
          return OriginGrade.None;
        case eEnhGrade.TrainingO:
          return OriginGrade.TrainingO;
        case eEnhGrade.DualO:
          return OriginGrade.DualO;
        case eEnhGrade.SingleO:
          return OriginGrade.SingleO;
        default:
          return OriginGrade.None;
      }
    case eType.InventO:
      return OriginGrade.IO;
    case eType.SpecialO:
      return OriginGrade.HO;
    case eType.SetO:
      return OriginGrade.SetO;
    default:
      return OriginGrade.None;
  }
}

const EnhancementIcon = ({ enhancement, grade = eEnhGrade.None, size = 30 }: EnhancementIconProps) => {
  const origin = useDomainStore(store => store.getCharacterOrigin());

  const originGrade = toOriginGrade(enhancement.TypeID, grade);

  // Get the border filename from origin's Grades array
  let borderFilename: string | null = null;
  if (originGrade !== OriginGrade.None && origin && origin.Grades) {
    borderFilename = origin.Grades[originGrade];
  } else if (enhancement.TypeID === eType.SetO) {
    // For SetO, use the SetO border if available
    borderFilename = 'SetO';
  }

  // Build image paths
  const enhancementImagePath = enhancement.Image.indexOf('/') !== -1
    ? `./assets/${enhancement.Image}`
    : `./assets/Enhancements/${enhancement.Image}`;

  const borderImagePath = borderFilename
    ? `./assets/Overlay/${borderFilename}.png`
    : null;

  return (
    <IconContainer iconSize={size}>
      {borderImagePath && (
        <BorderImage
          src={borderImagePath}
          alt=""
        />
      )}
      <EnhancementImage
        src={enhancementImagePath}
        alt={enhancement.Name}
      />
    </IconContainer>
  );
};

export default EnhancementIcon;
