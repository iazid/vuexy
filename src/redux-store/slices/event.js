import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';
import { slugify } from '../../utils/slugify';

const initialState = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  status: 'idle',
  error: null,
  selectedCalendars: [],
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

// Fonction pour filtrer les événements par calendrier
const filterEventsUsingCheckbox = (events, selectedCalendars) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar));
};

// Slice Redux pour la gestion des événements
const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    filterEvents: (state) => {
      state.filteredEvents = state.events;
    },
    addEvent: (state, action) => {
      const newEvent = { 
        ...action.payload, 
        id: `${parseInt(state.events[state.events.length - 1]?.id ?? '0') + 1}` 
      };
      state.events.push(newEvent);
      state.filteredEvents.push(newEvent);
    },
    updateEvent: (state, action) => {
      state.events = state.events.map(event => 
        event.id === action.payload.id ? action.payload : event
      );
      state.filteredEvents = state.filteredEvents.map(event => 
        event.id === action.payload.id ? action.payload : event
      );
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
      state.filteredEvents = state.filteredEvents.filter(event => event.id !== action.payload);
    },
    selectEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    filterCalendarLabel: (state, action) => {
      const index = state.selectedCalendars.indexOf(action.payload);

      if (index !== -1) {
        state.selectedCalendars.splice(index, 1);
      } else {
        state.selectedCalendars.push(action.payload);
      }

      state.filteredEvents = filterEventsUsingCheckbox(state.events, state.selectedCalendars);
    },
    filterAllCalendarLabels: (state, action) => {
      state.selectedCalendars = action.payload 
        ? ['Personal', 'Business', 'Family', 'Holiday', 'ETC'] 
        : [];
      state.filteredEvents = filterEventsUsingCheckbox(state.events, state.selectedCalendars);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.events = action.payload;
        state.filteredEvents = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const {
  filterEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  selectEvent,
  filterCalendarLabel,
  filterAllCalendarLabels,
} = eventSlice.actions;

export default eventSlice.reducer;
