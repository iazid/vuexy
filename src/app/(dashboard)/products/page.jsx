'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductListTable from '../../../views/products/producttest/ProductListTable';
import ProductFilters from '../../../views/products/producttest/ProductFilters';
import AddProductDrawer from '../../../views/products/producttest/AddProductDrawerr';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../firebase/firebaseconfigdb';
import ProductFactory from '../../../utils/ProductFactory';

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';

  const [productTypes, setProductTypes] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({ selectedType: initialType });

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const productTypesSnapshot = await getDocs(collection(adb, 'productTypes'));
        const productTypesData = productTypesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProductTypes(productTypesData);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchCapacities = async () => {
      try {
        const capacitiesSnapshot = await getDocs(collection(adb, 'capacities'));
        const capacitiesData = capacitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCapacities(capacitiesData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductTypes();
    fetchCapacities();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const allProductsPromises = productTypes.flatMap(type =>
        type.products?.map(async productRef => {
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
        }) || []
      );

      const allProducts = (await Promise.all(allProductsPromises)).filter(product => product !== null);
      setProducts(allProducts);
      setFilteredProducts(allProducts);
      setLoading(false);
    };

    if (productTypes.length > 0) {
      fetchProducts();
    }
  }, [productTypes]);

  useEffect(() => {
    let filteredData = [...products];

    if (currentFilters.selectedType) {
      filteredData = filteredData.filter(product => product.type === currentFilters.selectedType);
    }

    setFilteredProducts(filteredData);
  }, [currentFilters, products]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <ProductFilters setData={setFilteredProducts} productData={products} productTypes={productTypes} initialType={initialType} setCurrentFilters={setCurrentFilters} />
      <br />
      <ProductListTable productData={filteredProducts} setAddProductOpen={setAddProductOpen} />
      <AddProductDrawer
        open={addProductOpen}
        handleClose={() => setAddProductOpen(false)}
        productData={products}
        setData={setProducts}
        productTypes={productTypes}
        setFilteredProducts={setFilteredProducts}
        currentFilters={currentFilters}
      />
    </div>
  );
};

export default ProductsPage;
