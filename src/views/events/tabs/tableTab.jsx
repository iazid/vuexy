// AddTableForm.js

import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';

const AddTableForm = ({ handleClose }) => {
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      tableName: '',
      price: '',
      guests: '',
      tableNumber: '',
      description: '',
    }
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
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
        rules={{ required: 'Ce champ est requis.' }}
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
        rules={{ required: 'Ce champ est requis.' }}
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
        rules={{ required: 'Ce champ est requis.' }}
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
      <Box display="flex" justifyContent="space-between">
        <Button variant='contained' type='submit'>
          Ajouter
        </Button>
        <Button variant='tonal' color='error' onClick={handleClose}>
          Annuler
        </Button>
      </Box>
    </Box>
  );
};

export default AddTableForm;
 