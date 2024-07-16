import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';

const initialState = {
  events: [],
  filteredEvents: [],
  selectedEvent: null,
  status: 'idle',
  error: null,
};


export const fetchEvents = createAsyncThunk('events/fetchEvents', async () => {
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
});

const filterEventsUsingCheckbox = (events, selectedCalendars) => {
  return events.filter(event => selectedCalendars.includes(event.extendedProps?.calendar));
};

const eventSlice = createSlice({
  name: 'events',
  initialState: initialState,
  reducers: {
    filterEvents: state => {
      state.filteredEvents = state.events;
    },
    addEvent: (state, action) => {
      const newEvent = { ...action.payload, id: `${parseInt(state.events[state.events.length - 1]?.id ?? '0') + 1}` };
      state.events.push(newEvent);
    },
    updateEvent: (state, action) => {
      state.events = state.events.map(event => {
        if (event.id === action.payload.id) {
          return action.payload;
        } else {
          return event;
        }
      });
    },
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => event.id !== action.payload);
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
      state.selectedCalendars = action.payload ? ['Personal', 'Business', 'Family', 'Holiday', 'ETC'] : [];
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
