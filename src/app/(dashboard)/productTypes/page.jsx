'use client'

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductTypes } from '../../../redux-store/slices/productType';
import ProductTypeListTable from '../../../views/products/product types/ProductTypeTable';
import AddProductTypeDrawer from '../../../views/products/product types/AddProductTypeDrawer';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';


const ProductTypeListPage = () => {
  const dispatch = useDispatch();
  const productTypes = useSelector(state => state.productTypes.productTypes);
  const status = useSelector(state => state.productTypes.status);
  const error = useSelector(state => state.productTypes.error);
  const [addProductTypeOpen, setAddProductTypeOpen] = useState(false);
  const [localProductTypes, setLocalProductTypes] = useState([]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductTypes());
    } else if (status === 'succeeded') {
      setLocalProductTypes(productTypes);
    }
  }, [status, dispatch, productTypes]);

  const productTypesWithCount = localProductTypes.map(type => ({
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
      <ProductTypeListTable productTypes={productTypesWithCount} setAddProductTypeOpen={setAddProductTypeOpen} />
      <AddProductTypeDrawer
        open={addProductTypeOpen}
        handleClose={() => setAddProductTypeOpen(false)}
        setData={setLocalProductTypes}
      />
    </div>
  );
};

export default ProductTypeListPage;
