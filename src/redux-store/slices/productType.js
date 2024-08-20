import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { adb } from '../../app/firebase/firebaseconfigdb';
import ProductTypeFactory from '../../utils/ProductTypeFactory';

// État initial fusionné
const initialState = {
  productTypes: [],
  status: 'idle',
  loading: false,
  error: null,
};

// Thunk fusionné pour récupérer les types de produits
export const fetchProductTypes = createAsyncThunk('productTypes/fetchProductTypes', async (_, { rejectWithValue }) => {
  try {
    const productTypesCollectionRef = collection(adb, 'productTypes');
    const productTypesData = await getDocs(productTypesCollectionRef);
    const productTypesList = await Promise.all(productTypesData.docs.map(doc => {
      try {
        return ProductTypeFactory(doc);
      } catch (error) {
        console.error("Error fetching product type data:", error);
        return null;
      }
    }));

    return productTypesList.filter(productType => productType);
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// Thunk pour ajouter un type de produit
export const addProductType = createAsyncThunk(
  'productTypes/addProductType',
  async (newType, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(adb, 'productTypes'), newType);
      return { id: docRef.id, ...newType };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk pour mettre à jour un type de produit existant
export const updateProductType = createAsyncThunk(
  'productTypes/updateProductType',
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const docRef = doc(adb, 'productTypes', id);
      await updateDoc(docRef, updatedData);
      return { id, updatedData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productTypeSlice = createSlice({
  name: 'productTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Récupération des types de produits (fusionnée)
      .addCase(fetchProductTypes.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.productTypes = action.payload;
      })
      .addCase(fetchProductTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })

      // Ajout d'un type de produit
      .addCase(addProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProductType.fulfilled, (state, action) => {
        state.loading = false;
        state.productTypes.push(action.payload);
      })
      .addCase(addProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mise à jour d'un type de produit
      .addCase(updateProductType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.productTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.productTypes[index] = { ...state.productTypes[index], ...action.payload.updatedData };
        }
      })
      .addCase(updateProductType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productTypeSlice.reducer;
