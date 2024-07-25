'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import { fetchCapacities } from '../../../redux-store/slices/capacity';
import ProductListTable from '../../../views/products/producttest/ProductListTable';
import ProductFilters from '../../../views/products/producttest/ProductFilters';
import AddProductDrawer from '../../../views/products/producttest/AddProductDrawerr';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../firebase/firebaseconfigdb';
import ProductFactory from '../../../utils/ProductFactory';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const { productTypes, status: productTypeStatus, error: productTypeError } = useSelector(state => state.productTypes);
  const { capacities, status: capacityStatus, error: capacityError } = useSelector(state => state.capacities);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [addProductOpen, setAddProductOpen] = useState(false);

  useEffect(() => {
    if (productTypeStatus === 'idle') {
      dispatch(fetchProductTypes());
    }
    if (capacityStatus === 'idle') {
      dispatch(fetchCapacities());
    }
  }, [productTypeStatus, capacityStatus, dispatch]);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProductsPromises = productTypes.flatMap(type =>
        type.products.map(async productRef => {
          const productDoc = await getDoc(doc(adb, productRef.path));
          if (productDoc.exists()) {
            let product = ProductFactory(productDoc);
            const capacitiesRefs = productDoc.data().capacities || [];
            const numberOfCapacities = capacitiesRefs.length;

            product = {
              ...product,
              type: type.name,
              numberOfCapacities: numberOfCapacities
            };

            const imageRef = ref(storagedb, `products/${productDoc.id}/pic`);
            product.pic = await getDownloadURL(imageRef).catch(() => `products/${productDoc.id}/pic`);
            return product;
          }
          return null;
        })
      );

      const allProducts = (await Promise.all(allProductsPromises)).filter(product => product !== null);
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    };

    if (productTypes.length > 0) {
      fetchProducts();
    }
  }, [productTypes]);

  useEffect(() => {
    if (!initialType) {
      setFilteredProducts(products);
    }
  }, [initialType, products]);

  if (productTypeStatus === 'loading' || capacityStatus === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (productTypeStatus === 'failed') {
    return <div>Error: {productTypeError}</div>;
  }

  if (capacityStatus === 'failed') {
    return <div>Error: {capacityError}</div>;
  }

  return (
    <div>
      <ProductFilters setData={setFilteredProducts} productData={products} productTypes={productTypes} initialType={initialType} />
      <br />
      <ProductListTable productData={filteredProducts} setAddProductOpen={setAddProductOpen} />
      <AddProductDrawer
        open={addProductOpen}
        handleClose={() => setAddProductOpen(false)}
        productData={products}
        setData={setProducts}
        productTypes={productTypes}
      />
    </div>
  );
};

export default ProductsPage;
