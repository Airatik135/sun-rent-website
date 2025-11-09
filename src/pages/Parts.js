// src/pages/Parts.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
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
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TablePagination, 
  IconButton, 
  Chip,
  Grid,
  Box,
  Autocomplete,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  TableSortLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Список запчастей по категориям
const partsCategories = {
  ninebot_max_pro: {
    'ruled': [
      { name: 'Кронштейн руля (основание)', price: 2970 },
      { name: 'Крепление к кронштейну руля (ответная часть)', price: 748 },
      { name: 'Поперечина руля', price: 1061 },
      { name: 'Грипса левая', price: 443 },
      { name: 'Грипса правая', price: 443 },
      { name: 'Планка крепления платы дашборда', price: 150 },
      { name: 'Крышка дашборда', price: 465 },
      { name: 'Курок Газа', price: 1089 },
      { name: 'Чулок резиновый (для защиты разъемов дашборда)', price: 76 },
      { name: 'Дашборд', price: 3126 },
      { name: 'Звонок', price: 449 },
      { name: 'Фара', price: 1081 },
      { name: 'Рукоятка тормоза левая', price: 1474 },
      { name: 'Тросик короткий передний', price: 475 }
    ],
    'steering': [
      { name: 'Стойка с защитным кожухом', price: 3332 },
      { name: 'Адаптер рулевой вилки', price: 990 },
      { name: 'Шлейф управления центральный', price: 2041 },
      { name: 'Кожух защитный', price: 319 }
    ],
    'front_wheel': [
      { name: 'Переднее колесо в сборе', price: 6802 },
      { name: 'Обод переднего колеса', price: 4219 },
      { name: 'Шина', price: 3234 },
      { name: 'Вилка передняя', price: 2938 },
      { name: 'Барабан тормозной в сборе передний', price: 886 },
      { name: 'Кожух защитный левый', price: 295 },
      { name: 'Кожух защитный правый', price: 414 },
      { name: 'Крыло переднее', price: 591 },
      { name: 'Наклейка светоотражающая', price: 91 },
      { name: 'Заглушка винтов', price: 91 },
      { name: 'Заглушка резиновая передней вилки', price: 156 },
      { name: 'Гайка передней вилки', price: 455 },
      { name: 'Шайба проставочная', price: 91 },
      { name: 'Кольцо проставочное', price: 212 },
      { name: 'Шайба пластиковая противопылевая', price: 227 },
      { name: 'Трос тормозной передний длинный без коннектора и гайки', price: 850 },
      { name: 'Коннектор тормозных тросиков', price: 472 },
      { name: 'Гайка (M6) тормозного тросика', price: 31 },
      { name: 'Чехол защитный резиновый', price: 317 },
      { name: 'Втулка фиксации тормозного троса', price: 154 },
      { name: 'Гайка (M5x16) регулировочная', price: 138 },
      { name: 'Кривошип переднего тормоза', price: 177 }
    ],
    'rear_fender': [
      { name: 'Заднее крыло в сборе', price: 2652 },
      { name: 'Заднее крыло', price: 1328 },
      { name: 'Пластина защитная', price: 210 },
      { name: 'Задний стоп фонарь', price: 601 },
      { name: 'Клемма шлейфа заднего стоп-фонаря', price: 150 },
      { name: 'Коврик задний', price: 247 },
      { name: 'Прижимная пластина заднего крыла', price: 826 }
    ],
    'hub_motor': [
      { name: 'Мотор колесо в сборе', price: 12589 },
      { name: 'Кожух защитный кабеля мотор колеса', price: 150 }
    ],
    'controller': [
      { name: 'Контроллер', price: 10171 },
      { name: 'Наклейка на контроллер', price: 91 },
      { name: 'Кольцо резиновое штепсельной вилки', price: 93 },
      { name: 'Рукоятка штепсельной вилки', price: 129 },
      { name: 'Шлейф управления центральный', price: 2041 },
      { name: 'Заглушка разъема зарядки АКБ', price: 60 },
      { name: 'Крепление рукоятки штепсельной вилки', price: 115 },
      { name: 'Ручка-крепление с фиксацией разъема аккумулятора (часть крепления разъема для акб)', price: 459 },
      { name: 'Винт с потайной головкой и поперечным углублением SP_-M3x5 (часть крепления разъема для акб)', price: 33 },
      { name: 'Резиновый блок рукоятки клеммы аккумулятора (часть крепления разъема для акб)', price: 66 }
    ],
    'battery': [
      { name: 'Крышка аккумуляторной батареи', price: 1388 },
      { name: 'Заглушка разъема зарядки АКБ', price: 360 },
      { name: 'Верхний блок крепления фиксатора разъема батареи (часть крепления разъема для акб)', price: 325 },
      { name: 'Нижний блок крепления фиксатора разъема батареи (часть крепления разъема для акб)', price: 159 }
    ],
    'lock': [
      { name: 'Замок крышки деки', price: 4654 },
      { name: 'Кожух замка крышки деки', price: 556 },
      { name: 'Противоугонный элемент замка крышки аккумуляторного отсека', price: 214 }
    ],
    'tail_light': [
      { name: 'Шлейф заднего стоп-фонаря', price: 315 },
      { name: 'Крепление провода заднего фонаря', price: 60 },
      { name: 'Кожух защитный', price: 301 }
    ],
    'deck': [
      { name: 'Дека в сборе', price: 6867 },
      { name: 'Коврик на деку', price: 927 },
      { name: 'Дужка деки', price: 307 }
    ],
    'kickstand': [
      { name: 'Подножка', price: 739 },
      { name: 'Пластина крепления подножки', price: 309 }
    ],
    'charger': [
      { name: 'Зарядное устройство (без сетевого кабеля)', price: 7354 },
      { name: 'Кабель сетевой (220 V) для зарядного устройств', price: 472 }
    ],
    'frame': [
      { name: 'Рама', price: 16146 },
      { name: 'Блок армирующий боковой', price: 113 },
      { name: 'Крышка защитная шлейфа питания', price: 360 },
      { name: 'Пластина крепления мотор-колеса', price: 299 },
      { name: 'Бампер передний (пара)', price: 354 },
      { name: 'Бампер задний левый', price: 148 },
      { name: 'Бампер задний правый', price: 148 },
      { name: 'Заглушка защитная задняя', price: 150 },
      { name: 'Наклейка светоотражающая красная задняя', price: 91 },
      { name: 'Коврик передний', price: 216 },
      { name: 'Заглушка (большая) рулевой вилки', price: 121 },
      { name: 'Заглушка (малая) рулевой вилки', price: 91 },
      { name: 'Хомут на раму', price: 210 },
      { name: 'Наклейка под серийный номер', price: 91 },
      { name: 'Подшипник стойки', price: 850 }
    ],
    'misc': [
      { name: 'Ключ разблокировки деки', price: 323 },
      { name: 'Кабель подключения к АКБ (USB)', price: 2993 },
      { name: 'Адаптер разблокировки деки', price: 4240 },
      { name: 'Соединительный кабель внешнего управления 5 pin', price: 2039 },
      { name: 'Разъем- коннектор с проводом (штепсельная вилка) от контроллера NB Max Pro\\ Plus', price: 950 },
      { name: 'Разъем АКБ NB Max Pro \\ Plus', price: 950 },
      { name: 'Удлинитель центрального шлейфа', price: 103 },
      { name: 'Хомут на раму', price: 210 }
    ]
  }
};

