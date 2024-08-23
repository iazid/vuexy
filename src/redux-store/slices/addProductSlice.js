// src/redux-store/slices/addProductSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import Capacity from '../../utils/Capacity';
import Product from '../../utils/Product';

export const addProduct = createAsyncThunk(
  'products/addProduct',
  async ({ data, image, productTypes }, { rejectWithValue }) => {
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
      }));

      await newProduct.save();

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

const addProductSlice = createSlice({
  name: 'addProduct',
  initialState: {
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addProduct.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectAddProductStatus = (state) => state.addProduct.status;
export const selectAddProductError = (state) => state.addProduct.error;

export default addProductSlice.reducer;
