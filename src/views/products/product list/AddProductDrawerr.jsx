'use client'

import React, { useState, useEffect } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, Grid, Avatar } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, doc, setDoc } from 'firebase/firestore';
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import Product from '../../../utils/Product';

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

  const onSubmit = async (data) => {
    if (!image) {
      alert('Veuillez sélectionner une image.');
      return;
    }

    setLoading(true);

    try {
      const newProductRef = doc(collection(adb, 'products'));
      const productImageRef = ref(storagedb, `products/${newProductRef.id}/pic`);
      await uploadBytes(productImageRef, image);
      const imageURL = await getDownloadURL(productImageRef);

      const newProduct = new Product({
        productRef: newProductRef,
        productType: doc(adb, 'productTypes', data.type),
        pic: imageURL,
        name: data.name,
        date: new Date(),
        description: data.description,
        capacities: [],
        visible: true,
      });

      const capacitiesRefs = await Promise.all(data.capacities.map(async (cap) => {
        const capRef = doc(collection(adb, 'capacities'));
        await setDoc(capRef, {
          capacity: parseInt(cap.capacity, 10),
          unity: cap.unit,
          price: parseFloat(cap.price),
          quantity: parseInt(cap.quantity, 10),
          product: newProductRef
        });
        newProduct.addCapacity(capRef);
        return capRef;
      }));

      await newProduct.save();
      setData([...productData, newProduct]);
      handleClose();
      reset(initialData);
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      alert('Erreur lors de l\'ajout du produit.');
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

  useEffect(() => {
    reset(initialData); // Réinitialiser les valeurs par défaut à l'ouverture du drawer
  }, [open, reset]);

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 500, md: 600 } } }}
    >
      <Box className='flex items-center justify-between p-5'>
        <Typography variant='h5'>Ajouter un nouveau produit</Typography>
        <IconButton size='small' onClick={handleReset}>
          <i className='tabler-x text-2xl text-textPrimary' />
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
          <Avatar
            alt="Image du produit"
            src={imagePreview}
            sx={{ width: 100, height: 100, mt: 2, mb: 2 }}
          />
        )}
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
                <MenuItem key={type.id} value={type.id}>
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
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Chargement...' : 'Terminer'}
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
