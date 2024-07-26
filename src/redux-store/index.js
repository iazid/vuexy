

import { configureStore } from '@reduxjs/toolkit';

import eventReducer from './slices/event';
import productTypeReducer from './slices/productType';
import capacityReducer from './slices/capacity'; 
import productReducer from './slices/product'; 


export const store = configureStore({
  reducer: {
    events: eventReducer,
    productTypes : productTypeReducer,
    capacities: capacityReducer,
    products : productReducer, 
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
