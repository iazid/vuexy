import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, addDoc, query, where } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';

const initialState = {
  bookings: [],
  status: 'idle',
  error: null,
};

// Thunk asynchrone pour récupérer les réservations d'un événement
export const fetchBookings = createAsyncThunk('bookings/fetchBookings', async (eventId) => {
  const eventDocRef = doc(adb, 'events', eventId);
  const bookingsQuery = query(collection(adb, 'reservations'), where('eventRef', '==', eventDocRef));
  const querySnapshot = await getDocs(bookingsQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Thunk pour ajouter une nouvelle réservation
export const addBooking = createAsyncThunk('bookings/addBooking', async ({ eventId, bookingData }) => {
  const eventRef = doc(adb, 'events', eventId);
  const newBooking = {
    ...bookingData,
    eventRef: eventRef,
    date: Timestamp.now(),
  };
  const docRef = await addDoc(collection(adb, 'reservations'), newBooking);
  return { id: docRef.id, ...newBooking };
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addBooking.fulfilled, (state, action) => {
        state.bookings.push(action.payload);
      });
  },
});

export default bookingSlice.reducer;
