// src/components/PdfExport.js
import React from 'react';
import { Button } from '@mui/material';

const PdfExport = () => {
  const handleExport = () => {
    alert('Экспорт в PDF пока не реализован');
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleExport}>
      Экспорт в PDF
    </Button>
  );
};

export default PdfExport;