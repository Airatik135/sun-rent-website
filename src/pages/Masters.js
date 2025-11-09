// src/pages/Masters.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import {
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  Box,
  Chip,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Stack,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { styled } from '@mui/material/styles';

// Стилизованная карточка для мастера
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: theme.shadows[2],
  background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
  border: '1px solid #ddd',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

// Стилизованная ячейка таблицы
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: '500',
  color: '#333',
}));

// Стилизованный заголовок таблицы
const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  color: '#2c3e50',
  backgroundColor: '#f8f9fa',
}));

const Masters = () => {
  const [user, setUser] = useState(null);
  const [masters, setMasters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [newMaster, setNewMaster] = useState({
    name: '',
    telegramId: '',
    status: 'Не на работе',
    salary: 0,
    workStart: null,
    workEnd: null,
    lastUpdated: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme(); // Для получения темы

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
    const mastersCollection = collection(db, 'masters');
    const unsubscribe = onSnapshot(mastersCollection, (snapshot) => {
      const mastersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMasters(mastersList);
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
    } catch (err) {
      console.error("Ошибка выхода:", err.message);
    }
  };

  const handleOpenDialog = (master = null) => {
    if (master) {
      setEditingMaster(master);
      setNewMaster({
        name: master.name,
        telegramId: master.telegramId || '',
        status: master.status,
        salary: master.salary || 0,
        workStart: master.workStart || null,
        workEnd: master.workEnd || null,
        lastUpdated: master.lastUpdated || null
      });
    } else {
      setEditingMaster(null);
      setNewMaster({
        name: '',
        telegramId: '',
        status: 'Не на работе',
        salary: 0,
        workStart: null,
        workEnd: null,
        lastUpdated: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMaster(null);
    setError('');
    setSuccess('');
  };

  const handleSaveMaster = async () => {
    if (!newMaster.name.trim()) {
      setError('Введите имя мастера');
      return;
    }

    try {
      if (editingMaster) {
        const masterRef = doc(db, 'masters', editingMaster.id);
        await updateDoc(masterRef, {
          ...newMaster,
          lastUpdated: new Date()
        });
      } else {
        await addDoc(collection(db, 'masters'), {
          ...newMaster,
          lastUpdated: new Date()
        });
      }
      handleCloseDialog();
      setSuccess('Мастер успешно сохранен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Ошибка сохранения мастера:", err.message);
      setError('Ошибка при сохранении мастера');
    }
  };

  const handleDeleteMaster = async (masterId) => {
    try {
      const masterRef = doc(db, 'masters', masterId);
      await deleteDoc(masterRef);
    } catch (err) {
      console.error("Ошибка удаления мастера:", err.message);
      setError('Ошибка при удалении мастера');
    }
  };

  if (!user) {
    return <Typography variant="h6">Требуется авторизация</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4, minHeight: '100vh', background: 'linear-gradient(to bottom right, #f5f7fa, #e4edf5)', padding: '20px', borderRadius: '12px' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50', textAlign: 'center', mb: 3, mt: 1 }}>
        Мастера
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Button variant="contained" color="primary" sx={{ mb: 2, px: 3, py: 1.5 }} onClick={() => handleOpenDialog()}>
          <AddCircleIcon sx={{ mr: 1 }} /> Добавить мастера
        </Button>
      </Box>

      {/* Карточки для мастеров */}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' } }}>
        {masters.map(master => (
          <StyledCard key={master.id}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: master.status === 'На работе' ? '#2ecc71' : '#95a5a6' }}>
                  {master.name.charAt(0)}
                </Avatar>
              }
              title={master.name}
              subheader={`ID: ${master.telegramId || 'Не указан'}`}
            />
            <CardContent>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center">
                  <Chip
                    label={master.status}
                    color={master.status === 'На работе' ? 'success' : 'default'}
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {master.status === 'На работе' ? 'На работе' : 'Не на работе'}
                  </Typography>
                </Box>
                <Typography variant="body2">
                  <strong>Зарплата:</strong> {master.salary || 0} ₽
                </Typography>
                <Typography variant="body2">
                  <strong>Время работы:</strong>
                </Typography>
                <Typography variant="caption" display="block">
                  Начало: {master.workStart ? master.workStart.toDate().toLocaleString('ru-RU') : 'Не указано'}
                </Typography>
                <Typography variant="caption" display="block">
                  Конец: {master.workEnd ? master.workEnd.toDate().toLocaleString('ru-RU') : 'Не указано'}
                </Typography>
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => handleOpenDialog(master)}
                sx={{ mr: 1 }}
              >
                Редактировать
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleDeleteMaster(master.id)}
              >
                Удалить
              </Button>
              {/* Добавляем кнопку "Зарплата" */}
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => alert(`Зарплата для ${master.name} будет отображена здесь.`)}
                sx={{ ml: 1 }}
              >
                Зарплата
              </Button>
            </CardActions>
          </StyledCard>
        ))}
      </Box>

      {/* Старая таблица как резервная */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}> {/* Скрываем на мобильных устройствах */}
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table aria-label="masters table">
            <TableHead>
              <TableRow>
                <StyledTableHeadCell>Имя</StyledTableHeadCell>
                <StyledTableHeadCell>ID в Telegram</StyledTableHeadCell>
                <StyledTableHeadCell>Статус</StyledTableHeadCell>
                <StyledTableHeadCell>Зарплата</StyledTableHeadCell>
                <StyledTableHeadCell>Последнее Время работы</StyledTableHeadCell>
                <StyledTableHeadCell>Действия</StyledTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {masters.map(master => (
                <TableRow key={master.id}>
                  <StyledTableCell>{master.name}</StyledTableCell>
                  <StyledTableCell>{master.telegramId || 'Не указан'}</StyledTableCell>
                  <StyledTableCell>
                    <Chip
                      label={master.status}
                      color={master.status === 'На работе' ? 'success' : 'default'}
                    />
                  </StyledTableCell>
                  <StyledTableCell>{master.salary || 0} ₽</StyledTableCell>
                  <StyledTableCell>
                    {master.workStart ? master.workStart.toDate().toLocaleString('ru-RU') : 'Не указано'}
                    <br />
                    {master.workEnd ? master.workEnd.toDate().toLocaleString('ru-RU') : 'Не указано'}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(master)}
                      sx={{ mr: 1 }}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteMaster(master.id)}
                    >
                      Удалить
                    </Button>
                    {/* Добавляем кнопку "Зарплата" */}
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      onClick={() => alert(`Зарплата для ${master.name} будет отображена здесь.`)}
                      sx={{ ml: 1 }}
                    >
                      Зарплата
                    </Button>
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMaster ? 'Редактировать мастера' : 'Добавить мастера'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя"
            fullWidth
            required
            value={newMaster.name}
            onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="ID в Telegram"
            fullWidth
            value={newMaster.telegramId}
            onChange={(e) => setNewMaster({ ...newMaster, telegramId: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Зарплата"
            type="number"
            fullWidth
            value={newMaster.salary}
            onChange={(e) => setNewMaster({ ...newMaster, salary: Number(e.target.value) })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newMaster.status === 'На работе'}
                onChange={(e) => setNewMaster({ ...newMaster, status: e.target.checked ? 'На работе' : 'Не на работе' })}
              />
            }
            label="На работе"
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Ошибка</AlertTitle>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <AlertTitle>Успех</AlertTitle>
              {success}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveMaster} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Masters;
