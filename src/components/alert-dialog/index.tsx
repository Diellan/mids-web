import { useEffect, useState, useCallback, useRef } from 'react';
import { Dialog, DialogActions, DialogContent, Alert, Button } from '@mui/material';
import { onWarning, offWarning, onConfirm, offConfirm } from '../../core/showWarning';

interface ConfirmEntry {
  message: string;
  resolve: (confirmed: boolean) => void;
}

export default function AlertDialog() {
  const [warningQueue, setWarningQueue] = useState<string[]>([]);
  const [confirmEntry, setConfirmEntry] = useState<ConfirmEntry | null>(null);
  const confirmQueueRef = useRef<ConfirmEntry[]>([]);

  useEffect(() => {
    onWarning((message) => {
      setWarningQueue((prev) => [...prev, message]);
    });

    onConfirm((message, resolve) => {
      const entry = { message, resolve };
      confirmQueueRef.current.push(entry);
      if (confirmQueueRef.current.length === 1) {
        setConfirmEntry(entry);
      }
    });

    return () => {
      offWarning();
      offConfirm();
    };
  }, []);

  const dismissWarning = useCallback(() => {
    setWarningQueue((prev) => prev.slice(1));
  }, []);

  const answerConfirm = useCallback((confirmed: boolean) => {
    if (!confirmEntry) return;
    confirmEntry.resolve(confirmed);
    confirmQueueRef.current.shift();
    setConfirmEntry(confirmQueueRef.current[0] ?? null);
  }, [confirmEntry]);

  const currentWarning = warningQueue[0] ?? null;

  return (
    <>
      <Dialog open={currentWarning !== null} onClose={dismissWarning} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pb: 0 }}>
          <Alert severity="warning" variant="outlined" sx={{ whiteSpace: 'pre-line' }}>
            {currentWarning}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={dismissWarning} variant="contained" size="small">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmEntry !== null} maxWidth="sm" fullWidth>
        <DialogContent sx={{ pb: 0 }}>
          <Alert severity="warning" variant="outlined" sx={{ whiteSpace: 'pre-line' }}>
            {confirmEntry?.message}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => answerConfirm(false)} size="small">
            No
          </Button>
          <Button onClick={() => answerConfirm(true)} variant="contained" size="small">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
