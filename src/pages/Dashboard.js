// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Paper,
  Alert,
  Snackbar,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip as RechartsTooltip, // Переименован для избежания конфликта!
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { styled } from '@mui/material/styles';

// Стилизованные компоненты для карточек
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
  border: '1px solid #ddd',
  borderRadius: '12px',
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem',
  marginBottom: theme.spacing(1),
  color: '#333',
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
}));

// Функция для форматирования чисел
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Функция для получения цвета статуса
const getStatusColor = (status) => {
  switch (status) {
    case 'Выполнен':
      return 'success';
    case 'В работе':
      return 'warning';
    case 'Новый':
      return 'info';
    default:
      return 'default';
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [metrics, setMetrics] = useState({
    totalRepairs: 0,
    onlineMasters: 0,
    criticalParts: 0,
    recentRepairs: [],
    repairTrends: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // --- Получение данных ---
  useEffect(() => {
    // Подписка на общее количество ремонтов
    const repairsCollection = collection(db, 'repairs');
    const qRepairs = query(repairsCollection, orderBy('createdAt', 'desc'));
    const unsubscribeRepairs = onSnapshot(qRepairs, (snapshot) => {
      const repairsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        totalRepairs: repairsList.length,
      }));
    });

    // Подписка на мастеров
    const mastersCollection = collection(db, 'masters');
    const qMasters = query(mastersCollection, orderBy('name'));
    const unsubscribeMasters = onSnapshot(qMasters, (snapshot) => {
      const mastersList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const onlineMasters = mastersList.filter(
        (master) => master.status === 'На работе'
      ).length;
      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        onlineMasters,
      }));
    });

    // Подписка на запчасти
    const partsCollection = collection(db, 'parts');
    const unsubscribeParts = onSnapshot(partsCollection, (snapshot) => {
      const partsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const criticalParts = partsList.filter(
        (part) => part.stock < 5
      ).length;
      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        criticalParts,
      }));
    });

    // Подписка на последние 5 ремонтов
    const qRecentRepairs = query(
      repairsCollection,
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubscribeRecentRepairs = onSnapshot(qRecentRepairs, (snapshot) => {
      const repairsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMetrics((prevMetrics) => ({
        ...prevMetrics,
        recentRepairs: repairsList,
      }));
    });

    // --- Пример данных для графика ---
    const sampleRepairTrends = [
      { date: '01.11.2025', count: 10 },
      { date: '02.11.2025', count: 15 },
      { date: '03.11.2025', count: 20 },
      { date: '04.11.2025', count: 18 },
      { date: '05.11.2025', count: 25 },
      { date: '06.11.2025', count: 30 },
      { date: '07.11.2025', count: 28 },
    ];
    setMetrics((prevMetrics) => ({
      ...prevMetrics,
      repairTrends: sampleRepairTrends,
    }));

    setLoading(false);

    // Очистка подписок
    return () => {
      unsubscribeRepairs();
      unsubscribeMasters();
      unsubscribeParts();
      unsubscribeRecentRepairs();
    };
  }, []);

  // --- Обработчики ---
  const handleNavigateToRepairs = () => {
    navigate('/repairs');
  };

  const handleNavigateToMasters = () => {
    navigate('/masters');
  };

  const handleNavigateToParts = () => {
    navigate('/parts');
  };

  const handleNavigateToReports = () => {
    navigate('/reports');
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Ошибка выхода:', err.message);
      setError('Ошибка выхода. Попробуйте снова.');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // --- График ---
  const data = metrics.repairTrends.map((trend) => ({
    name: trend.date,
    'Количество ремонтов': trend.count,
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <Typography variant="h6">Загрузка данных...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 2, 
      mb: 4, 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #f5f7fa, #e4edf5)', 
      padding: '20px', 
      borderRadius: '12px',
      [theme.breakpoints.down('sm')]: {
        padding: '10px',
      }
    }}>
      <Typography variant="h4" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: '#2c3e50', 
        textAlign: 'center', 
        mb: 3, 
        mt: 1,
        background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontSize: { xs: '1.8rem', sm: '2.2rem' }
      }}>
        Панель управления
      </Typography>
      {/* Статистика */}
      <Grid container spacing={3} mb={4}>
        {/* Общее количество ремонтов */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Общее количество ремонтов</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3498db' }}>
                {formatNumber(metrics.totalRepairs)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                всего
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNavigateToRepairs}
                startIcon={<BuildIcon />}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  px: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Мастера онлайн */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Мастера онлайн</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2ecc71' }}>
                {formatNumber(metrics.onlineMasters)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                сейчас на работе
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNavigateToMasters}
                startIcon={<PeopleIcon />}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  px: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Критически важные запчасти */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4
          }}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Критически важные запчасти</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
                {formatNumber(metrics.criticalParts)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                требуют внимания
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNavigateToParts}
                startIcon={<InventoryIcon />}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  px: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Последние ремонты */}
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Последние ремонты</StyledCardHeader>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto', backgroundColor: '#fafafa', borderRadius: '10px' }}>
                {metrics.recentRepairs.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                    {metrics.recentRepairs.map((repair) => (
                      <li key={repair.id} style={{ marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                        <strong>{repair.masterName || 'Не указан'}</strong> -{' '}
                        {repair.scooterModel || 'Модель не указана'} -{' '}
                        {repair.createdAt?.toDate().toLocaleDateString('ru-RU') || 'Дата не указана'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Нет последних ремонтов.
                  </Typography>
                )}
              </Paper>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNavigateToRepairs}
                startIcon={<BuildIcon />}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  px: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                Все ремонты
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* График загрузки мастеров */}
        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">График загрузки мастеров</StyledCardHeader>
              <Paper sx={{ height: 250, p: 1, backgroundColor: '#ffffff', borderRadius: '10px' }}>
                {metrics.repairTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <RechartsTooltip /> {/* Используем переименованный Tooltip */}
                      <Legend />
                      <Bar dataKey="Количество ремонтов" fill="#3498db" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    Нет данных для отображения
                  </Typography>
                )}
              </Paper>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={handleNavigateToReports}
                startIcon={<AssessmentIcon />}
                sx={{
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  px: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                Отчеты
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>
      </Grid>
      {/* Снэкбар для уведомлений */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Успешный выход!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Dashboard;
