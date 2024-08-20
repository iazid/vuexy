import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

// Thunk pour récupérer les produits
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const productsCollectionRef = collection(adb, 'products');
  const productsData = await getDocs(productsCollectionRef);
  const productsList = productsData.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return productsList;
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productSlice.reducer;
