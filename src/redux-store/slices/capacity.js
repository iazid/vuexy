import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import Capacity from '../../utils/Capacity';

// Thunk pour ajouter une capacité
export const addCapacity = createAsyncThunk(
  'capacities/addCapacity',
  async ({ productRef, capacityData }, { rejectWithValue }) => {
    try {
      const capRef = doc(collection(adb, 'capacities'));
      const newCapacity = new Capacity({
        capacityRef: capRef,
        productRef,
        productTypeRef: capacityData.productTypeRef,
        capacity: capacityData.capacity,
        unity: 'centilitre',
        price: parseFloat(capacityData.price),
        quantity: parseInt(capacityData.quantity, 10)
      });

      await setDoc(capRef, newCapacity.toMap());
      return newCapacity.toMap();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour mettre à jour une capacité existante
export const updateCapacity = createAsyncThunk(
  'capacities/updateCapacity',
  async ({ capacityId, updatedData }, { rejectWithValue }) => {
    try {
      const capRef = doc(adb, 'capacities', capacityId);
      await updateDoc(capRef, updatedData);
      return { capacityId, updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour supprimer une capacité
export const deleteCapacity = createAsyncThunk(
  'capacities/deleteCapacity',
  async ({ capacityId }, { rejectWithValue }) => {
    try {
      const capRef = doc(adb, 'capacities', capacityId);
      await deleteDoc(capRef);
      return capacityId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const capacitySlice = createSlice({
  name: 'capacities',
  initialState: {
    capacities: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Ajouter une capacité
      .addCase(addCapacity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCapacity.fulfilled, (state, action) => {
        state.loading = false;
        state.capacities.push(action.payload);
      })
      .addCase(addCapacity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mettre à jour une capacité
      .addCase(updateCapacity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCapacity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.capacities.findIndex(cap => cap.capacityRef.id === action.payload.capacityId);
        if (index !== -1) {
          state.capacities[index] = { ...state.capacities[index], ...action.payload.updatedData };
        }
      })
      .addCase(updateCapacity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Supprimer une capacité
      .addCase(deleteCapacity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCapacity.fulfilled, (state, action) => {
        state.loading = false;
        state.capacities = state.capacities.filter(cap => cap.capacityRef.id !== action.payload);
      })
      .addCase(deleteCapacity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default capacitySlice.reducer;
