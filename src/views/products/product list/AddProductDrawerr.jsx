import React, { useState, useEffect } from 'react';
import { Button, Drawer, IconButton, Typography, Divider, TextField, MenuItem, CircularProgress } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import FirebaseService from '../../../app/firebase/firebaseService';
import { uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import CapacitiesRow from '../../../utils/CapacityRow';  // Assuming CapacitiesRow is defined in a separate file

const initialData = {
  name: '',
  description: '',
  type: ''
};

const AddProductDrawer = ({ open, handleClose, setData }) => {
  const dispatch = useDispatch();
  const productTypes = useSelector(state => state.productTypes);
  
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData
  });

  const [selectedProductType, setSelectedProductType] = useState(productTypes[0] || '');
  const [productImage, setProductImage] = useState(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capacities, setCapacities] = useState([]);

  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  const onSubmit = async (data) => {
    const newProduct = {
      ...data,
      products: []
    };

    try {
      // Upload product image
      const storageRef = ref(FirebaseService.storage, `products/${newProductRef.id}/${productImage.name}`);
      await uploadBytes(storageRef, productImage);
      const imageUrl = await getDownloadURL(storageRef);

      // Add new product
      await FirebaseService.addProduct({ ...data, imageUrl, type: selectedProductType });
      
      setData(prevProducts => [...(prevProducts ?? []), newProduct]);
      
      handleClose();
      resetForm(initialData);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit.');
    }
  };

  const handleReset = () => {
    handleClose();
    resetForm(initialData);
  };

  const handleImageSelect = (event) => {
    if (event.target.files && event.target.files[0]) {
      setProductImage(event.target.files[0]);
      setImageSelected(true);
    }
  };

  const addCapacityRow = () => {
    setCapacities([...capacities, { capacity: '', unity: 'CENTILITRES', price: '', quantity: '' }]);
  };

  const handleCapacityChange = (index, field, value) => {
    const newCapacities = [...capacities];
    newCapacities[index][field] = value;
    setCapacities(newCapacities);
  };

  const removeCapacity = (index) => {
    const newCapacities = [...capacities];
    newCapacities.splice(index, 1);
    setCapacities(newCapacities);
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
        <Typography variant='h5'>Ajouter un nouveau produit</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 p-6'>
          <div>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="raised-button-file"
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="raised-button-file">
              <Button variant="contained" component="span">
                Sélectionner une image
              </Button>
            </label>
            {imageSelected && (
              <Typography variant="body2">{productImage.name}</Typography>
            )}
          </div>
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
                error={!!errors.name}
                helperText={errors.name ? 'Ce champ est requis.' : ''}
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
              <TextField
                {...field}
                select
                fullWidth
                label='Type de produit'
                value={selectedProductType}
                onChange={(e) => {
                  setSelectedProductType(e.target.value);
                  field.onChange(e.target.value);
                }}
                error={!!errors.type}
                helperText={errors.type ? 'Ce champ est requis.' : ''}
              >
                {productTypes.map((option) => (
                  <MenuItem key={option.id} value={option}>
                    {option.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <div>
            {capacities.map((capacity, index) => (
              <CapacitiesRow
                key={index}
                index={index}
                capacity={capacity}
                handleCapacityChange={handleCapacityChange}
                removeCapacity={removeCapacity}
              />
            ))}
            <Button variant='contained' onClick={addCapacityRow}>
              Ajouter une contenance
            </Button>
          </div>
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Ajouter'}
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

export default AddProductDrawer;
