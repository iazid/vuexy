'use client'

import React, {  useState } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CustomTextField from '@core/components/mui/TextField';

const initialData = {
  name: '',
  description: ''
};

const AddProductTypeDrawer = ({ open, handleClose, setData }) => {
  const [formData, setFormData] = useState(initialData);

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  });

  const onSubmit = (data) => {
    const newProductType = {
      ...data,
      products: []
    };

    // Update local state
    setData(prevTypes => [...(prevTypes ?? []), newProductType]);
    handleClose();
    setFormData(initialData);
    resetForm(initialData);
  };

  const handleReset = () => {
    handleClose();
    setFormData(initialData);
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
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Add New Product Type</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Product Type Name'
                placeholder='Product Type Name'
                {...(errors.name && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Description'
                placeholder='Product Type Description'
                {...(errors.description && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              Submit
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddProductTypeDrawer;
