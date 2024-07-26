import React, { useState, useEffect } from 'react';
import { Button, Drawer, IconButton, MenuItem, Typography, Divider, Box, TextField, FormControl, InputLabel, Select, Grid, Avatar, CircularProgress } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import Capacity from '../../../utils/Capacity';

const initialData = {
  name: '',
  description: '',
  type: '',
  capacities: [{ price: 0, quantity: 0, capacity: 0, unit: 'centilitre' }]
};

const AddProductDrawer = ({ open, handleClose, productData, setData, productTypes, setFilteredProducts, currentFilters }) => {
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

      // Créez d'abord un produit vide pour obtenir son ID
      const newProductRef = doc(collection(adb, 'products'));
      await setDoc(newProductRef, {});

      // Uploadez l'image en utilisant l'ID du produit
      const productImagePath = `products/${newProductRef.id}/pic`;
      const productImageRef = ref(storagedb, productImagePath);
      await uploadBytes(productImageRef, image);
      const imageURL = await getDownloadURL(productImageRef);

      const formattedDate = format(new Date(), "dd MMMM yyyy 'à' HH:mm:ss 'UTC+1'", { locale: fr });

      const newProduct = {
        name: data.name,
        description: data.description,
        pic: productImagePath, // Chemin de l'image
        productType: doc(adb, `productTypes/${selectedType.id}`),
        date: formattedDate,
        visible: true,
        type: selectedType.name,
        numberOfCapacities: data.capacities.length // Ajoutez ce champ pour le tableau
      };

      const capacitiesRefs = await Promise.all(data.capacities.map(async (cap) => {
        const capRef = doc(collection(adb, 'capacities'));
        const newCapacity = new Capacity({
          capacityRef: capRef,
          productTypeRef: newProduct.productType,
          productRef: newProductRef,
          capacity: parseInt(cap.capacity, 10),
          unity: cap.unit,
          price: parseFloat(cap.price),
          quantity: parseInt(cap.quantity, 10)
        });
        await newCapacity.save();
        return capRef;
      }));

      newProduct.capacities = capacitiesRefs.map(ref => ref.path);

      // Mettez à jour le produit avec les informations complètes
      await setDoc(newProductRef, newProduct);

      // Ajoutez la référence du produit au type de produit correspondant
      const productTypeRef = doc(adb, `productTypes/${selectedType.id}`);
      await updateDoc(productTypeRef, {
        products: arrayUnion(newProductRef)
      });

      // Mettez à jour les états locaux
      const updatedProducts = [...productData, { ...newProduct, id: newProductRef.id }];
      setData(updatedProducts);

      // Réappliquez les filtres actuels
      let filteredData = updatedProducts;
      if (currentFilters.selectedType) {
        filteredData = filteredData.filter(product => product.type === currentFilters.selectedType);
      }

      setFilteredProducts(filteredData);

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
          <Button onClick={() => append({ price: 0, quantity: 0, capacity: 0, unit: 'centilitre' })}>
            Ajouter une contenance
          </Button>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Terminer'}
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
