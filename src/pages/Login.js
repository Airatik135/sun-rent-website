// src/pages/Login.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { TextField, Button, Typography, Container, Paper, Snackbar, Alert } from '@mui/material';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setSnackbarOpen(true);
      onLogin();
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

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '50px' }}>
      <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Панель администратора проката самокатов
        </Typography>
        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Войти
          </Button>
        </form>
        {error && (
          <Alert severity="error" style={{ marginTop: '20px' }}>
            {error}
          </Alert>
        )}
      </Paper>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Успешно!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;