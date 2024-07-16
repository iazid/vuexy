//index.js

// Third-party Imports
import { configureStore } from '@reduxjs/toolkit';

// Slice Imports
import eventReducer from './slices/event';

export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
