import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import ProductFactory from '../../utils/ProductFactory';

const initialState = {
  products: [],
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const productTypesCollectionRef = collection(adb, 'productTypes');
  const productTypesSnapshot = await getDocs(productTypesCollectionRef);

  const allProductsPromises = productTypesSnapshot.docs.flatMap(type =>
    type.data().products?.map(async productRef => {
      const productDoc = await getDoc(doc(adb, productRef.path));
      if (productDoc.exists()) {
        let product = ProductFactory(productDoc);
        const capacitiesRefs = productDoc.data().capacities || [];
        const numberOfCapacities = capacitiesRefs.length;

        product = {
          ...product,
          type: type.data().name,
          numberOfCapacities: numberOfCapacities,
        };

        const imageRef = ref(storagedb, `products/${productDoc.id}/pic`);
        product.pic = await getDownloadURL(imageRef).catch(() => `products/${productDoc.id}/pic`);
        return product;
      }
      return null;
    }) || []
  );

  const allProducts = (await Promise.all(allProductsPromises)).filter(product => product !== null);
  return allProducts;
});

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct(state, action) {
      state.products.push(action.payload);
    },
    updateProduct(state, action) {
      const index = state.products.findIndex(product => product.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    removeProduct(state, action) {
      state.products = state.products.filter(product => product.id !== action.payload.id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addProduct, updateProduct, removeProduct } = productSlice.actions;

export default productSlice.reducer;
