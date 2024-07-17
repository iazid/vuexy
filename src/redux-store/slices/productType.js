import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import ProductTypeFactory from '../../utils/ProductTypeFactory';

const initialState = {
  productTypes: [],
  status: 'idle',
  error: null,
};

export const fetchProductTypes = createAsyncThunk('productTypes/fetchProductTypes', async () => {
  const productTypesCollectionRef = collection(adb, 'productTypes');
  const productTypesData = await getDocs(productTypesCollectionRef);
  const productTypesList = await Promise.all(productTypesData.docs.map(doc => {
    try {
      return ProductTypeFactory(doc);
    } catch (error) {
      console.error("Error fetching product type data:", error);
      return null;
    }
  }));

  return productTypesList.filter(productType => productType);
});

const productTypeSlice = createSlice({
  name: 'productTypes',
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductTypes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.productTypes = action.payload;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default productTypeSlice.reducer;
