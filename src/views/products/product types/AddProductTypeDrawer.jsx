

import React from 'react';
import { Button, Drawer, IconButton, Typography, Divider, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CustomTextField from '@core/components/mui/TextField';
import FirebaseService from '../../../app/firebase/firebaseService';
import { useDispatch } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType'; // Importez l'action de récupération des types de produits

const initialData = {
  name: '',
  description: '',
  type: ''
};

const productTypeOptions = ['Boisson', 'Soft', 'Nourriture', 'Goodies', 'Matériel'];

const AddProductTypeDrawer = ({ open, handleClose, setData }) => {
  const dispatch = useDispatch();

  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  });

  const onSubmit = async (data) => {
    const newProductType = {
      ...data,
      products: []
    };

    try {
      
      await FirebaseService.addProductType(data.type, data.type, data.name, data.description);
      
      setData(prevTypes => [...(prevTypes ?? []), newProductType]);
      
      dispatch(fetchProductTypes());
      handleClose();
      resetForm(initialData);
    } catch (error) {
      console.error('Error adding product type:', error);
      alert('Erreur lors de l\'ajout du type de produit.');
    }
  };

  const handleReset = () => {
    handleClose();
    resetForm(initialData);
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
        <Typography variant='h5'>Ajouter un nouveau type de produit</Typography>
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
                label='Nom du type de produit'
                placeholder='Nom du type de produit'
                {...(errors.name && { error: true, helperText: 'Ce champ est requis.' })}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Description (facultatif)'
                placeholder='Description du type de produit'
                {...(errors.description && { error: true, helperText: 'Ce champ est requis.' })}
              />
            )}
          />
          <Controller
            name='type'
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <RadioGroup
                {...field}
                onChange={(e) => field.onChange(e.target.value)}
              >
                {productTypeOptions.map(option => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            )}
          />
          {errors.type && <Typography color="error">Veuillez sélectionner un type de produit.</Typography>}
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit'>
              Ajouter
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
};

export default AddProductTypeDrawer;
