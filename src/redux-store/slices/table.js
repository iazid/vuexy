import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

const initialState = {
  tables: [],
  status: 'idle',
  error: null,
};

// Thunk asynchrone pour récupérer les tables d'un événement
export const fetchTables = createAsyncThunk('tables/fetchTables', async (eventId) => {
  const eventDocRef = doc(adb, 'events', eventId);
  const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', eventDocRef));
  const querySnapshot = await getDocs(tablesQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Thunk pour ajouter une nouvelle table
export const addTable = createAsyncThunk('tables/addTable', async ({ eventId, tableData }) => {
  const eventRef = doc(adb, 'events', eventId);
  const newTable = {
    ...tableData,
    eventRef: eventRef,
    date: Timestamp.now(),
  };
  const docRef = await addDoc(collection(adb, 'tables'), newTable);
  return { id: docRef.id, ...newTable };
});

// Thunk pour mettre à jour une table
export const updateTable = createAsyncThunk('tables/updateTable', async ({ tableId, tableData }) => {
  const tableDocRef = doc(adb, 'tables', tableId);
  await updateDoc(tableDocRef, tableData);
  return { tableId, tableData };
});

// Thunk pour supprimer une table
export const deleteTable = createAsyncThunk('tables/deleteTable', async (tableId) => {
  const tableDocRef = doc(adb, 'tables', tableId);
  await deleteDoc(tableDocRef);
  return tableId;
});

const tableSlice = createSlice({
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
        state.error = action.error.message;
      })
      .addCase(addTable.fulfilled, (state, action) => {
        state.tables.push(action.payload);
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        const { tableId, tableData } = action.payload;
        const index = state.tables.findIndex(table => table.id === tableId);
        if (index !== -1) {
          state.tables[index] = { ...state.tables[index], ...tableData };
        }
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.tables = state.tables.filter(table => table.id !== action.payload);
      });
  },
});

export default tableSlice.reducer;
