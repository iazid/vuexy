// src/redux-store/slices/tablesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, deleteDoc, updateDoc, addDoc, Timestamp, doc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

const initialState = {
  tables: [],
  status: 'idle',
  error: null,
};

export const fetchTables = createAsyncThunk(
  'tables/fetchTables',
  async (eventId, { rejectWithValue }) => {
    try {
      const eventDocRef = doc(adb, 'events', eventId);
      const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', eventDocRef));
      const querySnapshot = await getDocs(tablesQuery);
      const tablesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return tablesData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTable = createAsyncThunk(
  'tables/deleteTable',
  async (tableId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(adb, 'tables', tableId));
      return tableId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTable = createAsyncThunk(
  'tables/saveTable',
  async ({ tableId, tableData }, { rejectWithValue }) => {
    try {
      await updateDoc(doc(adb, 'tables', tableId), {
        name: tableData.name,
        price: Number(tableData.price),
        size: Number(tableData.size),
        quantity: Number(tableData.quantity),
      });
      return { tableId, tableData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addTable = createAsyncThunk(
  'tables/addTable',
  async ({ eventId, data }, { rejectWithValue }) => {
    try {
      const eventRef = doc(adb, 'events', eventId);
      const tableData = {
        name: data.tableName.charAt(0).toUpperCase() + data.tableName.slice(1),
        price: parseInt(data.price, 10),
        size: parseInt(data.guests, 10),
        quantity: parseInt(data.tableNumber, 10),
        eventRef: eventRef,
        date: Timestamp.now(),
      };

      const newDocRef = await addDoc(collection(adb, 'tables'), tableData);
      return { id: newDocRef.id, ...tableData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const tablesSlice = createSlice({
  name: 'tables',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTables.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tables = action.payload;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter(table => table.id !== action.payload);
      })
      .addCase(saveTable.fulfilled, (state, action) => {
        const index = state.tables.findIndex(table => table.id === action.payload.tableId);
        if (index !== -1) {
          state.tables[index] = { ...state.tables[index], ...action.payload.tableData };
        }
      })
      .addCase(addTable.fulfilled, (state, action) => {
        state.tables.push(action.payload);
      });
  },
});

export const selectTables = (state) => state.tables.tables;
export const selectTablesLoading = (state) => state.tables.status === 'loading';
export const selectTablesError = (state) => state.tables.error;

export default tablesSlice.reducer;
