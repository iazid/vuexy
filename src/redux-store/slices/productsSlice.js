// src/redux-store/slices/productsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import ProductFactory from '../../utils/ProductFactory';

const initialState = {
  products: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (productTypes, { rejectWithValue }) => {
    try {
      const allProductsPromises = productTypes.flatMap(type =>
        type.products?.map(async productRef => {
          const productDoc = await getDoc(doc(adb, productRef.path));
          if (productDoc.exists()) {
            let product = ProductFactory(productDoc);
            const capacitiesRefs = productDoc.data().capacities || [];
            const numberOfCapacities = capacitiesRefs.length;

            product = {
              ...product,
              type: type.name,
              numberOfCapacities: numberOfCapacities
            };

            const imageRef = ref(storagedb, `products/${productDoc.id}/pic`);
            product.pic = await getDownloadURL(imageRef).catch(() => `products/${productDoc.id}/pic`);
            return product;
          }
          return null;
        }) || []
      );

      const allProducts = (await Promise.all(allProductsPromises)).filter(product => product !== null);
      return allProducts;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      state.products.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { addProduct } = productsSlice.actions;
export const selectProducts = (state) => state.products.products;
export const selectProductsLoading = (state) => state.products.status === 'loading';
export const selectProductsError = (state) => state.products.error;

export default productsSlice.reducer;
