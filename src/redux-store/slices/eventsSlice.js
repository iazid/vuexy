// src/redux-store/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';
import EventModel from '../../utils/EventModel';
import { Timestamp, GeoPoint } from 'firebase/firestore';

const initialState = {
  events: [],
  status: 'idle',
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const eventsCollectionRef = collection(adb, 'events');
      const eventData = await getDocs(eventsCollectionRef);
      const eventsList = await Promise.all(eventData.docs.map(async doc => {
        try {
          let event = EventFactory(doc);
          const imageRef = ref(storagedb, `events/${doc.id}/pic`);
          event.avatar = await getDownloadURL(imageRef).catch(() => `events/${doc.id}/pic`);
          return event;
        } catch (error) {
          console.error("Error fetching event data:", error);
          return null;
        }
      }));

      return eventsList.filter(event => event);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/addEvent',
  async ({ formData, image }, { rejectWithValue }) => {
    try {
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      const eventTimestamp = Timestamp.fromDate(new Date(dateTimeString));

      const newEvent = new EventModel({
        ...formData,
        date: eventTimestamp,
        time: eventTimestamp,
        regular_price: parseFloat(formData.regular_price),
        simpEntry: parseFloat(formData.simpEntry),
        place: new GeoPoint(0.0, 0.0),
      });

      const plainData = newEvent.toPlainObject();
      const eventDocRef = await addDoc(collection(adb, 'events'), plainData);

      if (image) {
        const normalImagePath = `events/${eventDocRef.id}/pic`;
        const croppedImagePath = `events/${eventDocRef.id}/pic_cropped`;
        const imageRef = ref(storagedb, normalImagePath);
        const croppedImageRef = ref(storagedb, croppedImagePath);
        
        await uploadBytes(imageRef, image);
        await uploadBytes(croppedImageRef, image);
        
        await updateDoc(eventDocRef, {
          imageUri: normalImagePath,
          croppedUri: croppedImagePath,
          pic: normalImagePath,
        });
      }

      return { id: eventDocRef.id, ...plainData, pic: normalImagePath };
    } catch (error) {
      console.error('Error adding event:', error);
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addEvent.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events.push(action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const selectEvents = (state) => state.events.events;
export const selectEventsLoading = (state) => state.events.status === 'loading';
export const selectEventsError = (state) => state.events.error;

export default eventsSlice.reducer;
