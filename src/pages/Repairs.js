// src/pages/Repairs.js
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
import ExportButton from '../components/ExportButton.js';
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
  Grid,
  Box,
  Chip,
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

const Repairs = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [user, setUser] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [newRepair, setNewRepair] = useState({
    master: '',
    task: '',
    date: '',
    time: '',
    status: 'В работе'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Все');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'descending' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [validationErrors, setValidationErrors] = useState({});

  // Статусы с цветами для чипов
  const statusColors = {
    'В работе': 'warning',
    'Готово': 'success',
    'Отменено': 'error'
  };

  const statusIcons = {
    'В работе': <WarningAmberIcon fontSize="small" />,
    'Готово': <CheckCircleIcon fontSize="small" />,
    'Отменено': <ErrorIcon fontSize="small" />
  };

  // Статусы для фильтра
  const statusOptions = ['Все', 'В работе', 'Готово', 'Отменено'];

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
    const repairsCollection = collection(db, 'repairs');
    const unsubscribe = onSnapshot(repairsCollection, (snapshot) => {
      const repairsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRepairs(repairsList);
      setFilteredRepairs(repairsList);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    filterAndSortRepairs();
  }, [repairs, searchTerm, statusFilter, sortConfig]);

  const filterAndSortRepairs = () => {
    let result = [...repairs];
    
    // Поиск
    if (searchTerm) {
      result = result.filter(repair => 
        repair.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.master.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Фильтр по статусу
    if (statusFilter !== 'Все') {
      result = result.filter(repair => repair.status === statusFilter);
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
    
    setFilteredRepairs(result);
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

  const handleOpenDialog = (repair) => {
    setEditingRepair(repair);
    setNewRepair(repair || {
      master: '',
      task: '',
      date: '',
      time: '',
      status: 'В работе'
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRepair(null);
    setNewRepair({
      master: '',
      task: '',
      date: '',
      time: '',
      status: 'В работе'
    });
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!newRepair.master) errors.master = 'Имя мастера обязательно';
    if (!newRepair.task) errors.task = 'Задача обязательна';
    if (!newRepair.date) errors.date = 'Дата обязательна';
    if (!newRepair.time) errors.time = 'Время обязательно';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRepair = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (editingRepair) {
        const repairRef = doc(db, 'repairs', editingRepair.id);
        await updateDoc(repairRef, newRepair);
        showSnackbar('Ремонт успешно обновлен', 'success');
      } else {
        await addDoc(collection(db, 'repairs'), newRepair);
        showSnackbar('Ремонт успешно добавлен', 'success');
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Ошибка при сохранении ремонта:", error);
      showSnackbar('Ошибка при сохранении: ' + error.message, 'error');
    }
  };

  const handleDeleteRepair = async (repairId) => {
    try {
      const repairRef = doc(db, 'repairs', repairId);
      await deleteDoc(repairRef);
      showSnackbar('Ремонт успешно удален', 'success');
    } catch (error) {
      console.error("Ошибка при удалении ремонта:", error);
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

  const handleStatusChange = (repair, status) => {
    const updatedRepair = { ...repair, status };
    setRepairs(prevRepairs => 
      prevRepairs.map(r => r.id === repair.id ? updatedRepair : r)
    );
    
    // Автоматическое сохранение статуса
    const repairRef = doc(db, 'repairs', repair.id);
    updateDoc(repairRef, { status });
  };

  // Вычисляем статистику
  const stats = {
    total: repairs.length,
    inProgress: repairs.filter(r => r.status === 'В работе').length,
    completed: repairs.filter(r => r.status === 'Готово').length,
    cancelled: repairs.filter(r => r.status === 'Отменено').length
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px', paddingLeft: 16, paddingRight: 16 }}>
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
            <Typography variant="h3" gutterBottom align="center" color="primary" sx={{ 
              fontWeight: 700, 
              textShadow: '0 2px 4px rgba(0,0,0,0.2)', 
              letterSpacing: '0.5px',
              background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Ремонты мастеров
            </Typography>
            <Typography variant="body1" align="center" color="textSecondary" mb={3}>
              Управление и отслеживание ремонтов самокатов
            </Typography>
            
            {/* Статистика */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#e3f2fd' }}>
                  <Typography variant="h6" color="primary">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">Всего ремонтов</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#fff8e1' }}>
                  <Typography variant="h6" color="warning.main">{stats.inProgress}</Typography>
                  <Typography variant="body2" color="textSecondary">В работе</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#e8f5e9' }}>
                  <Typography variant="h6" color="success.main">{stats.completed}</Typography>
                  <Typography variant="body2" color="textSecondary">Завершено</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2, textAlign: 'center', borderRadius: 2, background: '#ffebee' }}>
                  <Typography variant="h6" color="error.main">{stats.cancelled}</Typography>
                  <Typography variant="body2" color="textSecondary">Отменено</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} mb={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Поиск по задаче или мастеру..."
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
                  Добавить ремонт
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 4 }}>
            <TableContainer>
              <Table aria-label="repairs table">
                <TableHead>
                  <TableRow>
                    {/* Улучшенный заголовок "Мастер" */}
                    <TableCell 
                      sortDirection={sortConfig.key === 'master' ? sortConfig.direction : false}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        borderTopLeftRadius: '8px',
                        position: 'relative',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === 'master'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('master')}
                        sx={{
                          '& .MuiTableSortLabel-icon': { 
                            opacity: 0.7,
                            color: 'primary.main',
                            transition: 'opacity 0.2s'
                          },
                          '&:hover': {
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        Мастер
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Улучшенный заголовок "Задача" */}
                    <TableCell 
                      sortDirection={sortConfig.key === 'task' ? sortConfig.direction : false}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === 'task'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('task')}
                        sx={{
                          '& .MuiTableSortLabel-icon': { 
                            opacity: 0.7,
                            color: 'primary.main',
                            transition: 'opacity 0.2s'
                          },
                          '&:hover': {
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        Задача
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Улучшенный заголовок "Дата" */}
                    <TableCell 
                      sortDirection={sortConfig.key === 'date' ? sortConfig.direction : false}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === 'date'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('date')}
                        sx={{
                          '& .MuiTableSortLabel-icon': { 
                            opacity: 0.7,
                            color: 'primary.main',
                            transition: 'opacity 0.2s'
                          },
                          '&:hover': {
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        Дата
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Улучшенный заголовок "Время" */}
                    <TableCell 
                      sortDirection={sortConfig.key === 'time' ? sortConfig.direction : false}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === 'time'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('time')}
                        sx={{
                          '& .MuiTableSortLabel-icon': { 
                            opacity: 0.7,
                            color: 'primary.main',
                            transition: 'opacity 0.2s'
                          },
                          '&:hover': {
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        Время
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Улучшенный заголовок "Статус" */}
                    <TableCell 
                      sortDirection={sortConfig.key === 'status' ? sortConfig.direction : false}
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      <TableSortLabel
                        active={sortConfig.key === 'status'}
                        direction={sortConfig.direction}
                        onClick={() => requestSort('status')}
                        sx={{
                          '& .MuiTableSortLabel-icon': { 
                            opacity: 0.7,
                            color: 'primary.main',
                            transition: 'opacity 0.2s'
                          },
                          '&:hover': {
                            '& .MuiTableSortLabel-icon': {
                              opacity: 1
                            }
                          }
                        }}
                      >
                        Статус
                      </TableSortLabel>
                    </TableCell>
                    
                    {/* Улучшенный заголовок "Действия" */}
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        color: 'primary.dark',
                        padding: '14px 16px',
                        border: 'none',
                        verticalAlign: 'top',
                        backgroundColor: '#f8f9fa',
                        borderTopRightRadius: '8px',
                        '&:after': {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          height: '2px',
                          backgroundColor: 'primary.main',
                        }
                      }}
                    >
                      Действия
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRepairs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map(repair => (
                    <TableRow 
                      key={repair.id}
                      hover
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 'bold', borderLeft: '3px solid #1a237e', pl: 2 }}>{repair.master}</TableCell>
                      <TableCell>{repair.task}</TableCell>
                      <TableCell>{repair.date}</TableCell>
                      <TableCell>{repair.time}</TableCell>
                      <TableCell>
                        <Chip 
                          icon={statusIcons[repair.status]}
                          label={repair.status} 
                          color={statusColors[repair.status] || 'default'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(repair)}
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteRepair(repair.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredRepairs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                          <WarningAmberIcon fontSize="large" color="action" />
                          <Typography variant="h6">Ремонты не найдены</Typography>
                          <Typography color="textSecondary">
                            Попробуйте изменить фильтры или добавить новые ремонты
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
              count={filteredRepairs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Строк на странице"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} из ${count} ${count === 1 ? 'ремонт' : count < 5 ? 'ремонта' : 'ремонтов'}`
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
          {editingRepair ? 'Редактировать ремонт' : 'Добавить новый ремонт'}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Мастер"
                value={newRepair.master}
                onChange={(e) => setNewRepair({ ...newRepair, master: e.target.value })}
                error={!!validationErrors.master}
                helperText={validationErrors.master}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Задача"
                value={newRepair.task}
                onChange={(e) => setNewRepair({ ...newRepair, task: e.target.value })}
                error={!!validationErrors.task}
                helperText={validationErrors.task}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Дата"
                type="date"
                value={newRepair.date}
                onChange={(e) => setNewRepair({ ...newRepair, date: e.target.value })}
                error={!!validationErrors.date}
                helperText={validationErrors.date}
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
                label="Время"
                type="time"
                value={newRepair.time}
                onChange={(e) => setNewRepair({ ...newRepair, time: e.target.value })}
                error={!!validationErrors.time}
                helperText={validationErrors.time}
                required
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="outlined" fullWidth margin="dense" size="small">
                <InputLabel>Статус</InputLabel>
                <Select
                  value={newRepair.status}
                  onChange={(e) => setNewRepair({ ...newRepair, status: e.target.value })}
                  label="Статус"
                  startAdornment={
                    newRepair.status === 'Готово' ? <CheckCircleIcon fontSize="small" color="success" sx={{ mr: 1 }} /> :
                    newRepair.status === 'В работе' ? <WarningAmberIcon fontSize="small" color="warning" sx={{ mr: 1 }} /> :
                    <ErrorIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                  }
                >
                  <MenuItem value="В работе">В работе</MenuItem>
                  <MenuItem value="Готово">Готово</MenuItem>
                  <MenuItem value="Отменено">Отменено</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} color="secondary">
            Отмена
          </Button>
          <Button 
            onClick={handleSaveRepair} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            {editingRepair ? 'Обновить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Repairs;
