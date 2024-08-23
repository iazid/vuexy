// src/redux/slices/productTypesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

export const fetchProductTypes = createAsyncThunk(
  'productsTypes/fetchProductTypes',
  async (_, thunkAPI) => {
    try {
      const productsTypesSnapshot = await getDocs(collection(adb, 'productTypes'));
      const productsTypesData = productsTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      return productsTypesData;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const productsTypesSlice = createSlice({
  name: 'productsTypes',
  initialState: {
    data: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectProductTypes = (state) => state.productsTypes.data;
export const selectProductTypesLoading = (state) => state.productsTypes.loading;
export const selectProductTypesError = (state) => state.productsTypes.error;

export default productsTypesSlice.reducer;
