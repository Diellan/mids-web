import { createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';

export const midsTokens: ThemeOptions = {
    palette: {
      mode: 'dark'
    },
    spacing: 4
  };
  
  export const midsComponents: ThemeOptions['components'] = {
  };
  
  const midsTheme = createTheme({
    ...midsTokens,
    components: midsComponents,
  });
  
  export default midsTheme;