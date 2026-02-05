import { useEffect, useState, useRef } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, ThemeProvider, Toolbar, Typography } from '@mui/material';
import midsTheme from './midsTheme';
import { DatabaseAPI } from './core/DatabaseAPI';
import { ServerData } from './core/ServerData';
import MidsBuilder from './components/MidsBuilder';
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

    DatabaseAPI.LoadAllData('/Databases/Homecoming').then(() => {
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
        <AppBar position='static'>
          <Toolbar>
            <Typography variant="h6">Mids Hero Designer</Typography>
          </Toolbar>
        </AppBar>
        <MidsBuilder />
      </DomainStoreContext.Provider>
    </ThemeProvider>
  );
}

export default App;