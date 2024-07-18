'use client'

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../firebase/firebaseconfigdb';
import ProductFactory from '../../../utils/ProductFactory';
import ProductListTable from '../../../views/products/product list/ProductListTable';
import ProductFilters from '../../../views/products/product list/ProductFilters'; // Import the new filters component
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const { productTypes, status, error } = useSelector(state => state.productTypes);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductTypes());
    }
  }, [status, dispatch]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProducts = [];
      for (const type of productTypes) {
        for (const productRef of type.products) {
          const productDoc = await getDoc(doc(adb, productRef.path));
          if (productDoc.exists()) {
            let product = {
              ...ProductFactory(productDoc),
              type: type.name // Attach the type name to each product
            };
            const imageRef = ref(storagedb, `products/${productDoc.id}/pic`);
            product.pic = await getDownloadURL(imageRef).catch(() => `products/${productDoc.id}/pic`);
            allProducts.push(product);
          }
        }
      }

      setProducts(allProducts);
      setFilteredProducts(allProducts);
    };

    if (productTypes.length > 0) {
      fetchProducts();
    }
  }, [productTypes]);

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <br/>
      <ProductFilters setData={setFilteredProducts} productData={products} productTypes={productTypes} />
      <br/>
      <ProductListTable productData={filteredProducts} />
    </div>
  );
};

export default ProductsPage;
