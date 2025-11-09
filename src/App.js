// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import ExportButton from './components/ExportButton.js';
import Dashboard from './pages/Dashboard.js';
import Repairs from './pages/Repairs.js';
import Masters from './pages/Masters.js';
import Parts from './pages/Parts.js';
import Reports from './pages/Reports.js';
import Settings from './pages/Settings.js';
import Login from './pages/Login.js';
import {
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Paper,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  CssBaseline,
  createTheme,
  ThemeProvider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorBoundary from './ErrorBoundary.js';
import { styled } from '@mui/system';

// Создаем тему с современными цветами
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffa726',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
});

// Стилизованные компоненты
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(10px)',
  backgroundColor: 'rgba(26, 35, 126, 0.95)',
  [theme.breakpoints.down('sm')]: {
    background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'transparent', // прозрачный фон
    color: '#ffffff',
    borderRight: 'none',
    width: 230, // Уменьшаем ширину с 280 до 230px
    [theme.breakpoints.up('sm')]: {
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.08)',
    },
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transition: 'background-color 0.3s ease',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
}));

const NavItem = ({ icon, text, active, onClick }) => {
  return (
    <StyledListItem disablePadding>
      <ListItemButton 
        onClick={onClick}
        selected={active}
        sx={{
          py: 1.3,
          px: 2,
          borderRadius: 3,
          '& .MuiListItemIcon-root': {
            color: active ? '#f1701aff' : 'rgba(1, 1, 1, 0.75)',
            transition: 'color 0.3s ease',
          },
          '& .MuiListItemText-primary': {
            fontWeight: 500,
            color: active ? '#020202ff' : 'rgba(0, 0, 0, 1)',
            transition: 'color 0.3s ease',
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
        <ListItemText primary={text} />
        {active && (
          <Box 
            sx={{ 
              width: 4, 
              height: '100%', 
              backgroundColor: '#ff9800',
              borderRadius: '0 2px 2px 0'
            }} 
          />
        )}
      </ListItemButton>
    </StyledListItem>
  );
};

const MainLayout = ({ children, handleLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(!isMobile);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    setCurrentPath(path);
    navigate(path);
    if (isMobile) {
      setOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #ffffff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.2rem', sm: '1.4rem' }
            }}
          >
            Панель администратора проката самокатов
          </Typography>
          {auth.currentUser && (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                },
                fontWeight: 500,
                borderRadius: 20,
                px: 2
              }}
            >
              Выйти
            </Button>
          )}
        </Toolbar>
      </StyledAppBar>
      
      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box',
            borderRight: 'none'
          },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, justifyContent: 'flex-end' }}>
          {isMobile && (
            <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ px: 1.5, pt: 1, height: '100%' }}>
          <List>
            <NavItem 
              icon={<HomeIcon />} 
              text="Главная" 
              active={currentPath === '/dashboard'}
              onClick={() => handleNavigation('/dashboard')}
            />
            <NavItem 
              icon={<BuildIcon />} 
              text="Ремонты" 
              active={currentPath === '/repairs'}
              onClick={() => handleNavigation('/repairs')}
            />
            <NavItem 
              icon={<PeopleIcon />} 
              text="Мастера" 
              active={currentPath === '/masters'}
              onClick={() => handleNavigation('/masters')}
            />
            <NavItem 
              icon={<BuildIcon />} 
              text="Запчасти" 
              active={currentPath === '/parts'}
              onClick={() => handleNavigation('/parts')}
            />
            <NavItem 
              icon={<BarChartIcon />} 
              text="Отчёты" 
              active={currentPath === '/reports'}
              onClick={() => handleNavigation('/reports')}
            />
            <NavItem 
              icon={<SettingsIcon />} 
              text="Настройки" 
              active={currentPath === '/settings'}
              onClick={() => handleNavigation('/settings')}
            />
          </List>
          
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: 15, 
              left: 15,
              width: 'calc(100% - 30px)',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="caption" 
              color="rgba(255, 255, 255, 0.7)"
              sx={{ display: 'block' }}
            >
              Sun Rent
            </Typography>
            <Typography 
              variant="caption" 
              color="rgba(255, 255, 255, 0.5)"
            >
              Version 1.2.0
            </Typography>
          </Box>
        </Box>
      </StyledDrawer>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { 
            sm: `calc(100% - 230px)`, // Соответствует уменьшенной ширине меню
            xs: '100%'
          },
          transition: theme => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #f5f7fa 0%, #e4edf5 100%)',
          position: 'relative'
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        {children}
      </Box>
    </Box>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [repairs, setRepairs] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log("Пользователь вошел:", user.email);
      } else {
        setUser(null);
        console.log("Пользователь не вошел");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const repairsCollection = collection(db, 'repairs');
    const unsubscribe = onSnapshot(repairsCollection, (snapshot) => {
      const repairsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepairs(repairsList);
    });
    return () => unsubscribe();
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setSnackbarOpen(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('Пользователь с таким email не найден');
      } else if (err.code === 'auth/wrong-password') {
        setError('Неверный пароль');
      } else {
        setError('Произошла ошибка при входе: ' + err.message);
      }
      console.error("Ошибка входа:", err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError('');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Ошибка выхода:", err.message);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const LoginWithHandler = () => (
    <Login onLogin={() => {
      window.location.reload();
    }} />
  );

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Router>
          {user ? (
            <MainLayout handleLogout={handleLogout}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repairs" element={<Repairs />} />
                <Route path="/masters" element={<Masters />} />
                <Route path="/parts" element={<Parts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            <Routes>
              <Route path="/login" element={<LoginWithHandler />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
          <Snackbar 
            open={snackbarOpen} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity="success" 
              sx={{ 
                width: '100%',
                borderRadius: 2,
                boxShadow: 3,
                fontWeight: 500
              }}
            >
              Успешно!
            </Alert>
          </Snackbar>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
