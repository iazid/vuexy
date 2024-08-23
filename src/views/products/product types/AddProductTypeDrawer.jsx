import React from 'react';
import { Button, Drawer, IconButton, Typography, Divider, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CustomTextField from '@core/components/mui/TextField';
import FirebaseService from '../../../app/firebase/firebaseService';
import { useDispatch } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import { CATEGORY, PRODUCT_TYPE } from '../../../utils/ProductType';

const initialData = {
  name: '',
  description: '',
  type: PRODUCT_TYPE.CONSUMABLE,
  category: CATEGORY.NONE
};

const productTypeOptions = ['Boisson', 'Soft', 'Nourriture', 'Goodies', 'Matériel'];

const AddProductTypeDrawer = React.memo (({ open, handleClose, setData }) => {
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
      await FirebaseService.addProductType(data.category, data.type, data.name, data.description);
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
      sx={{ '& .MuiDrawer-paper': { width: { xs: 400, sm: 500 } } }}
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
                error={!!errors.name}
                helperText={errors.name ? 'Ce champ est requis.' : ''}
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
                error={!!errors.description}
                helperText={errors.description ? 'Ce champ est requis.' : ''}
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
                value={field.value} // Ajout de la valeur contrôlée
                onChange={(e) => field.onChange(Number(e.target.value))}
              >
                {Object.values(PRODUCT_TYPE).map((value, index) => (
                  <FormControlLabel
                    key={value}
                    value={value} // Assurez-vous que la valeur correspond à PRODUCT_TYPE
                    control={<Radio />}
                    label={productTypeOptions[index]}
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
});

export default AddProductTypeDrawer;
