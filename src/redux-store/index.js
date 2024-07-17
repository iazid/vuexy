

import { configureStore } from '@reduxjs/toolkit';

import eventReducer from './slices/event';

export const store = configureStore({
  reducer: {
    events: eventReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
