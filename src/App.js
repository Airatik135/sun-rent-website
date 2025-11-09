// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import BuildIcon from '@mui/icons-material/Build';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import ErrorBoundary from './ErrorBoundary.js';

const drawerWidth = 240;

const MainLayout = ({ children, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Панель администратора проката самокатов
          </Typography>
          {auth.currentUser && (
            <Button color="inherit" onClick={handleLogout}>
              Выйти
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={open}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/dashboard')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Главная" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/repairs')}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Ремонты" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/masters')}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Мастера" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/parts')}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Запчасти" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/reports')}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Отчёты" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Настройки" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/dashboard')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Главная" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/repairs')}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Ремонты" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/masters')}>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Мастера" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/parts')}>
              <ListItemIcon>
                <BuildIcon />
              </ListItemIcon>
              <ListItemText primary="Запчасти" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/reports')}>
              <ListItemIcon>
                <BarChartIcon />
              </ListItemIcon>
              <ListItemText primary="Отчёты" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation('/settings')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Настройки" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

// Импортируем useNavigate здесь
import { useNavigate } from 'react-router-dom';

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

  // Компонент Login с правильной передачей handleLogin
  const LoginWithHandler = () => (
    <Login onLogin={() => {
      window.location.reload();
    }} />
  );

  return (
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
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            Успешно!
          </Alert>
        </Snackbar>
      </Router>
    </ErrorBoundary>
  );
}

export default App;