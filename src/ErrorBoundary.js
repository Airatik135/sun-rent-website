// src/ErrorBoundary.js
import React, { Component } from 'react';
import { Typography, Container, Paper, Button } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Обновляем состояние, чтобы следующий рендер показал запасное UI.
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Можно также записать информацию об ошибке в журнал ошибок.
    console.error("Ошибка в компоненте:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // Можно отрендерить запасной UI.
      return (
        <Container maxWidth="sm" style={{ marginTop: '50px' }}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Произошла ошибка
            </Typography>
            <Typography variant="body1" style={{ color: 'red' }}>
              Пожалуйста, перезагрузите страницу или обратитесь к администратору.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;