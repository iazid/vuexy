import React, { useState, useEffect } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, Grid, Avatar, CircularProgress } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import Product from '../../../utils/Product';
import Capacity from '../../../utils/Capacity';

const initialData = {
  name: '',
  description: '',
  type: '',
  capacities: [{ price: 0, quantity: 0, capacity: 0, unit: 'CL' }]
};

const AddProductDrawer = ({ open, handleClose, productData, setData, productTypes }) => {
  const { control, reset, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: initialData
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'capacities'
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtrer les types de produits pour ne conserver que le premier type
  const filteredProductTypes = productTypes.slice(0, 1);

  useEffect(() => {
    reset(initialData); // Réinitialiser les valeurs par défaut à l'ouverture du drawer
  }, [open, reset]);

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
      const selectedType = productTypes.find(type => type.name === data.type);
      if (!selectedType) {
        throw new Error('Type de produit non valide.');
      }

      const newProductRef = doc(collection(adb, 'products'));
      const productImageRef = ref(storagedb, `products/${newProductRef.id}/pic`);
      await uploadBytes(productImageRef, image);
      const imageURL = await getDownloadURL(productImageRef);

      const newProduct = new Product({
        productRef: newProductRef,
        productTypeRef: doc(adb, `productTypes/${selectedType.id}`), // Correctly set productTypeRef
        pic: imageURL,
        name: data.name,
        date: new Date(),
        description: data.description,
        capacities: [],
        visible: true,
      });

      const capacitiesRefs = await Promise.all(data.capacities.map(async (cap) => {
        const capRef = doc(collection(adb, 'capacities'));
        const newCapacity = new Capacity({
          capacityRef: capRef,
          productTypeRef: newProduct.productTypeRef, // Correctly pass productTypeRef
          productRef: newProductRef, // Référence au nouveau produit
          capacity: parseInt(cap.capacity, 10),
          unity: cap.unit,
          price: parseFloat(cap.price),
          quantity: parseInt(cap.quantity, 10)
        });
        await newCapacity.save();
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
      alert(`Erreur lors de l'ajout du produit: ${error.message}`);
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

  const handleTestClick = () => {
    if (filteredProductTypes.length > 0) {
      const firstTypeId = filteredProductTypes[0].id;
      alert(`ID du premier type de produit: ${firstTypeId}`);
    } else {
      alert('Aucun type de produit disponible.');
    }
  };

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
          rules={{ required: 'Ce champ est requis.' }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label='Nom du produit'
              placeholder='Nom du produit'
              error={!!errors.name}
              helperText={errors.name ? errors.name.message : ''}
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
              label='Description'
              placeholder='Description du produit'
              error={!!errors.description}
              helperText={errors.description ? errors.description.message : ''}
            />
          )}
        />
        <FormControl fullWidth>
          <InputLabel>Type de produit</InputLabel>
          <Controller
            name="type"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                {...field}
                value={field.value || ""}
                onChange={(e) => {
                  setValue('type', e.target.value);
                  field.onChange(e.target.value);
                }}
                label="Type de produit"
              >
                {filteredProductTypes.map((productType) => (
                  <MenuItem key={productType.id} value={productType.name}>
                    {productType.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </FormControl>
        <Box>
          <Typography variant='h6'>Contenances</Typography>
          <br/>
          {fields.map((field, index) => (
            <Grid container spacing={2} alignItems="center" key={field.id} sx={{ marginBottom: 2 }}>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.price`}
                  control={control}
                  rules={{ required: 'Ce champ est requis.' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Prix'
                      type='number'
                      fullWidth
                      error={!!errors.capacities?.[index]?.price}
                      helperText={errors.capacities?.[index]?.price?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.quantity`}
                  control={control}
                  rules={{ required: 'Ce champ est requis.' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Quantité'
                      type='number'
                      fullWidth
                      error={!!errors.capacities?.[index]?.quantity}
                      helperText={errors.capacities?.[index]?.quantity?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Controller
                  name={`capacities.${index}.capacity`}
                  control={control}
                  rules={{ required: 'Ce champ est requis.' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label='Capacité'
                      type='number'
                      fullWidth
                      error={!!errors.capacities?.[index]?.capacity}
                      helperText={errors.capacities?.[index]?.capacity?.message}
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
          <Button onClick={handleTestClick}>
            Test
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? <CircrProgress size={24} /> : 'Terminer'}
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
