import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import Product from '../../utils/Product';
import Capacity from '../../utils/Capacity';

// Action asynchrone pour ajouter un produit
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async ({ productData, image }, { rejectWithValue }) => {
    try {
      // Téléchargement de l'image
      const newProductRef = doc(collection(adb, 'products'));
      const productImagePath = `products/${newProductRef.id}/pic`;
      const productImageRef = ref(storagedb, productImagePath);

      await uploadBytes(productImageRef, image);

      // Création du produit avec le chemin de l'image
      const selectedType = productData.productTypes.find(type => type.name === productData.type);
      if (!selectedType) {
        throw new Error('Type de produit non valide.');
      }

      const newProduct = new Product({
        productRef: newProductRef,
        name: productData.name,
        description: productData.description,
        pic: productImagePath,
        productType: doc(adb, `productTypes/${selectedType.id}`),
        date: new Date(),
        visible: true,
        capacities: []
      });

      await setDoc(newProductRef, newProduct.toMap());

      // Création des capacités associées
      const capacitiesRefs = await Promise.all(
        productData.capacities.map(async (cap) => {
          const convertedCapacity = cap.unit === 'L' ? cap.capacity * 100 : cap.capacity;
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
          await newCapacity.save();
          newProduct.addCapacity(newCapacity);
          return capRef;
        })
      );

      await newProduct.save();

      // Mise à jour du type de produit
      const productTypeRef = doc(adb, `productTypes/${selectedType.id}`);
      await updateDoc(productTypeRef, {
        products: arrayUnion(newProductRef)
      });

      return {
        ...newProduct.toMap(),
        id: newProductRef.id,
        type: selectedType.name,
        numberOfCapacities: capacitiesRefs.length,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
    currentProduct: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.currentProduct = action.payload;
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
