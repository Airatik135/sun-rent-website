// src/components/ExcelExport.js
import React from 'react';
import { Button } from '@mui/material';

const ExcelExport = () => {
  const handleExport = () => {
    alert('Экспорт в Excel пока не реализован');
  };

  return (
    <Button variant="contained" color="primary" onClick={handleExport}>
      Экспорт в Excel
    </Button>
  );
};

export default ExcelExport; // Это default экспорт