'use client'

import React, { useState } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, Grid } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';

const initialData = {
  name: '',
  description: '',
  type: '',
  capacities: [{ price: 0, quantity: 0, capacity: 0, unit: 'CL' }]
};

const AddProductDrawer = ({ open, handleClose, productData, setData, productTypes }) => {
  const { control, reset, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'capacities'
  });

  const onSubmit = data => {
    const newProduct = {
      id: (productData?.length && productData?.length + 1) || 1,
      pic: `/images/products/default.png`, // Replace with actual image upload logic
      ...data
    };

    setData([...(productData ?? []), newProduct]);
    handleClose();
    reset(initialData);
  };

  const handleReset = () => {
    handleClose();
    reset(initialData);
  };

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500, md: 600 } } }} // Increase the width here
    >
      <Box className='flex items-center justify-between p-5'>
        <Typography variant='h5'>Ajouter un nouveau produit</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </Box>
      <Divider />
      <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
        <Controller
          name='name'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Nom du produit'
              placeholder='Nom du produit'
              {...(errors.name && { error: true, helperText: 'Ce champ est requis.' })}
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
              label='Description (facultatif)'
              placeholder='Description du produit'
            />
          )}
        />
        <Controller
          name='type'
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <TextField
              select
              fullWidth
              label='Type de produit'
              {...field}
              {...(errors.type && { error: true, helperText: 'Ce champ est requis.' })}
            >
              {productTypes.map(type => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Box>
          <Typography variant='h6'>Contenances</Typography>
          <br/>
          {fields.map((field, index) => (
            <Grid container spacing={2} alignItems="center" key={field.id} sx={{ marginBottom: 2 }}>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.price`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Prix'
                      type='number'
                      fullWidth
                      {...(errors.capacities?.[index]?.price && { error: true, helperText: 'Ce champ est requis.' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.quantity`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Quantité'
                      type='number'
                      fullWidth
                      {...(errors.capacities?.[index]?.quantity && { error: true, helperText: 'Ce champ est requis.' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.capacity`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Capacité'
                      type='number'
                      fullWidth
                      {...(errors.capacities?.[index]?.capacity && { error: true, helperText: 'Ce champ est requis.' })}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <Controller
                  name={`capacities.${index}.unit`}
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth variant='standard'>
                      <InputLabel shrink={false}></InputLabel>
                      <Select {...field} disableUnderline>
                        <MenuItem value="CL">CL</MenuItem>
                        <MenuItem value="L">L</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => remove(index)}>
                  <i className='tabler-trash text-textSecondary' />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={() => append({ price: 0, quantity: 0, capacity: 0, unit: 'CL' })}>
            Ajouter une contenance
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit'>
            Terminer
          </Button>
          <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddProductDrawer;
