import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import { IPower } from '@/core/IPower';
import { Box, Typography, styled } from '@mui/material';
import { eEnhGrade, ePvX, eType } from '@/core/Enums';
import { useMemo, useState } from 'react';
import { useDomainStore } from '@/domainStore/useDomainStore';
import EnhancementIcon from '@/components/enhancement-icon';
import { useDomainStoreInstance } from '@/domainStore/domainStoreContext';
import { EnhancementSet } from '@/core/EnhancementSet';
import AssetImage from '@/components/asset-image';

export interface EnhancementPickerProps {
  open: boolean;
  onClose: (enhancement: number | null, grade: eEnhGrade | undefined) => void;
  power: IPower;
}

const ACCENT = '#00bcd4';
const BG_DARK = '#1a1a2e';
const BG_PANEL = '#16213e';
const BG_HOVER = '#0f3460';
const TEXT_DIM = '#8899aa';

const PickerRoot = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: BG_DARK,
  width: 800,
  height: 540,
});

const Header = styled(Box)({
  padding: '10px 16px',
  borderBottom: `1px solid ${BG_HOVER}`,
  color: ACCENT,
  fontWeight: 'bold',
  fontSize: 15,
});

const Body = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  overflow: 'hidden',
});

const LeftPanel = styled(Box)({
  flex: '0 0 55%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${BG_HOVER}`,
  overflow: 'hidden',
});

const RightPanel = styled(Box)({
  flex: 1,
  padding: 12,
  overflowY: 'auto',
  color: '#fff',
});

const TypeTabRow = styled(Box)({
  display: 'flex',
  gap: 6,
  padding: '8px 12px',
  borderBottom: `1px solid ${BG_HOVER}`,
});

const TypeTab = styled(Box, {
  shouldForwardProp: p => p !== 'selected',
})<{ selected: boolean }>(({ selected }) => ({
  width: 44,
  height: 44,
  cursor: 'pointer',
  border: selected ? `2px solid ${ACCENT}` : '2px solid transparent',
  borderRadius: 6,
  padding: 2,
  backgroundColor: selected ? BG_HOVER : 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&:hover': { backgroundColor: BG_HOVER },
}));

const SubTypeRow = styled(Box)({
  display: 'flex',
  gap: 4,
  padding: '6px 12px',
  borderBottom: `1px solid ${BG_HOVER}`,
  flexWrap: 'wrap',
});

const SubTypeChip = styled(Box, {
  shouldForwardProp: p => p !== 'selected',
})<{ selected: boolean }>(({ selected }) => ({
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: selected ? 'bold' : 'normal',
  color: selected ? '#fff' : TEXT_DIM,
  backgroundColor: selected ? BG_HOVER : 'transparent',
  border: selected ? `1px solid ${ACCENT}` : '1px solid transparent',
  '&:hover': { backgroundColor: BG_HOVER, color: '#fff' },
}));

