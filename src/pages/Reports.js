// src/pages/Reports.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js'; // Добавлен .js
import { onAuthStateChanged } from 'firebase/auth'; // Добавлен .js
import { collection, onSnapshot } from 'firebase/firestore'; // Добавлен .js
import ExportButton from '../components/ExportButton.js'; // Добавлен .js
import {
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Box,
  Alert,
  AlertTitle
} from '@mui/material'; // Добавлены .js
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'; // Импортируем recharts
import { styled } from '@mui/material/styles'; // Добавлен .js

// Стилизованный компонент для карточек
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

// Функция для форматирования чисел (например, добавление пробелов между тысячами)
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const Reports = () => {
  const [user, setUser] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [masters, setMasters] = useState([]);
  const [parts, setParts] = useState([]);
  const [repairTrends, setRepairTrends] = useState([]); // Для графика трендов
  const [costBreakdown, setCostBreakdown] = useState([]); // Для диаграммы расходов
  const [profitData, setProfitData] = useState([]); // Для графика прибыли
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const repairsCollection = collection(db, 'repairs');
    const unsubscribeRepairs = onSnapshot(repairsCollection, (snapshot) => {
      const repairsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepairs(repairsList);
    });

    const mastersCollection = collection(db, 'masters');
    const unsubscribeMasters = onSnapshot(mastersCollection, (snapshot) => {
      const mastersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMasters(mastersList);
    });

    const partsCollection = collection(db, 'parts');
    const unsubscribeParts = onSnapshot(partsCollection, (snapshot) => {
      const partsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParts(partsList);
    });

    // --- Примеры данных для графиков ---
    // Эти данные могут быть заменены на реальные данные из Firestore
    const sampleRepairTrends = [
      { date: '01.11.2025', repairs: 10 },
      { date: '02.11.2025', repairs: 15 },
      { date: '03.11.2025', repairs: 20 },
      { date: '04.11.2025', repairs: 18 },
      { date: '05.11.2025', repairs: 25 },
      { date: '06.11.2025', repairs: 30 },
      { date: '07.11.2025', repairs: 28 },
    ];
    setRepairTrends(sampleRepairTrends);

    // Пример данных для диаграммы расходов
    const sampleCostBreakdown = [
      { name: 'Запчасти', value: 50000 },
      { name: 'Заработная плата', value: 30000 },
      { name: 'Аренда', value: 10000 },
      { name: 'Прочие', value: 5000 },
    ];
    setCostBreakdown(sampleCostBreakdown);

    // Исправленные данные для графика прибыли
    const sampleProfitData = [
      { month: 'Янв', income: 100000, expenses: 50000 },
      { month: 'Фев', income: 120000, expenses: 55000 },
      { month: 'Март', income: 150000, expenses: 60000 },
      { month: 'Апр', income: 130000, expenses: 58000 },
      { month: 'Май', income: 180000, expenses: 65000 },
      { month: 'Июнь', income: 200000, expenses: 70000 },
    ];
    setProfitData(sampleProfitData);

    setLoading(false);

    return () => {
      unsubscribeRepairs();
      unsubscribeMasters();
      unsubscribeParts();
    };
  }, [user]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h6">Загрузка данных...</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Alert severity="error">
          <AlertTitle>Ошибка</AlertTitle>
          Требуется авторизация
        </Alert>
      </Container>
    );
  }

  // --- Подсчет метрик ---
  const totalRepairs = repairs.length;
  const totalMasters = masters.length;
  const totalParts = parts.length;

  // --- Цвета для диаграммы ---
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Отчеты
      </Typography>

      {/* Информационные карточки */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom>
                Общее количество ремонтов
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(totalRepairs)}
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" color="primary">
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom>
                Количество мастеров
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(totalMasters)}
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" color="primary">
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StyledCard>
            <StyledCardContent>
              <Typography variant="h6" gutterBottom>
                Количество запчастей
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {formatNumber(totalParts)}
              </Typography>
            </StyledCardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" color="primary">
                Подробнее
              </Button>
            </CardActions>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* График трендов ремонтов */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Тренды ремонтов
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={repairTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="repairs" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* График прибыли */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Прибыль и Расходы
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={profitData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#82ca9d" name="Доходы" />
                <Bar dataKey="expenses" fill="#ff8042" name="Расходы" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Диаграмма расходов */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Распределение расходов
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₽${value.toLocaleString()}`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Сводка по ремонтам */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Сводка по последним ремонтам
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {repairs.length > 0 ? (
                <ul style={{ paddingLeft: '1rem' }}>
                  {repairs.slice(0, 10).map((repair) => (
                    <li key={repair.id}>
                      {repair.scooterModel || 'Модель не указана'} -{' '}
                      {repair.masterName || 'Мастер не указан'} -{' '}
                      {repair.createdAt?.toDate().toLocaleDateString('ru-RU') || 'Дата не указана'}
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Нет данных о ремонтах.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Кнопка экспорта */}
      <Grid container spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
        <Grid item>
          <ExportButton />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports;