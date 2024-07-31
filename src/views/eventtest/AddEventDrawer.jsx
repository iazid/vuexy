import React, { useState } from 'react';
import { Button, Drawer, IconButton, Typography, Divider, Box, InputBase, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Timestamp, GeoPoint } from 'firebase/firestore';
import FirebaseService from '../../app/firebase/firebaseService';
import { collection, doc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EventModel from '../../utils/EventModel';

const initialData = new EventModel();

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
      const dateTimeString = `${data.date.toISOString().split('T')[0]}T${data.time}:00`;
      const eventTimestamp = Timestamp.fromDate(new Date(dateTimeString));

      const eventDocRef = doc(collection(adb, 'events')); 
      const newEventRef = await FirebaseService.addEvent(eventDocRef, {
        ...data,
        date: eventTimestamp,
        time: eventTimestamp, 
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
            <InputBase
              {...field}
              fullWidth
              placeholder='Nom'
              error={!!errors.name}
              style={{ border: errors.name ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='date'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              type="date"
              placeholder='Date'
              error={!!errors.date}
              style={{ border: errors.date ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='time'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              type="time"
              placeholder='Heure'
              error={!!errors.time}
              style={{ border: errors.time ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='address'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              placeholder='Adresse'
              error={!!errors.address}
              style={{ border: errors.address ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='description'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              multiline
              rows={4}
              placeholder='Description'
              error={!!errors.description}
              style={{ border: errors.description ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='place_description'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              placeholder='Description du lieu'
              error={!!errors.place_description}
              style={{ border: errors.place_description ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
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
            <InputBase
              {...field}
              fullWidth
              type="number"
              placeholder='Prix régulier'
              error={!!errors.regular_price}
              style={{ border: errors.regular_price ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
            />
          )}
        />
        <Controller
          name='simpEntry'
          control={control}
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <InputBase
              {...field}
              fullWidth
              type="number"
              placeholder='Entrée simple'
              error={!!errors.simpEntry}
              style={{ border: errors.simpEntry ? '1px solid red' : '1px solid grey', padding: '8px', borderRadius: '4px' }}
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
