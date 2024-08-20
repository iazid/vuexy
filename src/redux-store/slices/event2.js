import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';
import { slugify } from '../../utils/slugify';

const initialState = {
  events: [],
  selectedEvent: null,
  status: 'idle',
  error: null,
};

// Thunk asynchrone pour récupérer les événements
export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
  const eventsCollectionRef = collection(adb, 'events');
  const eventData = await getDocs(eventsCollectionRef);
  const eventsList = await Promise.all(eventData.docs.map(async (doc) => {
    try {
      let event = EventFactory(doc);
      event.id = doc.id; // Inclure l'ID de l'événement
      event.slug = slugify(event.name); // Ajouter le slug
      const imageRef = ref(storagedb, `events/${doc.id}/pic`);
      event.avatar = await getDownloadURL(imageRef).catch(() => `events/${doc.id}/pic`);
      return event;
    } catch (error) {
      console.error("Error fetching event data:", error);
      return null;
    }
  }));

  return eventsList.filter(event => event);
});

// Thunk pour récupérer un événement par son slug
export const fetchEventBySlug = createAsyncThunk('events/fetchEventBySlug', async (slug) => {
  const eventsCollectionRef = collection(adb, 'events');
  const eventData = await getDocs(eventsCollectionRef);
  const eventDoc = eventData.docs.find(doc => slugify(doc.data().name) === slug);

  if (eventDoc) {
    let event = EventFactory(eventDoc);
    event.id = eventDoc.id;
    event.slug = slugify(event.name);
    const imageRef = ref(storagedb, `events/${eventDoc.id}/pic`);
    event.avatar = await getDownloadURL(imageRef).catch(() => `events/${eventDoc.id}/pic`);
    return event;
  } else {
    throw new Error('Event not found');
  }
});

// Thunk pour ajouter un événement
export const addEvent = createAsyncThunk('events/addEvent', async (newEvent) => {
  const eventDocRef = await addDoc(collection(adb, 'events'), newEvent);
  const eventSnapshot = await getDoc(eventDocRef);
  return { id: eventDocRef.id, ...eventSnapshot.data() };
});

// Thunk pour mettre à jour un événement
export const updateEvent = createAsyncThunk('events/updateEvent', async ({ eventId, updatedEvent }) => {
  const eventDocRef = doc(adb, 'events', eventId);
  await updateDoc(eventDocRef, updatedEvent);
  return { eventId, updatedEvent };
});

// Thunk pour supprimer un événement
export const deleteEvent = createAsyncThunk('events/deleteEvent', async (eventId) => {
  const eventDocRef = doc(adb, 'events', eventId);
  await deleteDoc(eventDocRef);
  return eventId;
});

const eventSlice = createSlice({
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
        state.error = action.error.message;
      })
      .addCase(fetchEventBySlug.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEventBySlug.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventBySlug.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const { eventId, updatedEvent } = action.payload;
        const index = state.events.findIndex(event => event.id === eventId);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...updatedEvent };
        }
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(event => event.id !== action.payload);
      });
  },
});

export default eventSlice.reducer;
