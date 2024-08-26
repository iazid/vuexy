// src/redux-store/slices/userDetailsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import UserData from '../../utils/UserData';
import DocumentModel from '../../utils/DocumentModel';

// Thunk pour récupérer les détails de l'utilisateur et l'image de profil
export const fetchUserDetails = createAsyncThunk(
  'userDetails/fetchUserDetails',
  async (uid, { rejectWithValue }) => {
    try {
      const userRef = doc(adb, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error("Utilisateur introuvable");
      }

      const user = UserData.fromFirebase(userSnap);

      let profilePictureUrl = null;
      if (user.pic) {
        try {
          const picRef = ref(storagedb, user.pic);
          profilePictureUrl = await getDownloadURL(picRef);
        } catch (error) {
          console.warn(`Unable to fetch profile picture for UID ${uid}: ${error.message}`);
          profilePictureUrl = "/default-profile.png"; // Fallback to default profile picture
        }
      }

      return { user, profilePictureUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour récupérer les détails du document d'identité
export const fetchDocumentDetails = createAsyncThunk(
  'userDetails/fetchDocumentDetails',
  async (uid, { rejectWithValue }) => {
    try {
      const docRef = doc(adb, 'documents', uid);
      const documentModel = await DocumentModel.fromFirebase(docRef);

      let documentUrl = null;
      if (documentModel && documentModel.status === 'Accepté') {
        try {
          const storageRef = ref(storagedb, documentModel.documentPath || `${uid}/identity.jpg`);
          documentUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.warn(`Document not found for UID ${uid}: ${error.message}`);
          documentUrl = null; // No document found
        }
      }

      return { documentStatus: documentModel?.status || 'Non disponible', documentUrl };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userDetailsSlice = createSlice({
  name: 'userDetails',
  initialState: {
    user: null,
    profilePictureUrl: null,
    documentStatus: null,
    documentUrl: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.profilePictureUrl = action.payload.profilePictureUrl;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
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

export const selectUser = (state) => state.userDetails.user;
export const selectProfilePictureUrl = (state) => state.userDetails.profilePictureUrl;
export const selectDocumentStatus = (state) => state.userDetails.documentStatus;
export const selectDocumentUrl = (state) => state.userDetails.documentUrl;
export const getUserDetailsStatus = (state) => state.userDetails.status;
export const getUserDetailsError = (state) => state.userDetails.error;

export default userDetailsSlice.reducer;
