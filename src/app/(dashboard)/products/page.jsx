'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductTypes, selectProductTypes, selectProductTypesLoading, selectProductTypesError } from '../../../redux-store/slices/productTypesSlice';
import { fetchCapacities, selectCapacities, selectCapacitiesLoading, selectCapacitiesError } from '../../../redux-store/slices/capacitiesSlice';
import { fetchProducts, selectProducts, selectProductsLoading, selectProductsError, addProduct } from '../../../redux-store/slices/productsSlice';
import ProductListTable from '../../../views/products/product list/ProductListTable';
import ProductFilters from '../../../views/products/product list/ProductFilters';
import AddProductDrawer from '../../../views/products/product list/AddProductDrawerr';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const dispatch = useDispatch();

  const productTypes = useSelector(selectProductTypes);
  const loadingProductTypes = useSelector(selectProductTypesLoading);
  const errorProductTypes = useSelector(selectProductTypesError);

  const capacities = useSelector(selectCapacities);
  const loadingCapacities = useSelector(selectCapacitiesLoading);
  const errorCapacities = useSelector(selectCapacitiesError);

  const products = useSelector(selectProducts);
  const loadingProducts = useSelector(selectProductsLoading);
  const errorProducts = useSelector(selectProductsError);

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({ selectedType: initialType });

  useEffect(() => {
    dispatch(fetchProductTypes());
    dispatch(fetchCapacities());
  }, [dispatch]);

  useEffect(() => {
    if (productTypes.length > 0) {
      dispatch(fetchProducts(productTypes));
    }
  }, [productTypes, dispatch]);

  useEffect(() => {
    let filteredData = [...products];

    if (currentFilters.selectedType) {
      filteredData = filteredData.filter(product => product.type === currentFilters.selectedType);
    }

    setFilteredProducts(filteredData);
  }, [currentFilters, products]);

  const handleProductAdded = (newProductData) => {
    dispatch(addProduct(newProductData));

    let filteredData = [...products, newProductData];
    if (currentFilters.selectedType) {
      filteredData = filteredData.filter(product => product.type === currentFilters.selectedType);
    }

    setFilteredProducts(filteredData);
  };

  if (loadingProductTypes || loadingCapacities || loadingProducts) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorProductTypes || errorCapacities || errorProducts) {
    return <div>Error: {errorProductTypes || errorCapacities || errorProducts}</div>;
  }

  return (
    <div>
      <ProductFilters setData={setFilteredProducts} productData={products} productTypes={productTypes} initialType={initialType} setCurrentFilters={setCurrentFilters} />
      <br />
      <ProductListTable productData={filteredProducts} setAddProductOpen={setAddProductOpen} />
      <AddProductDrawer
        open={addProductOpen}
        handleClose={() => setAddProductOpen(false)}
        productTypes={productTypes}
        setFilteredProducts={setFilteredProducts}
        currentFilters={currentFilters}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default ProductsPage;
