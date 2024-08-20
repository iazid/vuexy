

import { configureStore } from '@reduxjs/toolkit';

import eventReducer from './slices/event'
import productTypeReducer from './slices/productType';
import productType2Reducer from './slices/productType2';
import capacityReducer from './slices/capacity'; 
import productReducer from './slices/product'; 
import product2Reducer from './slices/product2'; 
import tableReducer from './slices/table'
import event2Reducer from './slices/event2'
import bookingReducer from './slices/booking'

export const store = configureStore({
  reducer: {
    events: eventReducer,
    productTypes : productTypeReducer,
    productTypes2 : productType2Reducer,
    capacities: capacityReducer,
    products : productReducer, 
    tables : tableReducer,
    event2 : event2Reducer,
    booking : bookingReducer,
    products2 : product2Reducer, 
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
