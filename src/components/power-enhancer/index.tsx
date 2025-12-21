import List from "@mui/material/List";
import Card, { CardProps } from "@mui/material/Card";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material";
import { PowerEntry } from "@/core/PowerEntry";
import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import PowerSlotEnhancer from "../power-slot-enhancer";
import { eEnhGrade } from "@/core/Enums";
import { getImgUrl } from "@/utils/getImgUrl";
import { useDomainStore } from "@/domainStore/useDomainStore";

interface PowerSlotProps extends CardProps {
  highlighted?: boolean;
  picked?: boolean;
}

const PowerSlot = styled(Card, { shouldForwardProp: (prop) => prop !== 'highlighted' && prop !== 'picked' })<PowerSlotProps>(({ theme, highlighted, picked }) => ({
  background: picked ?
    'linear-gradient(to bottom, #417cf5 0%, #203da2 2%, #18295a 4%, #203da3 50%, #103a7a 96%, #3c70e8 98%, #1c3698 100%)' :
    'linear-gradient(to bottom, #414747 0%, #202020 2%, #959595 4%, #dadada 50%, #7a7a7a 96%, #3c3c3c 98%, #1c1c1c 100%)',
  border: highlighted ? `2px solid ${theme.palette.primary.main}` : picked ? `2px solid ${theme.palette.secondary.main}` : 'none',
  borderRadius: 20,
  margin: theme.spacing(1),
  marginBottom: theme.spacing(8),
  paddingTop: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  overflow: 'visible',
  height: 40,
  cursor: 'grab',
  ':hover .MuiListItem-root': {
    display: 'flex'
  }
}));

const Slots = styled(List)(({ theme }) => ({
  position: 'absolute',
  bottom: -20,
  display: 'flex',
  flexDirection: 'row',
  padding: 0,
  margin: 0
}));

interface SlotProps extends ListItemProps {
  icon?: string;
}

const NewSlot = styled(ListItem)<SlotProps>(({ theme, icon }) => ({
  backgroundColor: 'black',
  borderRadius: 20,
  width: 30,
  height: 30,
  margin: theme.spacing(0.5),
  padding: 0,
  background: icon,
  position: 'relative',
  display: 'none',
  cursor: 'pointer'
}));

const PowerLevel = styled(Typography)(({ theme }) => ({
  textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000',
  fontSize: '0.8rem',
  position: 'absolute',
  top: -10,
  fontStyle: 'italic',
  left: 0
}));

const PowerTitle = styled(Typography)(({ theme }) => ({
  textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000',
  fontWeight: 'bold',
  fontStyle: 'italic'
}));

const PowerEnhancer = ({ powerEntry, ...prop }: { powerEntry: PowerEntry }) => {
  const domainStore = useDomainStoreInstance();

  const addSlot = () => {
    domainStore.addSlot(powerEntry.NIDPower);
  };
  const canPlaceSlot = useDomainStore(store => store.canPlaceSlot());
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());
  const isPicked = powerEntry.NIDPower > -1;
  const isChosen = highlightedPower?.NIDPower === powerEntry.NIDPower && isPicked;

  const setEnhancement = (enhancement: number, grade: eEnhGrade, slotIndex: number) => {
    domainStore.pickEnhancement(enhancement, grade, powerEntry.IDXPower, slotIndex);
  };

  return (
    <PowerSlot picked={isPicked} highlighted={isChosen} {...prop} onMouseOver={() => domainStore.setHighlightedPower(powerEntry)}>
      {powerEntry.Level > -1 && <PowerLevel>{powerEntry.Level+1}</PowerLevel>}
      <PowerTitle
        variant='button'
      >{powerEntry.Power?.DisplayName}</PowerTitle>
      {powerEntry.Power && powerEntry.Power.Slottable && <Slots>
        {powerEntry.Slots.map((slot, index) => (
          <PowerSlotEnhancer slotEntry={slot} key={index} power={powerEntry.Power!} onSetEnhancement={(enhancement, grade) => setEnhancement(enhancement, grade, index)} />
        ))}
        {canPlaceSlot && powerEntry.Slots.length < powerEntry.Power.MaxSlots && (<NewSlot onClick={addSlot}>
          <img src={getImgUrl(`/src/assets/Newslot.png`)} alt="None" />
        </NewSlot>)}
      </Slots>}
    </PowerSlot>
  )
};

export default PowerEnhancer;