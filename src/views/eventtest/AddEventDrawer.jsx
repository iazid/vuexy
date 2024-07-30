import React, { useState } from 'react';
import { Button, Drawer, IconButton, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import FirebaseService from '../../app/firebase/firebaseService';
import { collection, doc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialData = {
  name: '',
  date: '',
  time: '',
  address: '',
  description: '',
  place_description: '',
  dressed_up: false,
  regular_price: 0,
  simpEntry: 0,
};

const AddEventDrawer = ({ open, handleClose, onEventAdded }) => {
  const { control, reset, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const dateTimeString = `${data.date}T${data.time}:00`;
      const eventTimestamp = Timestamp.fromDate(new Date(dateTimeString));

      const eventDocRef = doc(collection(adb, 'events')); // Créer une référence de document valide
      const newEventRef = await FirebaseService.addEvent(eventDocRef, {
        name: data.name,
        date: eventTimestamp,
        time: eventTimestamp, 
        address: data.address,
        description: data.description,
        place_description: data.place_description,
        dressed_up: data.dressed_up,
        regular_price: parseFloat(data.regular_price),
        simpEntry: parseFloat(data.simpEntry),
        visible: true,
        simpCount: 0,
        place: new GeoPoint(48.86717729999999, 2.3071846),
        imageUri: '',
        croppedUri: '',
        pic: ''
      });

      if (image) {
        const normalImagePath = await FirebaseService.uploadEventImage(image, newEventRef.id, 'pic');
        const croppedImagePath = await FirebaseService.uploadEventImage(image, newEventRef.id, 'pic_cropped');
        await FirebaseService.updateEvent(newEventRef, { imageUri: normalImagePath, croppedUri: croppedImagePath, pic: normalImagePath });
      }

      onEventAdded(newEventRef.id);
      toast.success('Événement ajouté avec succès!');
      handleClose();
      reset(initialData);
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'événement:', error);
      toast.error('Erreur lors de l\'ajout de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    handleClose();
    reset(initialData);
    setImage(null);
    setImagePreview(null);
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Ajouter un nouvel événement</Typography>
        <IconButton onClick={handleReset}>
          <i className='tabler-x text-textPrimary' />
        </IconButton>
      </Box>
      <Divider />
      <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
        <TextField
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
            <img src={imagePreview} alt="Aperçu de l'événement" style={{ width: '100%', height: 'auto', marginTop: '16px', marginBottom: '16px' }} />
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
              label='Date '
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date ? errors.date.message : ''}
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
            <FormControl fullWidth>
              <InputLabel>Tenue habillée</InputLabel>
              <Select
                {...field}
                label="Tenue habillée"
              >
                <MenuItem value={true}>Oui</MenuItem>
                <MenuItem value={false}>Non</MenuItem>
              </Select>
            </FormControl>
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
            {loading ? <CircularProgress size={24} /> : 'Soumettre'}
          </Button>
          <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
            Annuler
          </Button>
        </Box>
      </Box>
      <ToastContainer />
    </Drawer>
  );
};

export default AddEventDrawer;
