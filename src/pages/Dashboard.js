// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js'; // Добавлен .js
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Добавлен .js
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore'; // Добавлен .js
import {
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider, // Добавлен импорт Divider
  Paper,
  Alert,
  Snackbar,
} from '@mui/material'; // Убрали .js из импортов
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'; // Импортируем компоненты для графиков
import { useNavigate } from 'react-router-dom'; // Добавлен .js
import AddCircleIcon from '@mui/icons-material/AddCircle'; // Убрали .js из импорта
import PeopleIcon from '@mui/icons-material/People'; // Убрали .js из импорта
import BuildIcon from '@mui/icons-material/Build'; // Убрали .js из импорта
import InventoryIcon from '@mui/icons-material/Inventory'; // Убрали .js из импорта
import AssessmentIcon from '@mui/icons-material/Assessment'; // Убрали .js из импорта
import { styled } from '@mui/material/styles'; // Убрали .js из импорта

// Стилизованные компоненты для карточек
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6], // Увеличиваем тень при наведении
  },
}));

const StyledCardHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem',
  marginBottom: theme.spacing(1),
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1, // Заполняет доступное пространство
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

// Функция для форматирования чисел (например, добавление пробелов между тысячами)
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
    const qRepairs = query(repairsCollection, orderBy('createdAt', 'desc')); // Сортировка по дате создания
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

    // --- Пример данных для графика (замените на реальные данные из Firestore если нужно) ---
    // Предположим, что данные о трендах ремонтов уже получены или рассчитаны
    // Здесь мы просто используем примеры
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

    // Установка состояния загрузки
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Тренды ремонтов',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Container maxWidth="lg" style={{ marginTop: '20px' }}>
        <Typography variant="h6">Загрузка данных...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Панель управления
      </Typography>

      {/* Статистика */}
      <Grid container spacing={3}>
        {/* Общее количество ремонтов */}
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Общее количество ремонтов</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(metrics.totalRepairs)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                всего
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                color="primary"
                onClick={handleNavigateToRepairs}
                startIcon={<BuildIcon />}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Мастера онлайн */}
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Мастера онлайн</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(metrics.onlineMasters)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                сейчас на работе
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                color="primary"
                onClick={handleNavigateToMasters}
                startIcon={<PeopleIcon />}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Критически важные запчасти */}
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Критически важные запчасти</StyledCardHeader>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(metrics.criticalParts)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                требуют внимания
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                color="primary"
                onClick={handleNavigateToParts}
                startIcon={<InventoryIcon />}
              >
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* Последние ремонты */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">Последние ремонты</StyledCardHeader>
              <Paper sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
                {metrics.recentRepairs.length > 0 ? (
                  <ul style={{ paddingLeft: '1rem' }}>
                    {metrics.recentRepairs.map((repair) => (
                      <li key={repair.id}>
                        {repair.masterName || 'Не указан'} -{' '}
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
                color="primary"
                onClick={handleNavigateToRepairs}
                startIcon={<BuildIcon />}
              >
                Все ремонты
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        {/* График загрузки мастеров */}
        <Grid item xs={12} md={4}>
          <StyledCard>
            <StyledCardContent>
              <StyledCardHeader variant="h6">График загрузки мастеров</StyledCardHeader>
              <Paper sx={{ height: 250, p: 1 }}>
                {metrics.repairTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Количество ремонтов" fill="#8884d8" />
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
                color="primary"
                onClick={handleNavigateToReports}
                startIcon={<AssessmentIcon />}
              >
                Отчеты
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Навигационные кнопки */}
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToRepairs}
            startIcon={<BuildIcon />}
            sx={{ px: 3, py: 1.5 }}
          >
            Ремонты
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToMasters}
            startIcon={<PeopleIcon />}
            sx={{ px: 3, py: 1.5 }}
          >
            Мастера
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToParts}
            startIcon={<InventoryIcon />}
            sx={{ px: 3, py: 1.5 }}
          >
            Запчасти
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToReports}
            startIcon={<AssessmentIcon />}
            sx={{ px: 3, py: 1.5 }}
          >
            Отчеты
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToSettings}
            startIcon={<AddCircleIcon />}
            sx={{ px: 3, py: 1.5 }}
          >
            Настройки
          </Button>
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