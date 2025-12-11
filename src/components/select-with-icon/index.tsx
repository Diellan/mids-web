import MenuItem from "@mui/material/MenuItem";
import Select, { SelectProps } from "@mui/material/Select";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

function getImgUrl(name: string) {
  return new URL(`${name}`, import.meta.url).href
}

const SelectWithIcon = ({
  label,
  selected,
  options,
  ...props
}: {
  label: string,
  selected: IconEntity,
  options: IconEntity[],
} & SelectProps) => {
  return (
    <Select
        value={selected.name}
        onChange={props.onChange}
        label={label}
        renderValue={() => (<div style={{ display: "flex", alignItems: "center" }}>
            {selected && (
              <img
                src={getImgUrl(`../../assets/${selected.icon}`)}
                alt={selected.name}
                loading="lazy"
                width={16}
                height={16}
                style={{ marginRight: 8 }}
              />
            )}
            {selected?.name}
          </div>)}
        {...props}
    >
    {options.map(selectedOption => (
        <MenuItem value={selectedOption.name} key={selectedOption.name}>
        <ListItemIcon>
            <img
            src={getImgUrl(selectedOption.icon)}
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
