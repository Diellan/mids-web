import { Box, Typography } from "@mui/material";
import { PairedListItem } from "@/core/GroupedFx";

interface DataViewerEffectsProps {
  effectsItemPairs: Array<{ key: any; value: PairedListItem }>;
}

const DataViewerEffects = ({ effectsItemPairs }: DataViewerEffectsProps) => {
  return effectsItemPairs.length > 0 ? (
    <Box sx={{ p: 2 }}>
      {effectsItemPairs.map((item, index) => (
        <Box key={index} sx={{ mb: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: item.value.UseUniqueColor
                ? 'primary.main'
                : item.value.UseAlternateColor
                  ? 'secondary.main'
                  : 'text.primary',
              fontWeight: 'bold'
            }}
          >
            {item.value.Name || 'Effect'}
          </Typography>
          <Typography variant="body2">{item.value.Value}</Typography>
          {item.value.ToolTip && (
            <Typography variant="caption" color="text.secondary">
              {item.value.ToolTip}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  ) : (
    <Typography variant="body2" color="text.secondary">
      No effects available
    </Typography>
  );
};

export default DataViewerEffects;