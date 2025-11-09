// src/components/ExportButton.js
import React from 'react';
import { Button } from '@mui/material'; // Убрали .js
import ExcelExport from './ExcelExport.js'; // Изменили на default импорт
import PdfExport from './PdfExport.js'; // Изменили на default импорт

const ExportButton = () => {
  return (
    <div>
      <ExcelExport />
      <PdfExport />
    </div>
  );
};

export default ExportButton;