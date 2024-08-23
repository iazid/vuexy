

import { configureStore } from '@reduxjs/toolkit';


import productTypeReducer from './slices/productType';
import capacitiesReducer from './slices/capacitiesSlice';  
import productTypesReducer from './slices/productTypesSlice'; 
import productsReducer from './slices/productsSlice'; 
import addProductReducer from './slices/addProductSlice'; 
import tablesReducer from './slices/tablesSlice';
import eventsReducer from './slices/eventsSlice'; 
import eventReducer from './slices/eventSlice';
import userReducer from './slices/userSlice';
import userDetailsReducer from './slices/userDetailsSlice';
import documentReducer from './slices/documentSlice';



export const store = configureStore({
  reducer: {
    

    //producttypespage
    productTypes : productTypeReducer,
    //products : productReducer, 

    //productpage
    productsTypes : productTypesReducer, 
    products : productsReducer,
    capacities : capacitiesReducer,
    addProduct : addProductReducer,

    //eventspage
    events: eventsReducer, //la eventspage
    event: eventReducer, // les slugs
    tables: tablesReducer,

    //utilisateurs
    users: userReducer,
    userDetails: userDetailsReducer,
    document : documentReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
});
