// AddProductDrawer.js
'use client'

import React, { useState } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CustomTextField from '@core/components/mui/TextField';

const initialData = {
  description: '',
  price: 0,
  type: ''
};

const AddProductDrawer = ({ open, handleClose, productData, setData, productTypes }) => {
  const [formData, setFormData] = useState(initialData);

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      type: ''
    }
  });

  const onSubmit = data => {
    const newProduct = {
      id: (productData?.length && productData?.length + 1) || 1,
      pic: `/images/products/default.png`, // Replace with actual image upload logic
      ...data,
      numberOfCapacities: 0 // Initially set to 0
    };

    setData([...(productData ?? []), newProduct]);
    handleClose();
    setFormData(initialData);
    resetForm({ name: '', description: '', price: 0, type: '' });
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
        <Typography variant='h5'>Add New Product</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(data => onSubmit(data))} className='flex flex-col gap-6 p-6'>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Product Name'
                placeholder='Product Name'
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
                placeholder='Product Description'
                {...(errors.description && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='price'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                type='number'
                label='Price'
                placeholder='Price'
                {...(errors.price && { error: true, helperText: 'This field is required.' })}
              />
            )}
          />
          <Controller
            name='type'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <CustomTextField
                select
                fullWidth
                label='Select Type'
                {...field}
                {...(errors.type && { error: true, helperText: 'This field is required.' })}
              >
                {productTypes.map(type => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </CustomTextField>
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

export default AddProductDrawer;
