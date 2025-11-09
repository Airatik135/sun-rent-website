// src/pages/Repairs.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Repairs = () => {
  const [user, setUser] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [newRepair, setNewRepair] = useState({
    master: '',
    task: '',
    date: '',
    time: '',
    status: ''
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
    });
    return () => unsubscribe();
  }, [user]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (repair) => {
    setEditingRepair(repair);
    setNewRepair(repair);
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
      status: ''
    });
  };

  const handleSaveRepair = async () => {
    if (editingRepair) {
      const repairRef = doc(db, 'repairs', editingRepair.id);
      await updateDoc(repairRef, newRepair);
    } else {
      await addDoc(collection(db, 'repairs'), newRepair);
    }
    handleCloseDialog();
  };

  const handleDeleteRepair = async (repairId) => {
    const repairRef = doc(db, 'repairs', repairId);
    await deleteDoc(repairRef);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Ремонты мастеров
      </Typography>
      <Button variant="contained" color="primary" style={{ marginBottom: '20px' }} onClick={() => setOpenDialog(true)}>
        <AddCircleIcon /> Добавить ремонт
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="repairs table">
          <TableHead>
            <TableRow>
              <TableCell>Мастер</TableCell>
              <TableCell>Задача</TableCell>
              <TableCell>Дата</TableCell>
              <TableCell>Время</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {repairs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(repair => (
              <TableRow key={repair.id}>
                <TableCell>{repair.master}</TableCell>
                <TableCell>{repair.task}</TableCell>
                <TableCell>{repair.date}</TableCell>
                <TableCell>{repair.time}</TableCell>
                <TableCell>
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      value={repair.status}
                      onChange={(e) => {
                        const updatedRepair = { ...repair, status: e.target.value };
                        setRepairs(prevRepairs => prevRepairs.map(r => (r.id === repair.id ? updatedRepair : r)));
                        handleSaveRepair(updatedRepair);
                      }}
                    >
                      <MenuItem value="В работе">В работе</MenuItem>
                      <MenuItem value="Готово">Готово</MenuItem>
                      <MenuItem value="Отменено">Отменено</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(repair)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDeleteRepair(repair.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={repairs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <ExportButton data={repairs} />
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingRepair ? 'Редактировать ремонт' : 'Добавить ремонт'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Мастер"
            value={newRepair.master}
            onChange={(e) => setNewRepair({ ...newRepair, master: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Задача"
            value={newRepair.task}
            onChange={(e) => setNewRepair({ ...newRepair, task: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Дата"
            type="date"
            value={newRepair.date}
            onChange={(e) => setNewRepair({ ...newRepair, date: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Время"
            type="time"
            value={newRepair.time}
            onChange={(e) => setNewRepair({ ...newRepair, time: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Статус</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={newRepair.status}
              onChange={(e) => setNewRepair({ ...newRepair, status: e.target.value })}
              label="Статус"
            >
              <MenuItem value="В работе">В работе</MenuItem>
              <MenuItem value="Готово">Готово</MenuItem>
              <MenuItem value="Отменено">Отменено</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSaveRepair}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Repairs;