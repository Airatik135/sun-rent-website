// src/pages/Settings.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js'; // Добавлен .js
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Добавлен .js
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore'; // Добавлен .js
import {
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  AlertTitle,
  Switch,
  FormControlLabel,
  Box
} from '@mui/material'; // Добавлены .js
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

const Settings = () => {
  const [user, setUser] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true); // Пример настройки
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    // Здесь можно добавить получение текущих данных администратора из Firestore
    // Для примера используем фиктивные значения
    setAdminEmail('admin@masterstexnik.ru');
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    try {
      // Пример сохранения данных в Firestore
      // const settingsRef = doc(db, 'settings', 'admin');
      // await setDoc(settingsRef, {
      //   adminEmail: newAdminEmail,
      //   notificationsEnabled: notificationsEnabled,
      //   // ... другие настройки
      // });
      alert('Настройки сохранены');
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Скрыть сообщение через 3 секунды
    } catch (err) {
      console.error("Ошибка сохранения настроек:", err.message);
      alert('Ошибка при сохранении настроек');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Настройки
      </Typography>

      {/* Сообщение об успешном сохранении */}
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Настройки успешно сохранены!
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Пользователь
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Email: {user.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                UID: {user.uid}
              </Typography>
              <Button variant="contained" color="secondary" onClick={handleLogout}>
                Выйти
              </Button>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Административные настройки
              </Typography>
              {isEditing ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email администратора"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Пароль администратора"
                      type="password"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationsEnabled}
                          onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        />
                      }
                      label="Включить уведомления"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={handleSaveSettings}>
                      Сохранить
                    </Button>
                    <Button variant="outlined" sx={{ ml: 1 }} onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      Email: {adminEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1">
                      Уведомления: {notificationsEnabled ? 'Включены' : 'Выключены'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" onClick={() => setIsEditing(true)}>
                      Изменить
                    </Button>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Дополнительные настройки */}
        <Grid item xs={12} md={8}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Другие настройки
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Темная тема
                </Typography>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Автоматическое резервное копирование
                </Typography>
                <Switch defaultChecked />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Экспорт данных по умолчанию
                </Typography>
                <Switch defaultChecked />
              </Box>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button variant="contained">Сохранить все</Button>
            </CardActions>
          </StyledCard>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;