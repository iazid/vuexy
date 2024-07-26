import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import ProductFactory from '../../utils/ProductFactory';

const initialState = {
  products: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const productsCollectionRef = collection(adb, 'products');
  const productsData = await getDocs(productsCollectionRef);
  const productsList = await Promise.all(productsData.docs.map(doc => {
    try {
      return ProductFactory(doc);
    } catch (error) {
      console.error("Error fetching product data:", error);
      return null;
    }
  }));

  return productsList.filter(product => product);
});

const productSlice = createSlice({
  name: 'products',
  initialState: initialState,
  reducers: {},
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
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
