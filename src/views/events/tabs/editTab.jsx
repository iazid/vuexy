// EditEventForm.js

import React from 'react';
import { Box, Button, CircularProgress, IconButton, TextField, FormControlLabel, Switch, Typography} from '@mui/material';
import { Controller } from 'react-hook-form';

const EditEventForm = ({
  control,
  handleSubmit,
  setValue,
  errors,
  loading,
  handleImageChange,
  handleImageRemove,
  imagePreview,
  today,
  onSubmit,
  router,
  setDrawerOpen
}) => (
    <div>
    <Box>
  <br />
 </Box>
  <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
    <input
      accept="image/*"
      style={{ display: 'none' }}
      id="raised-button-file-edit"
      type="file"
      onChange={handleImageChange}
    />
    <label htmlFor="raised-button-file-edit">
      <Button variant="contained" component="span">
        Sélectionner une image
      </Button>
    </label>
    {imagePreview && (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginY: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <img src={imagePreview} alt="Aperçu de l'événement" style={{ maxWidth: '400px', maxHeight: '400px', objectFit: 'contain' }} />
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255, 255, 255, 0.7)' }}
            onClick={handleImageRemove}
          >
            <i className='tabler-trash text-textPrimary' />
          </IconButton>
        </Box>
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
          control={<Switch {...field} checked={!!field.value} />}
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
      <Button variant='tonal' color='error' type='reset' onClick={() => router.push('/events/eventpage')}>
        Annuler
      </Button>
    </Box>
  </Box>
  </div>
);

export default EditEventForm;
