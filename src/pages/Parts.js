// src/pages/Parts.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.js';
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
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TablePagination, 
  IconButton, 
  Chip 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const Parts = () => {
  const [user, setUser] = useState(null);
  const [parts, setParts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [newPart, setNewPart] = useState({
    name: '',
    stock: 0,
    price: 0,
    lastOrderDate: '',
    lastOrderAmount: 0,
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
    const partsCollection = collection(db, 'parts');
    const unsubscribe = onSnapshot(partsCollection, (snapshot) => {
      const partsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParts(partsList);
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

  const handleOpenDialog = (part) => {
    setEditingPart(part);
    setNewPart(part);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPart(null);
    setNewPart({
      name: '',
      stock: 0,
      price: 0,
      lastOrderDate: '',
      lastOrderAmount: 0,
      status: ''
    });
  };

  const handleSavePart = async () => {
    if (editingPart) {
      const partRef = doc(db, 'parts', editingPart.id);
      await updateDoc(partRef, newPart);
    } else {
      await addDoc(collection(db, 'parts'), newPart);
    }
    handleCloseDialog();
  };

  const handleDeletePart = async (partId) => {
    const partRef = doc(db, 'parts', partId);
    await deleteDoc(partRef);
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Запчасти
      </Typography>
      <Button variant="contained" color="primary" style={{ marginBottom: '20px' }} onClick={() => setOpenDialog(true)}>
        <AddCircleIcon /> Добавить запчасть
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="parts table">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Остаток</TableCell>
              <TableCell>Цена за шт.</TableCell>
              <TableCell>Последняя дата заказа</TableCell>
              <TableCell>Сумма заказа</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(part => (
              <TableRow key={part.id}>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.stock}</TableCell>
                <TableCell>{part.price}</TableCell>
                <TableCell>{part.lastOrderDate}</TableCell>
                <TableCell>{part.lastOrderAmount}</TableCell>
                <TableCell>
                  <Chip label={part.status} color="primary" />
                </TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpenDialog(part)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleDeletePart(part.id)}>
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
          count={parts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingPart ? 'Редактировать запчасть' : 'Добавить запчасть'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Название"
            value={newPart.name}
            onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Остаток"
            type="number"
            value={newPart.stock}
            onChange={(e) => setNewPart({ ...newPart, stock: parseInt(e.target.value, 10) })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Цена за шт."
            type="number"
            value={newPart.price}
            onChange={(e) => setNewPart({ ...newPart, price: parseFloat(e.target.value) })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Последняя дата заказа"
            type="date"
            value={newPart.lastOrderDate}
            onChange={(e) => setNewPart({ ...newPart, lastOrderDate: e.target.value })}
            required
            fullWidth
            margin="dense"
          />
          <TextField
            label="Сумма заказа"
            type="number"
            value={newPart.lastOrderAmount}
            onChange={(e) => setNewPart({ ...newPart, lastOrderAmount: parseFloat(e.target.value) })}
            required
            fullWidth
            margin="dense"
          />
          <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-standard-label">Статус</InputLabel>
            <Select
              labelId="demo-simple-select-standard-label"
              id="demo-simple-select-standard"
              value={newPart.status}
              onChange={(e) => setNewPart({ ...newPart, status: e.target.value })}
              label="Статус"
            >
              <MenuItem value="На складе">На складе</MenuItem>
              <MenuItem value="Заказано">Заказано</MenuItem>
              <MenuItem value="В пути">В пути</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSavePart}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Parts;