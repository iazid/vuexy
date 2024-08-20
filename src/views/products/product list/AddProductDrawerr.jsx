import React, { useState, useEffect } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, Grid, Avatar, CircularProgress } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { collection, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../../../redux-store/slices/product';
import { addCapacity } from '../../../redux-store/slices/capacity';
import { fetchProductTypes } from '../../../redux-store/slices/productType'; 
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import Capacity from '../../../utils/Capacity';
import Product from '../../../utils/Product';

const initialData = {
  name: '',
  description: '',
  type: '',
  capacities: [{ price: 0, quantity: 0, capacity: 0, unit: 'centilitre' }]
};

const AddProductDrawer = ({ open, handleClose, setData, setFilteredProducts, currentFilters, onProductAdded }) => {
  const { control, reset, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: initialData
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'capacities'
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { loading: reduxLoading, error } = useSelector((state) => state.products);
  const { productTypes, loading: productTypesLoading } = useSelector((state) => state.productTypes);

  useEffect(() => {
    reset(initialData);
  }, [open, reset]);

  useEffect(() => {
    // Charger les types de produits via Redux
    dispatch(fetchProductTypes());
  }, [dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const convertUnitToCentilitres = (capacity, unit) => {
    if (unit === 'L') {
      return capacity * 100;
    }
    return capacity;
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
      const newProduct = new Product({
        productRef: newProductRef,
        name: data.name,
        description: data.description,
        pic: '',
        productType: doc(adb, `productTypes/${selectedType.id}`),
        date: new Date(),
        visible: true,
        capacities: []
      });

      await setDoc(newProductRef, newProduct.toMap());

      const productImagePath = `products/${newProductRef.id}/pic`;
      const productImageRef = ref(storagedb, productImagePath);
      await uploadBytes(productImageRef, image);
      newProduct.pic = productImagePath;

      const capacitiesRefs = await Promise.all(data.capacities.map(async (cap) => {
        const convertedCapacity = convertUnitToCentilitres(cap.capacity, cap.unit);
        const capRef = doc(collection(adb, 'capacities'));
        const newCapacity = new Capacity({
          capacityRef: capRef,
          productTypeRef: newProduct.productType,
          productRef: newProductRef,
          capacity: convertedCapacity,
          unity: 'centilitre',
          price: parseFloat(cap.price),
          quantity: parseInt(cap.quantity, 10)
        });

        // Appel Firebase pour sauvegarder la capacité
        await newCapacity.save();

        // Appel Redux pour ajouter la capacité dans l'état global
        dispatch(addCapacity({
          productRef: newProductRef,
          capacityData: {
            productTypeRef: newProduct.productType,
            capacity: convertedCapacity,
            price: cap.price,
            quantity: cap.quantity
          }
        }));

        newProduct.addCapacity(newCapacity);
        return capRef;
      }));

      await newProduct.save();

      const productTypeRef = doc(adb, `productTypes/${selectedType.id}`);
      await updateDoc(productTypeRef, {
        products: arrayUnion(newProductRef)
      });

      // Appel Redux pour ajouter le produit dans l'état global
      dispatch(addProduct({ productData: data, image }));

      const newProductData = {
        ...newProduct.toMap(),
        id: newProductRef.id,
        type: selectedType.name,
        numberOfCapacities: capacitiesRefs.length,
      };
      onProductAdded(newProductData);

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
                {productTypes.map((productType) => (
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
                        <MenuItem value="centilitre">Centilitre</MenuItem>
                        <MenuItem value="L">Litre</MenuItem>
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
          <Button onClick={() => append({ price: 0, quantity: 0, capacity: 0, unit: 'centilitre' })}>
            Ajouter une contenance
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit' disabled={loading || reduxLoading}>
            {(loading || reduxLoading) ? <CircularProgress size={24} /> : 'Terminer'}
          </Button>
          {error && <Typography color="error">{error}</Typography>}
          <Button variant='tonal' color='error' type='reset' onClick={handleReset}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default AddProductDrawer;