const GradeFrame = styled(Box)<{ grade: eEnhGrade }>(({ grade }) => {
  return {
    width: 30,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: grade === eEnhGrade.None ? `url(./assets/Overlay/IO.png)` : `url(./assets/Overlay/Training.png)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
});

const Grid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
  gap: 6,
  padding: 10,
  overflowY: 'auto',
  flex: 1,
});

const GridCell = styled(Box, {
  shouldForwardProp: p => p !== 'selected' && p !== 'disabled',
})<{ selected: boolean; disabled?: boolean }>(({ selected, disabled }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: disabled ? 'not-allowed' : 'pointer',
  padding: 6,
  borderRadius: 6,
  backgroundColor: selected ? BG_HOVER : 'transparent',
  border: selected ? `2px solid ${ACCENT}` : '2px solid transparent',
  opacity: disabled ? 0.35 : 1,
  '&:hover': disabled ? {} : { backgroundColor: BG_HOVER },
}));

const InfoBar = styled(Box)({
  padding: '8px 12px',
  borderTop: `1px solid ${BG_HOVER}`,
  backgroundColor: BG_PANEL,
  color: '#fff',
  fontSize: 12,
  minHeight: 36,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const SectionLabel = styled(Typography)({
  color: ACCENT,
  fontWeight: 'bold',
  fontSize: 12,
  textTransform: 'uppercase',
  marginTop: 12,
  marginBottom: 4,
});

const typeIconMap: Partial<Record<eType, string>> = {
  [eType.Normal]: 'Normal.png',
  [eType.InventO]: 'InventO.png',
  [eType.SpecialO]: 'HamiO.png',
  [eType.SetO]: 'SetO.png',
};

const gradeIconMap: Partial<Record<eEnhGrade, string>> = {
  [eEnhGrade.SingleO]: 'SingleO.png',
  [eEnhGrade.DualO]: 'DualO.png',
  [eEnhGrade.TrainingO]: 'TrainingO.png',
};

const EnhancementPicker = (props: EnhancementPickerProps) => {
  const { onClose, open, power } = props;

  const [selectedType, setSelectedType] = useState<eType>(eType.SetO);
  const [selectedGrade, setSelectedGrade] = useState<eEnhGrade>(eEnhGrade.SingleO);
  const [selectedSetType, setSelectedSetType] = useState<number | null>(null);
  const [selectedSet, setSelectedSet] = useState<EnhancementSet | null>(null);
  const [highlightedEnh, setHighlightedEnh] = useState<number | null>(null);
  const [highlightedSet, setHighlightedSet] = useState<EnhancementSet | null>(null);

  const domainStore = useDomainStoreInstance();

  const validEnhancements = useMemo(() => {
    if (selectedType === eType.SetO) return [];
    return power.GetValidEnhancements(selectedType);
  }, [selectedType, power]);

  const validSetTypes = power.SetTypes;

  const validSets = useMemo(() => {
    if (selectedSetType === null) return [];
    return domainStore.getEnhancementSetsByTypeId(selectedSetType);
  }, [selectedSetType, domainStore]);

  const highlightedEnhData = useDomainStore(store =>
    highlightedEnh !== null && highlightedEnh >= 0 ? store.getEnhancement(highlightedEnh) : null
  );

  // --- Build awareness: track what's already slotted ---
  // NOTE: allPowers gets a new array reference on every store notify(), which is
  // needed to bust memoization since PowerEntry objects are mutated in place.
  const allPowers = useDomainStore(store => store.getPowers());

  // Enhancement IDs slotted in this specific power
  const slottedInPower = useMemo(() => {
    const result = new Set<number>();
    const pe = allPowers.find(p => p?.Power === power);
    if (pe) {
      for (const slot of pe.Slots) {
        if (slot.Enhancement?.Enh >= 0) {
          result.add(slot.Enhancement.Enh);
        }
      }
    }
    return result;
  }, [allPowers, power]);

  // Enhancement IDs slotted anywhere in the entire build
  const slottedInBuild = useMemo(() => {
    const result = new Set<number>();
    for (const pe of allPowers) {
      if (!pe) continue;
      for (const slot of pe.Slots) {
        if (slot.Enhancement?.Enh >= 0) {
          result.add(slot.Enhancement.Enh);
        }
      }
    }
    return result;
  }, [allPowers]);

  // Count how many enhancements from a given set are slotted in this power
  const getSetSlottedCount = (set: EnhancementSet): number => {
    return set.Enhancements.filter(id => slottedInPower.has(id)).length;
  };

  // Check if an enhancement should be disabled (already slotted and can't be repeated)
  const isEnhDisabled = (enhId: number): boolean => {
    // Already slotted in this power — can't slot the same set enh twice in one power
    if (slottedInPower.has(enhId)) return true;
    // Unique enhancements can't be slotted twice anywhere in the build
    const enh = domainStore.getEnhancement(enhId);
    if (enh?.Unique && slottedInBuild.has(enhId)) return true;
    return false;
  };

  const handleTypeChange = (type: eType) => {
    setSelectedType(type);
    setSelectedSetType(null);
    setSelectedSet(null);
    setHighlightedEnh(null);
    setHighlightedSet(null);
    if (type === eType.Normal) setSelectedGrade(eEnhGrade.SingleO);
  };

  const handleSelectEnhancement = (enhId: number) => {
    const grade = selectedType === eType.Normal ? selectedGrade : undefined;
    onClose(enhId, grade);
  };

  const handleClose = () => onClose(null, undefined);

  // --- Left panel: type tabs ---
  const renderTypeTabs = () => (
    <TypeTabRow>
      {([eType.Normal, eType.InventO, eType.SpecialO, eType.SetO] as eType[]).map(type => (
        <TypeTab key={type} selected={selectedType === type} onClick={() => handleTypeChange(type)} title={eType[type]}>
          <AssetImage src={`./assets/Sets/${typeIconMap[type]}`} alt={eType[type]} style={{ width: 36, height: 36 }} />
        </TypeTab>
      ))}
    </TypeTabRow>
  );

  // --- Left panel: set type filter chips ---
  const renderSetTypeChips = () => {
    if (selectedType !== eType.SetO) return null;
    if (selectedSet) {
      return (
        <SubTypeRow>
          <SubTypeChip selected={false} onClick={() => { setSelectedSet(null); setHighlightedEnh(null); }}>
            &larr; Back to Sets
          </SubTypeChip>
          <SubTypeChip selected={true}>
            {selectedSet.DisplayName}
          </SubTypeChip>
        </SubTypeRow>
      );
    }
    return (
      <SubTypeRow>
        {validSetTypes.map(typeId => {
          const info = domainStore.getSetType(typeId);
          return (
            <SubTypeChip
              key={typeId}
              selected={selectedSetType === typeId}
              onClick={() => { setSelectedSetType(typeId); setHighlightedSet(null); }}
              title={info?.Name ?? `Type ${typeId}`}
            >
              <AssetImage src={`./assets/Sets/${info?.ShortName ?? 'Untyped'}.png`} alt={info?.Name} style={{ width: 30, height: 30 }} />
            </SubTypeChip>
          );
        })}
      </SubTypeRow>
    );
  };

  // --- Left panel: grade chips for Normal ---
  const renderGradeChips = () => {
    if (selectedType !== eType.Normal) return null;
    return (
      <SubTypeRow>
        {([eEnhGrade.TrainingO, eEnhGrade.DualO, eEnhGrade.SingleO] as eEnhGrade[]).map(grade => (
          <SubTypeChip key={grade} selected={selectedGrade === grade} onClick={() => setSelectedGrade(grade)} title={eEnhGrade[grade]}>
            <GradeFrame grade={grade}>
                <AssetImage src={`./assets/Sets/${gradeIconMap[grade]}`} alt={eEnhGrade[grade]} style={{ width: 36, height: 36 }} />
            </GradeFrame>
          </SubTypeChip>
        ))}
      </SubTypeRow>
    );
  };

  // --- Left panel: grid ---
  const renderGrid = () => {
    // SetO with a set selected: show individual enhancements from that set
    if (selectedType === eType.SetO && selectedSet) {
      return (
        <Grid>
          {selectedSet.Enhancements.map(enhId => {
            const enh = domainStore.getEnhancement(enhId);
            if (!enh) return null;
            const disabled = isEnhDisabled(enhId);
            return (
              <GridCell
                key={enhId}
                selected={highlightedEnh === enhId}
                disabled={disabled}
                onClick={() => { setHighlightedEnh(enhId); setHighlightedSet(null); }}
                onDoubleClick={disabled ? undefined : () => handleSelectEnhancement(enhId)}
                title={disabled ? `${enh.LongName} (already slotted)` : enh.LongName}
              >
                <EnhancementIcon enhancement={enh} size={30} />
                <Typography variant="caption" style={{ color: disabled ? '#666' : '#ccc', textAlign: 'center', wordBreak: 'break-all' }}>
                  {enh.ShortName}
                </Typography>
              </GridCell>
            );
          })}
        </Grid>
      );
    }

    // SetO without a set selected: show set icons
    if (selectedType === eType.SetO) {
      return (
        <Grid>
          {validSets.map(set => (
            <GridCell
              key={set.Uid}
              selected={highlightedSet?.Uid === set.Uid}
              onClick={() => { setHighlightedSet(set); setHighlightedEnh(null); }}
              onDoubleClick={() => { setSelectedSet(set); setHighlightedEnh(null); }}
              title={set.DisplayName}
            >
                <GradeFrame grade={eEnhGrade.None}>
                    <AssetImage
                        src={`./assets/Enhancements/${set.Image}`}
                        alt={set.DisplayName}
                        style={{ width: 30, height: 30 }}
                        onError={e => { (e.target as HTMLImageElement).src = './assets/Sets/None.png'; }}
                    />
                </GradeFrame>
              <Typography variant="caption" style={{ color: '#ccc', textAlign: 'center' }}>
                {set.DisplayName}
                </Typography>
            </GridCell>
          ))}
        </Grid>
      );
    }

    // Normal / InventO / SpecialO: show enhancement icons
    return (
      <Grid>
        {validEnhancements.map(enhId => {
          const enh = domainStore.getEnhancement(enhId);
          if (!enh) return null;
          return (
            <GridCell
              key={enhId}
              selected={highlightedEnh === enhId}
              onClick={() => { setHighlightedEnh(enhId); setHighlightedSet(null); }}
              onDoubleClick={() => handleSelectEnhancement(enhId)}
                title={enh.LongName}
            >
              <EnhancementIcon
                enhancement={enh}
                grade={selectedType === eType.Normal ? selectedGrade : eEnhGrade.None}
                size={48}
              />
            </GridCell>
          );
        })}
      </Grid>
    );
  };

  // --- Left panel: info bar ---
  const renderInfoBar = () => {
    if (highlightedSet) {
      const setType = domainStore.getSetType(highlightedSet.SetType);
      return (
        <InfoBar>
          <span style={{ fontWeight: 'bold' }}>{highlightedSet.DisplayName}</span>
          <span style={{ color: TEXT_DIM }}>|</span>
          <span style={{ color: TEXT_DIM }}>{setType?.Name}</span>
          <span style={{ color: TEXT_DIM }}>|</span>
          <span style={{ color: TEXT_DIM }}>Lvl {highlightedSet.LevelMin + 1}-{highlightedSet.LevelMax + 1}</span>
        </InfoBar>
      );
    }
    if (highlightedEnhData) {
      return (
        <InfoBar>
          <span style={{ fontWeight: 'bold' }}>{highlightedEnhData.LongName}</span>
          <span style={{ color: TEXT_DIM }}>|</span>
          <span style={{ color: TEXT_DIM }}>Lvl {highlightedEnhData.LevelMin + 1}-{highlightedEnhData.LevelMax + 1}</span>
        </InfoBar>
      );
    }
    return <InfoBar><span style={{ color: TEXT_DIM }}>Select an item to view details</span></InfoBar>;
  };

  // --- Right panel: set detail ---
  const renderSetDetail = (set: EnhancementSet) => {
    const setType = domainStore.getSetType(set.SetType);
    const slottedCount = getSetSlottedCount(set);
    return (
      <>
        <Typography sx={{ fontSize: 16, fontWeight: 'bold', mb: 1 }}>{set.DisplayName}</Typography>
        <SectionLabel>Set Type: {setType?.Name}</SectionLabel>
        <Typography sx={{ fontSize: 12, color: TEXT_DIM }}>Level Range: {set.LevelMin + 1} to {set.LevelMax + 1}</Typography>

        <SectionLabel>Set: {set.DisplayName} ({slottedCount}/{set.Enhancements.length})</SectionLabel>
        {set.Enhancements.map(enhId => {
          const enh = domainStore.getEnhancement(enhId);
          const isSlotted = slottedInPower.has(enhId);
          return (
            <Typography key={enhId} sx={{ fontSize: 12, color: isSlotted ? '#4caf50' : '#888', pl: 1, py: 0.25, fontWeight: isSlotted ? 'bold' : 'normal' }}>
              {isSlotted ? '\u2713 ' : '\u2022 '}{enh?.LongName ?? enh?.Name}
            </Typography>
          );
        })}

        <SectionLabel>Set Bonus:</SectionLabel>
        {set.Bonus.map((bonus, i) => {
          const effectStr = set.GetEffectString(i, false);
          if (!effectStr) return null;
          const pvpTag = bonus.PvMode === ePvX.PvP ? ' [PvP]' : '';
          const isActive = slottedCount >= bonus.Slotted;
          return (
            <Typography key={i} sx={{ fontSize: 11, color: isActive ? '#4caf50' : '#666', pl: 1, py: 0.25, fontWeight: isActive ? 'bold' : 'normal' }}>
              ({bonus.Slotted}) {effectStr}{pvpTag}
            </Typography>
          );
        })}
        {set.SpecialBonus.map((_bonus, i) => {
          const effectStr = set.GetEffectString(i, true);
          if (!effectStr) return null;
          const enhIdx = set.Enhancements[i];
          const enhName = enhIdx >= 0 ? domainStore.getEnhancement(enhIdx)?.Name : '';
          const isSlotted = enhIdx >= 0 && slottedInPower.has(enhIdx);
          return (
            <Typography key={`sp-${i}`} sx={{ fontSize: 11, color: isSlotted ? '#4caf50' : ACCENT, pl: 1, py: 0.25, fontWeight: isSlotted ? 'bold' : 'normal' }}>
              {enhName}: {effectStr}
            </Typography>
          );
        })}

        <Button
          variant="contained"
          size="small"
          fullWidth
          sx={{ mt: 2, backgroundColor: ACCENT, color: '#000', '&:hover': { backgroundColor: '#00e5ff' } }}
          onClick={() => { setSelectedSet(set); setHighlightedEnh(null); }}
        >
          Choose Enhancement
        </Button>
      </>
    );
  };

  // --- Right panel: enhancement detail ---
  const renderEnhDetail = (enhId: number) => {
    const enh = domainStore.getEnhancement(enhId);
    if (!enh) return null;

    const enhSet = enh.GetEnhancementSet();
    const setSlottedCount = enhSet ? getSetSlottedCount(enhSet) : 0;
    const disabled = isEnhDisabled(enhId);

    return (
      <>
        <Typography sx={{ fontSize: 16, fontWeight: 'bold', mb: 1 }}>{enh.LongName}</Typography>
        {disabled && (
          <Typography sx={{ fontSize: 11, color: '#f44336', mb: 1 }}>Already slotted</Typography>
        )}
        {enh.Desc && <Typography sx={{ fontSize: 12, color: TEXT_DIM, mb: 1 }}>{enh.Desc}</Typography>}
        <Typography sx={{ fontSize: 12, color: TEXT_DIM }}>Level: {enh.LevelMin + 1} to {enh.LevelMax + 1}</Typography>

        {enhSet && (
          <>
            <SectionLabel>Set: {enhSet.DisplayName} ({setSlottedCount}/{enhSet.Enhancements.length})</SectionLabel>
            {enhSet.Enhancements.map(setEnhId => {
              const setEnh = domainStore.getEnhancement(setEnhId);
              const isSlotted = slottedInPower.has(setEnhId);
              const isCurrent = setEnhId === enhId;
              return (
                <Typography
                  key={setEnhId}
                  sx={{
                    fontSize: 12,
                    pl: 1,
                    py: 0.25,
                    color: isSlotted ? '#4caf50' : isCurrent ? '#fff' : '#888',
                    fontWeight: isSlotted || isCurrent ? 'bold' : 'normal',
                  }}
                >
                  {isSlotted ? '\u2713 ' : '\u2022 '}{setEnh?.LongName ?? setEnh?.Name}
                </Typography>
              );
            })}

            <SectionLabel>Set Bonus:</SectionLabel>
            {enhSet.Bonus.map((bonus, i) => {
              const effectStr = enhSet.GetEffectString(i, false);
              if (!effectStr) return null;
              const pvpTag = bonus.PvMode === ePvX.PvP ? ' [PvP]' : '';
              const isActive = setSlottedCount >= bonus.Slotted;
              return (
                <Typography key={i} sx={{ fontSize: 11, color: isActive ? '#4caf50' : '#666', pl: 1, py: 0.25, fontWeight: isActive ? 'bold' : 'normal' }}>
                  ({bonus.Slotted}) {effectStr}{pvpTag}
                </Typography>
              );
            })}
          </>
        )}

        <Button
          variant="contained"
          size="small"
          fullWidth
          disabled={disabled}
          sx={{ mt: 2, backgroundColor: ACCENT, color: '#000', '&:hover': { backgroundColor: '#00e5ff' } }}
          onClick={() => handleSelectEnhancement(enhId)}
        >
          {disabled ? 'Already Slotted' : 'Select Enhancement'}
        </Button>
      </>
    );
  };

  // --- Right panel ---
  const renderDetailPanel = () => {
    if (highlightedEnh !== null) return renderEnhDetail(highlightedEnh);
    if (highlightedSet) return renderSetDetail(highlightedSet);
    return <Typography sx={{ color: TEXT_DIM, mt: 4, textAlign: 'center', fontSize: 13 }}>Select an item to view details</Typography>;
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth={false} slotProps={{ paper: { sx: { backgroundColor: BG_DARK, overflow: 'hidden' } } }}>
      <PickerRoot>
        <Header>Enhancing: {power.DisplayName}</Header>
        <Body>
          <LeftPanel>
            {renderTypeTabs()}
            {renderGradeChips()}
            {renderSetTypeChips()}
            {renderGrid()}
            {renderInfoBar()}
          </LeftPanel>
          <RightPanel>
            {renderDetailPanel()}
          </RightPanel>
        </Body>
      </PickerRoot>
    </Dialog>
  );
};

export default EnhancementPicker;
