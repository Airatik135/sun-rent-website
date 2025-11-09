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
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Masters = () => {
  const [user, setUser] = useState(null);
  const [masters, setMasters] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMaster, setEditingMaster] = useState(null);
  const [newMaster, setNewMaster] = useState({
    name: '',
    telegramId: '', // Добавлено поле
    status: 'Не на работе',
    salary: 0,
    workStart: null,
    workEnd: null,
    lastUpdated: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        telegramId: master.telegramId || '', // Заполняем поле
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
        telegramId: '', // Добавлено поле
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
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Мастера
      </Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpenDialog()}>
        <AddCircleIcon sx={{ mr: 1 }} /> Добавить мастера
      </Button>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="masters table">
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>ID в Telegram</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Зарплата</TableCell>
              <TableCell>Последнее Время работы</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {masters.map(master => (
              <TableRow key={master.id}>
                <TableCell>{master.name}</TableCell>
                <TableCell>{master.telegramId || 'Не указан'}</TableCell>
                <TableCell>
                  <Chip
                    label={master.status}
                    color={master.status === 'На работе' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{master.salary || 0} ₽</TableCell>
                <TableCell>
                  {master.workStart ? master.workStart.toDate().toLocaleString('ru-RU') : 'Не указано'}
                  <br />
                  {master.workEnd ? master.workEnd.toDate().toLocaleString('ru-RU') : 'Не указано'}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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