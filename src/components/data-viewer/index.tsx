import { useDomainStoreInstance } from "@/domainStore/domainStoreContext";
import { useDomainStore } from "@/domainStore/useDomainStore";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, IconButton, Paper, Tab, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import DataViewerInfo from "./info";
import DataViewerEffects from "./effects";
import DataViewerTotals from "./totals";
import DataViewerEnhance from "./enhance";

const DataViewer = () => {
  const highlightedPower = useDomainStore(store => store.getHighlightedPower());

  const [value, setValue] = useState('info');
  const domainStore = useDomainStoreInstance();
  const [isDocked, setIsDocked] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const initialized = useRef(false);

  useEffect(() => {
    if (!isDocked && !initialized.current) {
      setPosition({
        x: Math.round((window.innerWidth - 420) / 2),
        y: Math.round((window.innerHeight - 380) / 2),
      });
      initialized.current = true;
    }
    if (isDocked) {
      initialized.current = false;
    }
  }, [isDocked]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  }, [position]);

  useEffect(() => {
    if (isDocked) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };

    const onMouseUp = () => {
      dragging.current = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDocked]);

  const effectsItemPairs = useMemo(
    () => domainStore.getPowerEffects(highlightedPower),
    [highlightedPower, domainStore]
  );

  const undockButton = (
    <IconButton
      size="small"
      onClick={() => setIsDocked(false)}
      title="Undock"
      sx={{ position: 'absolute', right: 4, top: 4, zIndex: 1 }}
    >
      <OpenInNewIcon fontSize="small" />
    </IconButton>
  );

  const dockButton = (
    <IconButton size="small" onClick={() => setIsDocked(true)} title="Dock">
      <PushPinIcon fontSize="small" />
    </IconButton>
  );

  const content = !highlightedPower ? (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary">
        No power selected
      </Typography>
    </Box>
  ) : (
    <TabContext value={value}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList onChange={(_, newValue) => setValue(newValue)} aria-label="data viewer tabs" variant="fullWidth">
          <Tab label="Info" value="info" />
          <Tab label="Effects" value="effects" />
          <Tab label="Totals" value="totals" />
          <Tab label="Enhance" value="enhance" />
        </TabList>
      </Box>
      <TabPanel value="info">
        <DataViewerInfo power={highlightedPower} />
      </TabPanel>
      <TabPanel value="effects">
        <DataViewerEffects effectsItemPairs={effectsItemPairs} />
      </TabPanel>
      <TabPanel value="totals">
        <DataViewerTotals />
      </TabPanel>
      <TabPanel value="enhance">
        <DataViewerEnhance />
      </TabPanel>
    </TabContext>
  );

  if (isDocked) {
    return (
      <Box sx={{ position: 'relative' }}>
        {undockButton}
        {content}
      </Box>
    );
  }

  return createPortal(
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 420,
        height: 400,
        minWidth: 280,
        minHeight: 200,
        resize: 'both',
        zIndex: 1300,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        onMouseDown={onMouseDown}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          cursor: 'grab',
          userSelect: 'none',
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
          Data Viewer
        </Typography>
        {dockButton}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {content}
      </Box>
    </Paper>,
    document.body
  );
};

export default DataViewer;
