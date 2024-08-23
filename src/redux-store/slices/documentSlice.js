// src/redux-store/slices/documentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import DocumentModel from '../../utils/DocumentModel';

// Thunk pour récupérer les détails du document d'identité
export const fetchDocumentDetails = createAsyncThunk(
  'document/fetchDocumentDetails',
  async (uid, { rejectWithValue }) => {
    try {
      const docRef = doc(adb, 'documents', uid);
      const documentModel = await DocumentModel.fromFirebase(docRef);

      let documentUrl = null;
      if (documentModel && documentModel.status === 'Accepté') {
        const storageRef = ref(storagedb, documentModel.documentPath || `${uid}/identity.jpg`);
        documentUrl = await getDownloadURL(storageRef);
      }

      return { documentStatus: documentModel?.status || 'Non disponible', documentUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const documentSlice = createSlice({
  name: 'document',
  initialState: {
    documentStatus: null,
    documentUrl: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocumentDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDocumentDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.documentStatus = action.payload.documentStatus;
        state.documentUrl = action.payload.documentUrl;
      })
      .addCase(fetchDocumentDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectDocumentStatus = (state) => state.document.documentStatus;
export const selectDocumentUrl = (state) => state.document.documentUrl;
export const getDocumentStatus = (state) => state.document.status;
export const getDocumentError = (state) => state.document.error;

export default documentSlice.reducer;
