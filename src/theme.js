// src/theme.js
import { createTheme } from '@mui/material/styles'; // Убрали .js

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

export default theme;