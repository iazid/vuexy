import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, MenuItem, Avatar, FormControl, InputLabel, Select, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import FirebaseService from './firebaseService';
import BorderedContainerWithTitle from '../components/BorderedContainerWithTitle';
import CapacitiesRow from '../../utils/CapacitiesRow';

const AddProduct = () => {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
  const { user } = useAuth();
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [capacities, setCapacities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageSelected, setImageSelected] = useState(false);
  const [productImageData, setProductImageData] = useState(null);

  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        const productTypesList = await FirebaseService.getProductTypes();
        setProductTypes(productTypesList);
        setSelectedProductType(productTypesList[0]?.id || '');
      } catch (error) {
        console.error("Error loading product types: ", error);
      }
    };

    loadProductTypes();
  }, []);

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImageData(reader.result);
        setImageSelected(true);
      };
      reader.readAsDataURL(file);
      setProductImage(file);
    }
  };

  const addCapacityRow = () => {
    setCapacities([...capacities, { price: '', quantity: '', capacity: '', unity: 'CENTILITRES' }]);
  };

  const handleCapacityChange = (index, field, value) => {
    const newCapacities = capacities.slice();
    newCapacities[index][field] = value;
    setCapacities(newCapacities);
  };

  const onSubmit = async (data) => {
    if (!imageSelected) {
      alert('Please select an image');
      return;
    }

    setLoading(true);

    try {
      const newProductRef = doc(collection(FirebaseService.adb, "products"));
      const imagePath = await FirebaseService.uploadProductImage(productImage, newProductRef.id, "pic");
      
      const newCapacities = capacities.map(capacity => ({
        capacityRef: doc(collection(FirebaseService.adb, "capacities")),
        productTypeRef: doc(FirebaseService.adb, 'productTypes', selectedProductType),
        productRef: newProductRef,
        ...capacity,
      }));

      const productData = {
        name: data.name,
        description: data.description,
        productType: doc(FirebaseService.adb, 'productTypes', selectedProductType),
        pic: imagePath,
        date: new Date(),
        visible: true,
        capacities: newCapacities.map(cap => cap.capacityRef),
      };

      await FirebaseService.addProduct(newProductRef, productData);
      await FirebaseService.addCapacities(newCapacities);
      await FirebaseService.addInProductType(newProductRef, selectedProductType);

      alert('Product added successfully!');
      reset();
      setImageSelected(false);
      setCapacities([]);
    } catch (error) {
      console.error("Error adding product: ", error);
      alert('Error adding product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {imageSelected && (
          <Avatar
            src={productImageData}
            sx={{ width: 100, height: 100 }}
          />
        )}
      </div>
      <TextField
        label="Nom du produit"
        {...register('name', { required: 'Entrez un nom valide' })}
        error={!!errors.name}
        helperText={errors.name ? errors.name.message : ''}
      />
      <TextField
        label="Description du produit"
        {...register('description', { required: 'Entrez une description valide' })}
        error={!!errors.description}
        helperText={errors.description ? errors.description.message : ''}
      />
      <FormControl fullWidth>
        <InputLabel>Type de produit</InputLabel>
        <Controller
          name="productType"
          control={control}
          defaultValue={selectedProductType}
          render={({ field }) => (
            <Select
              {...field}
              onChange={(e) => {
                setSelectedProductType(e.target.value);
                field.onChange(e);
              }}
            >
              {productTypes.map((productType) => (
                <MenuItem key={productType.id} value={productType.id}>
                  {productType.name}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>
      <BorderedContainerWithTitle title="Contenances">
        {capacities.map((capacity, index) => (
          <CapacitiesRow
            key={index}
            index={index}
            capacity={capacity}
            onCapacityChange={handleCapacityChange}
          />
        ))}
        <Button onClick={addCapacityRow}>AJOUTER UNE CONTENANCE</Button>
      </BorderedContainerWithTitle>
      <Button type="submit" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'TERMINER'}
      </Button>
    </form>
  );
};

export default AddProduct;
