import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { IPower } from '@/core/IPower';
import { Box, DialogContent, styled } from '@mui/material';
import { eEnhGrade, eType } from '@/core/Enums';
import { useMemo, useState } from 'react';
import { useDomainStore } from '@/domainStore/useDomainStore';
import { TypeGrade } from '@/core/Utils/StructAndEnums';
import EnhancementControl from '../enhancement-control';
import { useDomainStoreInstance } from '@/domainStore/domainStoreContext';
import { EnhancementSet } from '@/core/EnhancementSet';

export interface EnhancementPickerProps {
  open: boolean;
  onClose: (enhancement: number | null, grade: eEnhGrade | undefined) => void;
  power: IPower;
}

interface EnhancementTypeProps {
  selected: boolean;
}

const EnhancementTypes = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: 10,
});

const EnhancementType = styled(Button)<EnhancementTypeProps>(({ selected }) => ({
  width: 100,
  height: 100,
  backgroundColor: selected ? 'lightblue' : 'white',
  color: selected ? 'black' : 'black',
}));

interface EnhancementSubTypeProps {
    selected: boolean;
}

const EnhancementSubTypes = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: 10,
});

const EnhancementSubType = styled(Button)<EnhancementSubTypeProps>(({ selected }) => ({
  width: 100,
  height: 100,
  backgroundColor: selected ? 'lightblue' : 'white',
  color: selected ? 'black' : 'black',
}));

const Enhancements = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: 10,
});

const EnhancementPicker = (props: EnhancementPickerProps) => {
  const { onClose, open, power } = props;
  const [selectedType, setSelectedType] = useState<eType>(eType.None);
  const [selectedSubType, setSelectedSubType] = useState<eEnhGrade>(eEnhGrade.None);
  const [selectedSpecialType, setSelectedSpecialType] = useState<TypeGrade | null>(null);
  const [selectedSetType, setSelectedSetType] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<EnhancementSet | null>(null);

  const specialTypes = useDomainStore(store => store.getSpecialTypes());
  const domainStore = useDomainStoreInstance();

  const validNormalEnhancements = power.GetValidEnhancements(eType.Normal);
  const validInventOEnhancements = power.GetValidEnhancements(eType.InventO);
  const validSpecialEnhancements = power.GetValidEnhancements(eType.SpecialO);
  const validSetTypes = power.SetTypes;
  const validSets = useMemo(() => {
    return domainStore.getEnhancementSetsByTypeId(selectedSetType ?? 0);
  }, [selectedSetType]);

  return (
    <Dialog onClose={() => onClose(null, undefined)} open={open}>
      <DialogTitle>Enhancing: {power.DisplayName}</DialogTitle>
      <DialogContent>
        <EnhancementTypes>
            {Object.values(eType).filter(type => typeof type === 'number').map((type) => (
                <EnhancementType key={type} onClick={() => setSelectedType(type as eType)} selected={selectedType === type as eType}>
                    {eType[type].toString()}
                </EnhancementType>
            ))}
        </EnhancementTypes>
        {selectedType === eType.Normal && (
            <>
                <EnhancementSubTypes>
                    {Object.values(eEnhGrade).filter(grade => typeof grade === 'number').map((grade) => (
                        <EnhancementSubType key={grade} onClick={() => setSelectedSubType(grade as eEnhGrade)} selected={selectedSubType === grade as eEnhGrade}>
                            {eEnhGrade[grade].toString()}
                        </EnhancementSubType>
                    ))}
                </EnhancementSubTypes>
                <Enhancements>
                    {validNormalEnhancements.map((validEnhancement) => (
                        <EnhancementControl enhancementId={validEnhancement} key={validEnhancement} onEnhancementClick={() => onClose(validEnhancement, selectedSubType)} />
                    ))}
                </Enhancements>
            </>
        )}
        {selectedType === eType.InventO && (
            <>
                <Enhancements>
                    {validInventOEnhancements.map((validInventOEnhancement) => (
                        <EnhancementControl enhancementId={validInventOEnhancement} key={validInventOEnhancement} onEnhancementClick={() => onClose(validInventOEnhancement, selectedSubType)} />
                    ))}
                </Enhancements>
            </>
        )}
        {selectedType === eType.SpecialO && (
            <>
                <EnhancementSubTypes>
                    {specialTypes.map((specialType) => (
                        <EnhancementSubType key={specialType.ShortName} onClick={() => setSelectedSpecialType(specialType)} selected={selectedSpecialType === specialType}>
                            {specialType.Name}
                        </EnhancementSubType>
                    ))}
                </EnhancementSubTypes>
                <Enhancements>
                    {validSpecialEnhancements.map((validSpecialEnhancement) => (
                        <EnhancementControl enhancementId={validSpecialEnhancement} key={validSpecialEnhancement} onEnhancementClick={() => onClose(validSpecialEnhancement, selectedSubType)} />
                    ))}
                </Enhancements>
            </>
        )}
        {selectedType === eType.SetO && (
            <>
                <EnhancementSubTypes>
                    {validSetTypes.map((setType) => (
                        <EnhancementSubType key={setType} onClick={() => setSelectedSetType(setType)} selected={selectedSetType === setType}>
                            {domainStore.getSetType(setType)?.Name}
                        </EnhancementSubType>
                    ))}
                </EnhancementSubTypes>
                <EnhancementSubTypes>
                    {validSets.map((validSet) => (
                        <EnhancementSubType key={validSet.Uid} onClick={() => setSelectedSet(validSet)} selected={selectedSet === validSet}>
                            {validSet.DisplayName}
                        </EnhancementSubType>
                    ))}
                </EnhancementSubTypes>
                <Enhancements>
                    {selectedSet?.Enhancements.map((enhancement) => (
                        <EnhancementControl enhancementId={enhancement} key={enhancement} onEnhancementClick={() => onClose(enhancement, selectedSubType)} />
                    ))}
                </Enhancements>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancementPicker;