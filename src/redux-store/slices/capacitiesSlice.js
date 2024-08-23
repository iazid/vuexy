// src/redux-store/slices/capacitiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

const initialState = {
  capacities: [],
  status: 'idle',
  error: null,
};

export const fetchCapacities = createAsyncThunk('capacities/fetchCapacities', async () => {
  const capacitiesCollectionRef = collection(adb, 'capacities');
  const capacitiesData = await getDocs(capacitiesCollectionRef);
  const capacitiesList = capacitiesData.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return capacitiesList;
});

const capacitiesSlice = createSlice({
  name: 'capacities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCapacities.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCapacities.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.capacities = action.payload;
      })
      .addCase(fetchCapacities.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const selectCapacities = (state) => state.capacities.capacities;
export const selectCapacitiesLoading = (state) => state.capacities.status === 'loading';
export const selectCapacitiesError = (state) => state.capacities.error;

export default capacitiesSlice.reducer;
