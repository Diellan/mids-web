import MenuItem from "@mui/material/MenuItem";
import Select, { SelectProps } from "@mui/material/Select";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { getImgUrl } from "@/utils/getImgUrl";
import Typography from "@mui/material/Typography";

const SelectWithIcon = ({
  label,
  selected,
  options,
  ...props
}: {
  label: string,
  selected: { name: string, icon: string, key: string },
  options: { name: string, icon: string, key: string }[],
} & SelectProps) => {
  return (
    <Select
        value={selected.key}
        onChange={props.onChange}
        label={label}
        renderValue={() => (<div style={{ display: "flex", alignItems: "center" }}>
            {selected && (
              <img
                src={getImgUrl(`/src/assets/${selected.icon}`)}
                alt={selected.name}
                loading="lazy"
                width={16}
                height={16}
                style={{ marginRight: 8 }}
              />
            )}
            <Typography variant="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selected?.name}>{selected?.name}</Typography>
          </div>)}
        {...props}
    >
    {options.map(selectedOption => (
        <MenuItem value={selectedOption.key} key={selectedOption.key}>
          <ListItemIcon>
              <img
              src={getImgUrl(`/src/assets/${selectedOption.icon}`)}
              alt={selectedOption.name}
              loading="lazy"
              />
          </ListItemIcon>
          <ListItemText primary={selectedOption.name} />
        </MenuItem>
    ))}
    </Select>
  );
};

export default SelectWithIcon;
