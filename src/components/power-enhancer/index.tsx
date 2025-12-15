import List from "@mui/material/List";
import Card, { CardProps } from "@mui/material/Card";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material";
import { PowerEntry } from "@/core/PowerEntry";
import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import PowerSlotEnhancer from "../power-slot-enhancer";
import { eEnhGrade } from "@/core/Enums";

interface PowerSlotProps extends CardProps {
  highlighted?: boolean;
}

const PowerSlot = styled(Card, { shouldForwardProp: (prop) => prop !== 'highlighted' })<PowerSlotProps>(({ theme, highlighted }) => ({
  background: highlighted ?
    'linear-gradient(to bottom, #417cf5 0%, #203da2 2%, #18295a 4%, #203da3 50%, #103a7a 96%, #3c70e8 98%, #1c3698 100%)' :
    'linear-gradient(to bottom, #414747 0%, #202020 2%, #959595 4%, #dadada 50%, #7a7a7a 96%, #3c3c3c 98%, #1c1c1c 100%)',
  border: highlighted ? `2px solid ${theme.palette.primary.main}` : 'none',
  borderRadius: 20,
  margin: theme.spacing(1),
  marginBottom: theme.spacing(8),
  paddingTop: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  overflow: 'visible',
  height: 40
}));

const Slots = styled(List)(({ theme }) => ({
  position: 'absolute',
  bottom: -35,
  display: 'flex',
  flexDirection: 'row'
}));

interface SlotProps extends ListItemProps {
  icon?: string;
}

const Slot = styled(ListItem)<SlotProps>(({ theme, icon }) => ({
  backgroundColor: 'black',
  borderRadius: 20,
  width: 30,
  height: 30,
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  background: icon,
  position: 'relative'
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

const PowerEnhancer = ({ chosenPower, ...prop }: { chosenPower: PowerEntry }) => {
  const domainStore = useDomainStoreInstance();

  const setEnhancement = (enhancement: number, grade: eEnhGrade, slotIndex: number) => {
    domainStore.pickEnhancement(enhancement, grade, chosenPower.IDXPower, slotIndex);
  };

  return (
    <PowerSlot highlighted={chosenPower.NIDPower > -1} {...prop} onMouseOver={() => domainStore.setHighlightedPower(chosenPower)}>
      {chosenPower.Level > -1 && <PowerLevel>{chosenPower.Level+1}</PowerLevel>}
      <PowerTitle
        variant='button'
      >{chosenPower.Power?.DisplayName}</PowerTitle>
      {chosenPower.Power && chosenPower.Slots.length > 0 && <Slots>
        {chosenPower.Slots.map((slot, index) => (<PowerSlotEnhancer slotEntry={slot} key={index} power={chosenPower.Power!} onSetEnhancement={(enhancement, grade) => setEnhancement(enhancement, grade, index)} />))}
      </Slots>}
    </PowerSlot>
  )
};

export default PowerEnhancer;