// src/redux-store/slices/eventSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, doc, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';
import { slugify } from '../../utils/slugify';

const initialState = {
  event: null,
  status: 'idle',
  error: null,
};

export const fetchEventBySlug = createAsyncThunk(
  'event/fetchEventBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const eventsCollectionRef = collection(adb, 'events');
      const eventData = await getDocs(eventsCollectionRef);
      const eventDoc = eventData.docs.find(doc => slugify(doc.data().name) === slug);
      if (!eventDoc) {
        throw new Error('Event not found');
      }
      const event = EventFactory(eventDoc);
      event.id = eventDoc.id;

      // Convert the Firestore timestamp to a JS Date object
      const eventDate = event.date instanceof Timestamp ? event.date.toDate() : new Date(event.date);

      // Format the date and time for the form
      event.dateFormatted = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      event.timeFormatted = eventDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM format

      event.avatar = await getDownloadURL(ref(storagedb, `events/${eventDoc.id}/pic`)).catch(() => `events/${eventDoc.id}/pic`);
      return event;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/updateEvent',
  async ({ eventId, data, image }, { rejectWithValue }) => {
    try {
      const eventDocRef = doc(adb, 'events', eventId);
      const eventTimestamp = Timestamp.fromDate(new Date(`${data.date}T${data.time}:00`));

      const updatedEvent = { 
        name: data.name,
        date: eventTimestamp,
        address: data.address,
        description: data.description,
        place_description: data.place_description,
        dressed_up: data.dressed_up,
        regular_price: Number(data.regular_price),  
        simpEntry: Number(data.simpEntry),
      };

      if (image) {
        const normalImagePath = `events/${eventId}/pic`;
        const croppedImagePath = `events/${eventId}/pic_cropped`;

        await uploadBytes(ref(storagedb, normalImagePath), image);
        await uploadBytes(ref(storagedb, croppedImagePath), image);

        updatedEvent.imageUri = normalImagePath;
        updatedEvent.pic = normalImagePath;
        updatedEvent.croppedUri = croppedImagePath;
      }

      await updateDoc(eventDocRef, updatedEvent);
      return updatedEvent;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventBySlug.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.event = action.payload;
      })
      .addCase(fetchEventBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.event = { ...state.event, ...action.payload };
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectEvent = (state) => state.event.event;
export const selectEventLoading = (state) => state.event.status === 'loading';
export const selectEventError = (state) => state.event.error;

export default eventSlice.reducer;