const Parts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [user, setUser] = useState(null);
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [newPart, setNewPart] = useState({
    name: '',
    stock: 0,
    price: 0,
    lastOrderDate: new Date().toISOString().split('T')[0],
    lastOrderAmount: 0,
    status: 'На складе'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedPartFromList, setSelectedPartFromList] = useState(null);

  // Статусы с цветами для чипов
  const statusColors = {
    'На складе': 'success',
    'Заказано': 'info',
    'В пути': 'warning',
    'Нет в наличии': 'error'
  };

  // Статусы для фильтра
  const statusOptions = ['Все', 'На складе', 'Заказано', 'В пути', 'Нет в наличии'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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
    const partsCollection = collection(db, 'parts');
    const unsubscribe = onSnapshot(partsCollection, (snapshot) => {
      const partsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParts(partsList);
      setFilteredParts(partsList);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    filterAndSortParts();
  }, [parts, searchTerm, statusFilter, sortConfig]);

  const filterAndSortParts = () => {
    let result = [...parts];
    
    // Поиск
    if (searchTerm) {
      result = result.filter(part => 
        part.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтр по статусу
    if (statusFilter !== 'Все') {
      result = result.filter(part => part.status === statusFilter);
    }
    
    // Сортировка
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredParts(result);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (part) => {
    setEditingPart(part);
    
    if (part) {
      // При редактировании существующей запчасти
      setNewPart({
        name: part.name || '',
        stock: part.stock || 0,
        price: part.price || 0,
        lastOrderDate: part.lastOrderDate || new Date().toISOString().split('T')[0],
        lastOrderAmount: part.lastOrderAmount || 0,
        status: part.status || 'На складе'
      });
      setSelectedCategory('');
      setSelectedPartFromList(null);
    } else {
      // При добавлении новой запчасти
      setNewPart({
        name: '',
        stock: 0,
        price: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        lastOrderAmount: 0,
        status: 'На складе'
      });
      setSelectedCategory('');
      setSelectedPartFromList(null);
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPart(null);
    setNewPart({
      name: '',
      stock: 0,
      price: 0,
      lastOrderDate: new Date().toISOString().split('T')[0],
      lastOrderAmount: 0,
      status: 'На складе'
    });
    setSelectedCategory('');
    setSelectedPartFromList(null);
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newPart.name) errors.name = 'Название обязательно';
    if (newPart.stock < 0) errors.stock = 'Остаток не может быть отрицательным';
    if (newPart.price < 0) errors.price = 'Цена не может быть отрицательной';
    if (!newPart.lastOrderDate) errors.lastOrderDate = 'Дата обязательна';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePart = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingPart) {
        const partRef = doc(db, 'parts', editingPart.id);
        await updateDoc(partRef, newPart);
        showSnackbar('Запчасть успешно обновлена', 'success');
      } else {
        await addDoc(collection(db, 'parts'), newPart);
        showSnackbar('Запчасть успешно добавлена', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Ошибка при сохранении запчасти:", error);
      showSnackbar('Ошибка при сохранении: ' + error.message, 'error');
    }
  };

  const handleDeletePart = async (partId) => {
    try {
      const partRef = doc(db, 'parts', partId);
      await deleteDoc(partRef);
      showSnackbar('Запчасть успешно удалена', 'success');
    } catch (error) {
      console.error("Ошибка при удалении запчасти:", error);
      showSnackbar('Ошибка при удалении: ' + error.message, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleStockChange = (value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;
    
    const newAmount = numValue * newPart.price;
    setNewPart({
      ...newPart,
      stock: numValue,
      lastOrderAmount: newAmount,
      status: numValue <= 0 ? 'Нет в наличии' : newPart.status
    });
  };

  const handlePriceChange = (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    const newAmount = newPart.stock * numValue;
    setNewPart({ 
      ...newPart, 
      price: numValue,
      lastOrderAmount: newAmount 
    });
  };

  const handlePartSelect = (event, part) => {
    if (part) {
      const newAmount = newPart.stock * part.price;
      setNewPart({
        ...newPart,
        name: part.name,
        price: part.price,
        lastOrderAmount: newAmount
      });
      setSelectedPartFromList(part);
    } else {
      setNewPart({
        ...newPart,
        name: '',
        price: 0,
        lastOrderAmount: 0
      });
      setSelectedPartFromList(null);
    }
  };

  const getStockColor = (stock) => {
    if (stock <= 0) return 'error';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  // Вычисляем статистику
  const stats = {
    total: parts.length,
    inStock: parts.filter(p => p.stock > 0).length,
    lowStock: parts.filter(p => p.stock > 0 && p.stock <= 5).length,
    outOfStock: parts.filter(p => p.stock <= 0).length
  };

  // Получаем список категорий
  const categoryList = Object.keys(partsCategories.ninebot_max_pro);
  
  // Получаем запчасти для выбранной категории
  const partsInCategory = selectedCategory ? partsCategories.ninebot_max_pro[selectedCategory] : [];

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%)' }}>
            <Typography variant="h4" gutterBottom align="center" color="primary">
              Управление запчастями
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" mb={3}>
              Полный контроль над запасами и заказами
            </Typography>
            
            {/* Статистика */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#e3f2fd' }}>
                  <Typography variant="h6" color="primary">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">Всего запчастей</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#e8f5e9' }}>
                  <Typography variant="h6" color="success.main">{stats.inStock}</Typography>
                  <Typography variant="body2" color="textSecondary">В наличии</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#fff8e1' }}>
                  <Typography variant="h6" color="warning.main">{stats.lowStock}</Typography>
                  <Typography variant="body2" color="textSecondary">Малый запас</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#ffebee' }}>
                  <Typography variant="h6" color="error.main">{stats.outOfStock}</Typography>
                  <Typography variant="body2" color="textSecondary">Нет в наличии</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} mb={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Поиск по названию запчасти..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                  }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Фильтр по статусу</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Фильтр по статусу"
                    startAdornment={<FilterListIcon color="action" sx={{ mr: 1 }} />}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => setOpenDialog(true)}
                  startIcon={<AddCircleIcon />}
                >
                  Добавить запчасть
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 4 }}>
            <TableContainer>
              <Table aria-label="parts table">
                <TableHead>
                  <TableRow>
                    <TableCell sortDirection={sortConfig.key === 'name' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'name'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('name')}
                      >
                        Название
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig.key === 'stock' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'stock'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('stock')}
                      >
                        Остаток
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig.key === 'price' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'price'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('price')}
                      >
                        Цена за шт.
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig.key === 'lastOrderDate' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'lastOrderDate'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('lastOrderDate')}
                      >
                        Последняя дата заказа
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig.key === 'lastOrderAmount' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'lastOrderAmount'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('lastOrderAmount')}
                      >
                        Сумма заказа
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sortDirection={sortConfig.key === 'status' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig.key === 'status'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('status')}
                      >
                        Статус
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredParts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(part => (
                    <TableRow 
                      key={part.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                      }}
                    >
                      <TableCell>{part.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={part.stock} 
                          color={getStockColor(part.stock)} 
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{part.price.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>{part.lastOrderDate}</TableCell>
                      <TableCell>{part.lastOrderAmount.toLocaleString('ru-RU')} ₽</TableCell>
                      <TableCell>
                        <Chip 
                          icon={
                            part.status === 'На складе' ? <CheckCircleIcon fontSize="small" /> :
                            part.status === 'В пути' ? <WarningAmberIcon fontSize="small" /> :
                            <ErrorIcon fontSize="small" />
                          }
                          label={part.status} 
                          color={statusColors[part.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(part)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeletePart(part.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredParts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <WarningAmberIcon fontSize="large" color="action" />
                          <Typography variant="h6">Запчасти не найдены</Typography>
                          <Typography color="textSecondary">
                            Попробуйте изменить фильтры или добавить новые запчасти
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Divider sx={{ my: 2 }} />
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredParts.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} из ${count} ${count === 1 ? 'запчасть' : count < 5 ? 'запчасти' : 'запчастей'}`
              }
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          style: {
            borderRadius: 16,
            padding: '0 16px'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          p: 3,
          m: 0,
          '& .MuiTypography-root': {
            fontWeight: 600,
            fontSize: '1.5rem'
          }
        }}>
          {editingPart ? 'Редактировать запчасть' : 'Добавить новую запчасть'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {/* Выбор категории */}
            {!editingPart && (
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" size="small" margin="dense">
                  <InputLabel>Категория запчасти</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Категория запчасти"
                  >
                    {categoryList.map(category => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Выбор запчасти из списка */}
            {!editingPart && selectedCategory && (
              <Grid item xs={12}>
                <Autocomplete
                  options={partsInCategory}
                  getOptionLabel={(option) => option.name}
                  value={selectedPartFromList}
                  onChange={handlePartSelect}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Выберите запчасть" 
                      variant="outlined" 
                      size="small" 
                      margin="dense"
                    />
                  )}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                label="Название"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                error={!!validationErrors.name}
                helperText={validationErrors.name}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Остаток"
                type="number"
                value={newPart.stock}
                onChange={(e) => handleStockChange(e.target.value)}
                error={!!validationErrors.stock}
                helperText={validationErrors.stock}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Цена за шт."
                type="number"
                value={newPart.price}
                onChange={(e) => handlePriceChange(e.target.value)}
                error={!!validationErrors.price}
                helperText={validationErrors.price}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
                inputProps={{ min: 0 }}
                InputProps={{
                  endAdornment: <span style={{ color: 'grey' }}>₽</span>
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Последняя дата заказа"
                type="date"
                value={newPart.lastOrderDate}
                onChange={(e) => setNewPart({ ...newPart, lastOrderDate: e.target.value })}
                error={!!validationErrors.lastOrderDate}
                helperText={validationErrors.lastOrderDate}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Сумма заказа"
                value={newPart.lastOrderAmount.toLocaleString('ru-RU')}
                InputProps={{
                  readOnly: true,
                  endAdornment: <span style={{ color: 'grey' }}>₽</span>
                }}
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth margin="dense" size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={newPart.status}
                  onChange={(e) => setNewPart({ ...newPart, status: e.target.value })}
                  label="Статус"
                  startAdornment={
                    newPart.status === 'На складе' ? <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} /> :
                    newPart.status === 'В пути' ? <WarningAmberIcon fontSize="small" color="warning" sx={{ mr: 1 }} /> :
                    <ErrorIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                  }
                >
                  <MenuItem value="На складе">На складе</MenuItem>
                  <MenuItem value="Заказано">Заказано</MenuItem>
                  <MenuItem value="В пути">В пути</MenuItem>
                  <MenuItem value="Нет в наличии">Нет в наличии</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {newPart.stock <= 5 && newPart.stock > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'warning.light', 
                  borderLeft: '4px solid',
                  borderLeftColor: 'warning.dark',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Внимание! Остаток менее 5 штук. Рассмотрите возможность нового заказа.
                  </Typography>
                </Paper>
              </Grid>
            )}
            
            {newPart.stock <= 0 && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: 2, 
                  bgcolor: 'error.light', 
                  borderLeft: '4px solid',
                  borderLeftColor: 'error.dark',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <ErrorIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Запчасть отсутствует на складе. Необходимо срочно заказать.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="secondary">
            Отмена
          </Button>
          <Button 
            onClick={handleSavePart} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            {editingPart ? 'Обновить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Parts;
