import List from "@mui/material/List";
import Card from "@mui/material/Card";
import ListItem, { ListItemProps } from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material";

const PowerSlot = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(to bottom, #417cf5 0%, #203da2 2%, #18295a 4%, #203da3 50%, #103a7a 96%, #3c70e8 98%, #1c3698 100%)',
  borderRadius: 20,
  margin: theme.spacing(1),
  marginBottom: theme.spacing(8),
  paddingTop: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  position: 'relative',
  overflow: 'visible'
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

const PowerTitle = styled(Typography)(({ theme }) => ({
  textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000',
  fontWeight: 'bold',
  fontStyle: 'italic'
}));

const SlotLevel = styled(Typography)(({ theme }) => ({
  textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000',
  fontSize: '0.8rem',
  position: 'absolute',
  bottom: -5,
  width: '100%',
  textAlign: 'center',
  fontStyle: 'italic',
  left: 0
}));

const PowerEnhancer = ({ chosenPower, onPowerHover, ...prop }: { chosenPower: ChosenPower, onPowerHover: (power: ChosenPower) => void }) => {
  return (
    <PowerSlot {...prop} onMouseOver={() => onPowerHover(chosenPower)}>
      <PowerTitle
        variant='button'
      >{chosenPower.power.name}</PowerTitle>
      {chosenPower.slots.length > 0 && <Slots>
        {chosenPower.slots.map((slot, index) => (<Slot icon={slot.enhancement?.icon} key={index}>
            <SlotLevel>{slot.level}</SlotLevel>
        </Slot>))}
      </Slots>}
    </PowerSlot>
  )
};

export default PowerEnhancer;