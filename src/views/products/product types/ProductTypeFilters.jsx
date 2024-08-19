// Importations React
import React,{ useState, useEffect } from 'react';

// Importations MUI
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';

// Importations de composants
import CustomTextField from '@core/components/mui/TextField';

const ProductFilters = React.memo(({ setData, productData }) => {
  // États
  const [productType, setProductType] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    const filteredData = productData?.filter(product => {
      const productDate = new Date(product.date);
      const today = new Date();

      if (productType && product.productType !== productType) return false;
      if (dateFilter === 'passed' && productDate >= today) return false;
      if (dateFilter === 'today' && (productDate.getDate() !== today.getDate() || productDate.getMonth() !== today.getMonth() || productDate.getFullYear() !== today.getFullYear())) return false;
      if (dateFilter === 'upcoming' && productDate < today) return false;

      return true;
    });

    setData(filteredData);
  }, [productType, dateFilter, productData, setData]);

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-product-type'
            value={productType}
            onChange={e => setProductType(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Sélectionner le type de produit</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-date-filter'
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value='all'>Toutes les dates</MenuItem>
            <MenuItem value='upcoming'>Produits à venir</MenuItem>
            <MenuItem value='today'>Produits d'aujourd'hui</MenuItem>
            <MenuItem value='passed'>Produits passés</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  );
});

export default ProductFilters;
