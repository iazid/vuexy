import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, CircularProgress, Typography, IconButton } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { addDoc, collection, Timestamp, doc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { adb } from '../../../app/firebase/firebaseconfigdb';
import { Save as SaveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import TableModel from '../../../utils/TableModel';

const AddTableForm = ({ eventId, refreshCb }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      tableName: '',
      price: '',
      guests: '',
      tableNumber: '',
      description: '',
    }
  });

  const clearForm = () => {
    reset({
      tableName: '',
      price: '',
      guests: '',
      tableNumber: '',
      description: '',
    });
  };

  const fetchTables = async () => {
    setLoading(true);
    try {
      const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', doc(adb, 'events', eventId)));
      const querySnapshot = await getDocs(tablesQuery);
      const tablesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTables(tablesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tableId) => {
    try {
      await deleteDoc(doc(adb, 'tables', tableId));
      fetchTables();
    } catch (error) {
      console.error("Erreur lors de la suppression de la table:", error);
    }
  };

  const handleEditChange = (tableId, field, value) => {
    setTables(tables => tables.map(table =>
      table.id === tableId ? { ...table, [field]: value } : table
    ));
  };

  const handleSave = async (tableId) => {
    const table = tables.find(t => t.id === tableId);
    try {
      await updateDoc(doc(adb, 'tables', tableId), {
        name: table.name,
        price: Number(table.price),
        size: Number(table.size),
        quantity: Number(table.quantity),
      });
      fetchTables();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la table:", error);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchTables();
    }
  }, [eventId]);

  const onSubmit = async (data) => {
    const eventRef = doc(adb, 'events', eventId);

    const tableData = new TableModel({
      name: data.tableName.charAt(0).toUpperCase() + data.tableName.slice(1),
      price: parseInt(data.price, 10),
      size: parseInt(data.guests, 10),
      quantity: parseInt(data.tableNumber, 10),
      eventRef: eventRef,
      date: Timestamp.now(),
    });

    try {
      await addDoc(collection(adb, 'tables'), tableData.toPlainObject());
      clearForm();
      fetchTables();
      if (refreshCb) refreshCb(); // Appel à la fonction de rafraîchissement si fournie
    } catch (error) {
      console.error("Erreur lors de l'ajout de la table:", error);
    }
  };

  return (
    <Box>
      <Box mt={4}>
        <Typography variant='h5'>Tables existantes</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          tables.length > 0 ? (
            tables.map(table => (
              <Box key={table.id} display="flex" alignItems="center" mt={2} p={2} border={1} borderRadius={1}>
                <TextField
                  label="Nom de la table"
                  value={table.name}
                  onChange={(e) => handleEditChange(table.id, 'name', e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ mr: 2, flex: 1 }}
                />
                <TextField
                  label="Prix (€)"
                  type="number"
                  value={table.price}
                  onChange={(e) => handleEditChange(table.id, 'price', e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ mr: 2, flex: 1 }}
                />
                <TextField
                  label="Nombre d'invités"
                  type="number"
                  value={table.size}
                  onChange={(e) => handleEditChange(table.id, 'size', e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ mr: 2, flex: 1 }}
                />
                <TextField
                  label="Nombre de tables"
                  type="number"
                  value={table.quantity}
                  onChange={(e) => handleEditChange(table.id, 'quantity', e.target.value)}
                  margin="dense"
                  variant="outlined"
                  sx={{ mr: 2, flex: 1 }}
                />
                
                <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
                  <IconButton color="primary" onClick={() => handleSave(table.id)}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(table.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))
          ) : (
            <Typography variant="body2">Aucune table n'a encore été ajoutée pour cet événement.</Typography>
          )
        )}
      </Box>
      <br />
      <br />
      <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
        <Controller
          name='tableName'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Nom de la table'
              placeholder='Nom de la table'
              error={!!errors.tableName}
              helperText={errors.tableName ? errors.tableName.message : ''}
            />
          )}
        />
        <Controller
          name='price'
          control={control}
          rules={{ 
            required: 'Ce champ est requis.', 
            min: { value: 0, message: 'Le prix doit être supérieur ou égal à 0' } 
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label='Prix'
              placeholder='Prix'
              error={!!errors.price}
              helperText={errors.price ? errors.price.message : ''}
            />
          )}
        />
        <Controller
          name='guests'
          control={control}
          rules={{ 
            required: 'Ce champ est requis.', 
            min: { value: 1, message: "Le nombre d'invités doit être au moins de 1" }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Nombre d'invités"
              placeholder="Nombre d'invités"
              error={!!errors.guests}
              helperText={errors.guests ? errors.guests.message : ''}
            />
          )}
        />
        <Controller
          name='tableNumber'
          control={control}
          rules={{ 
            required: 'Ce champ est requis.', 
            min: { value: 1, message: 'Le nombre de tables doit être au moins de 1' }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label='Nombre de tables'
              placeholder='Nombre de tables'
              error={!!errors.tableNumber}
              helperText={errors.tableNumber ? errors.tableNumber.message : ''}
            />
          )}
        />
        <Controller
          name='description'
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={4}
              label='Description'
              placeholder='Description'
              error={!!errors.description}
              helperText={errors.description ? errors.description.message : ''}
            />
          )}
        />
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit'>
            Ajouter
          </Button>
          <Button variant='tonal' color='error' onClick={clearForm}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTableForm;
