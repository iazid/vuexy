

import { configureStore } from '@reduxjs/toolkit';

import eventReducer from './slices/event';
import productTypeReducer from './slices/productType';
import capacityReducer from './slices/capacity'; 

export const store = configureStore({
  reducer: {
    events: eventReducer,
    productTypes : productTypeReducer,
    capacities: capacityReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
