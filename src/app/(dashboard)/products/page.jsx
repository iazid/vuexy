'use client'

// Importations React
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../firebase/firebaseconfigdb';

// Importations de composants
import ProductListTable from '../../../views/products/ProductListTable'; 
import ProductTypeFactory from '../../../utils/ProductTypeFactory';
import ProductFactory from '../../../utils/ProductFactory'; 
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const ProductsPage = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductTypes = async () => {
      const productTypesCollectionRef = collection(adb, 'productTypes');
      const productTypesData = await getDocs(productTypesCollectionRef);
      const productTypesList = productTypesData.docs.map(doc => ProductTypeFactory(doc));
      
      setProductTypes(productTypesList);

      // Fetch all products
      const allProducts = [];
      for (const productType of productTypesList) {
        for (const productRef of productType.products) {
          const productDoc = await getDoc(doc(adb, productRef.path));
          if (productDoc.exists()) {
            let product = ProductFactory(productDoc);
            const imageRef = ref(storagedb, `products/${productDoc.id}/pic`); 
            product.pic = await getDownloadURL(imageRef).catch(() => 'products/${productDoc.id}/pic');
            allProducts.push(product);
          }
        }
      }
      setProducts(allProducts);
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
      <h1>Produits</h1>
      <ProductListTable productData={products} />
    </div>
  );
};

export default ProductsPage;
