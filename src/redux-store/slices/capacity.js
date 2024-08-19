// redux-store/slices/capacitySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

export const fetchCapacities = createAsyncThunk('capacities/fetchCapacities', async () => {
  const capacitiesSnapshot = await getDocs(collection(adb, 'capacities'));
  const capacitiesData = capacitiesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  return capacitiesData;
});

const capacitySlice = createSlice({
  name: 'capacities',
  initialState: {
    capacities: [],
    status: 'idle',
    error: null,
  },
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

export default capacitySlice.reducer;
