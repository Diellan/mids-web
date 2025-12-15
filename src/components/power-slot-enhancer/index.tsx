import ListItem, { ListItemProps } from "@mui/material/ListItem";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material";
import { SlotEntry } from "@/core/SlotEntry";
import EnhancementPicker from "../enhancement-picker";
import { useState } from "react";
import { IPower } from "@/core/IPower";
import { eEnhGrade } from "@/core/Enums";
import { getImgUrl } from "@/utils/getImgUrl";
import { useDomainStore } from "@/domainStore/useDomainStore";

const Slot = styled(ListItem)(({ theme }) => ({
  backgroundColor: 'black',
  borderRadius: 20,
  width: 30,
  height: 30,
  margin: theme.spacing(1),
  padding: theme.spacing(1),
  position: 'relative'
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

const SlotEnhancementLevel = styled(Typography)(({ theme }) => ({
  textShadow: '-1px 0 1px #000, 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000',
  fontSize: '0.8rem',
  position: 'absolute',
  top: -5,
  width: '100%',
  textAlign: 'center',
  fontStyle: 'italic',
  left: 0
}));

const PowerSlotEnhancer = ({
  slotEntry,
  power,
  onSetEnhancement,
  ...prop
}: {
  slotEntry: SlotEntry,
  power: IPower,
  onSetEnhancement: (enhancement: number, grade: eEnhGrade) => void
}) => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = (enhancement: number | null, grade: eEnhGrade | undefined) => {
    setOpen(false);
    if (enhancement) {
      onSetEnhancement(enhancement, grade ?? eEnhGrade.None);
    }
  };

  const imageUrl = useDomainStore(store => store.getEnhancement(slotEntry.Enhancement?.Enh)?.Image);

  return (
    <>
      <Slot {...prop} onClick={handleOpen}>
        {slotEntry.Enhancement?.Enh > -1 && (<img src={getImgUrl(`/src/assets/${imageUrl}`)} alt={slotEntry.Enhancement?.Enh.toString()} />)}
        <SlotEnhancementLevel>{slotEntry.Enhancement?.RelativeLevel}</SlotEnhancementLevel>
        <SlotLevel>{slotEntry.Level+1}</SlotLevel>
      </Slot>
      <EnhancementPicker open={open} onClose={handleClose} power={power} />
    </>
  )
};

export default PowerSlotEnhancer;