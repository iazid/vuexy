'use client'

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import ProductTypeListTable from '../../../views/products/product types/ProductTypeTable';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProductTypeListPage = () => {
  const dispatch = useDispatch();
  const { productTypes, status, error } = useSelector(state => state.productTypes);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductTypes());
    }
  }, [status, dispatch]);

  const productTypesWithCount = productTypes.map(type => ({
    ...type,
    productCount: type.products ? type.products.length : 0
  }));

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
      <ProductTypeListTable productTypes={productTypesWithCount} />
    </div>
  );
};

export default ProductTypeListPage;
