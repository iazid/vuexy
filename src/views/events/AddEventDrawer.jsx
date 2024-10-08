import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Drawer, IconButton, Typography, Divider, Box, TextField, CircularProgress, Switch, FormControlLabel } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { addEvent, selectEventsLoading } from '../../redux-store/slices/eventsSlice';
import EventModel from '../../utils/EventModel';

const initialData = new EventModel();

const AddEventDrawer = React.memo(({ open, handleClose, onEventAdded }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectEventsLoading);

  const { control, reset, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      date: '',
      time: '',
      address: '',
      description: '',
      place_description: '',
      dressed_up: false,
      regular_price: '',
      simpEntry: '',
    }
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
  };

  const onSubmit = async (formData) => {
    dispatch(addEvent({ formData, image }))
      .unwrap()
      .then((newEvent) => {
        onEventAdded(newEvent.id);
        handleReset();
      })
      .catch((error) => {
        console.error('Erreur lors de l\'ajout de l\'événement:', error);
      });
  };

  const handleReset = () => {
    handleClose();
    reset({
      name: '',
      date: '',
      time: '',
      address: '',
      description: '',
      place_description: '',
      dressed_up: false,
      regular_price: '',
      simpEntry: '',
    });
    setImage(null);
    setImagePreview(null);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500, md: 600 } } }}
    >
      <Box className='flex items-center justify-between p-5'>
        <Typography variant='h5'>Ajouter un nouvel événement</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </Box>
      <Divider />
      <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="raised-button-file">
          <Button variant="contained" component="span">
            Sélectionner une image
          </Button>
        </label>
        {imagePreview && (
          <Box sx={{ position: 'relative', display: 'inline-block' }}>
            <img src={imagePreview} alt="Aperçu de l'événement" style={{ width: '300px', height: 'auto', marginTop: '16px', marginBottom: '16px' }} />
            <IconButton
              sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255, 255, 255, 0.7)' }}
              onClick={handleImageRemove}
            >
              <i className='tabler-trash text-textPrimary' />
            </IconButton>
          </Box>
        )}
        <Controller
          name='name'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Nom'
              placeholder='Nom'
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ''}
            />
          )}
        />
        <Controller
          name='date'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="date"
              label='Date'
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date ? errors.date.message : ''}
              inputProps={{ min: today }} 
            />
          )}
        />
        <Controller
          name='time'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="time"
              label='Heure'
              InputLabelProps={{ shrink: true }}
              error={!!errors.time}
              helperText={errors.time ? errors.time.message : ''}
            />
          )}
        />
        <Controller
          name='address'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Adresse'
              placeholder='Adresse'
              error={!!errors.address}
              helperText={errors.address ? errors.address.message : ''}
            />
          )}
        />
        <Controller
          name='description'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
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
        <Controller
          name='place_description'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Description du lieu'
              placeholder='Description du lieu'
              error={!!errors.place_description}
              helperText={errors.place_description ? errors.place_description.message : ''}
            />
          )}
        />
        <Controller
          name='dressed_up'
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Tenue habillée"
            />
          )}
        />
        <Controller
          name='regular_price'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label='Prix régulier'
              placeholder='Prix régulier'
              error={!!errors.regular_price}
              helperText={errors.regular_price ? errors.regular_price.message : ''}
            />
          )}
        />
        <Controller
          name='simpEntry'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label='Entrée simple'
              placeholder='Entrée simple'
              error={!!errors.simpEntry}
              helperText={errors.simpEntry ? errors.simpEntry.message : ''}
            />
          )}
        />
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Terminer'}
          </Button>
          <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
});

export default AddEventDrawer;
