import { useEffect, useState, useRef } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material';
import midsTheme from './midsTheme';
import { DatabaseAPI } from './core/DatabaseAPI';
import { ServerData } from './core/ServerData';
import MidsBuilder from './components/MidsBuilder';
import AlertDialog from './components/alert-dialog';
import { createDomainStore, type DomainStoreApi } from './domainStore/DomainStore';
import { DomainStoreContext } from './domainStore/domainStoreContext';

function App() {
  const [domainStore, setDomainStore] = useState<DomainStoreApi | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React.StrictMode
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    DatabaseAPI.LoadAllData('Databases/Homecoming').then(() => {
      console.log('Server data loaded successfully');
      console.log(ServerData.Instance);
      console.log(DatabaseAPI.Database);
      const newDomainStore = createDomainStore(DatabaseAPI.Database);
      setDomainStore(newDomainStore);
      (window as any).domainStore = newDomainStore;
    }).catch(error => {
      console.error('Failed to load server data');
      console.error(error);
    });
  }, []);

  // Wire Electron menu events to the store
  useEffect(() => {
    if (!domainStore) return;
    const ipc = (window as any).ipcRenderer;
    if (!ipc) return;

    const onNewBuild = () => {
      domainStore.getState().newBuild().catch((err: any) => {
        console.error('Failed to create new build:', err);
      });
    };

    const onFileOpened = (_event: any, content: string, _filePath: string) => {
      domainStore.getState().loadBuildFromContent(content).catch((err: any) => {
        console.error('Failed to open build file:', err);
        alert(err.message || 'Failed to open build file');
      });
    };

    const onSaveRequested = () => {
      domainStore.getState().saveBuildFile().catch((err: any) => {
        console.error('Failed to save build file:', err);
        alert(err.message || 'Failed to save build file');
      });
    };

    ipc.on('file:new', onNewBuild);
    ipc.on('file:opened', onFileOpened);
    ipc.on('file:save-requested', onSaveRequested);
    return () => {
      ipc.off('file:new', onNewBuild);
      ipc.off('file:opened', onFileOpened);
      ipc.off('file:save-requested', onSaveRequested);
    };
  }, [domainStore]);

  // ⛔️ Do not render Provider until store exists
  if (!domainStore) {
    return (
      <ThemeProvider theme={midsTheme}>
        <CssBaseline />
        <div>Loading database…</div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={midsTheme}>
      <CssBaseline />
      <DomainStoreContext.Provider value={domainStore}>
        <MidsBuilder />
        <AlertDialog />
      </DomainStoreContext.Provider>
    </ThemeProvider>
  );
}

export default App;