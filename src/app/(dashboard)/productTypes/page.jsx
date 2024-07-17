'use client'

// Importations React
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { adb } from '../../firebase/firebaseconfigdb';

// Importations de composants
import ProductTypeListTable from '../../../views/products/product types/ProductTypeTable'; 
import ProductTypeFactory from '../../../utils/ProductTypeFactory';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProductTypesPage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      const productTypesCollectionRef = collection(adb, 'productTypes');
      const productTypesData = await getDocs(productTypesCollectionRef);
      const productTypesList = productTypesData.docs.map(doc => ProductTypeFactory(doc));
      
      setProductTypes(productTypesList);
      setLoading(false);
    };

    fetchProductTypes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <h1>Product Types</h1>
      <br/> 
      <ProductTypeListTable productTypes={productTypes} />
    </div>
  );
};

export default ProductTypesPage;
