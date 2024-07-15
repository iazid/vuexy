// React Imports
import { useState, useEffect } from 'react';

// MUI Imports
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';

// Component Imports
import CustomTextField from '@core/components/mui/TextField';

const ProductFilters = ({ setData, productData }) => {
  // States
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
            <MenuItem value=''>Select Product Type</MenuItem>
            <MenuItem value='electronics'>Electronics</MenuItem>
            <MenuItem value='fashion'>Fashion</MenuItem>
            <MenuItem value='home'>Home</MenuItem>
            <MenuItem value='beauty'>Beauty</MenuItem>
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
            <MenuItem value='all'>All Dates</MenuItem>
            <MenuItem value='upcoming'>Upcoming Products</MenuItem>
            <MenuItem value='today'>Today's Products</MenuItem>
            <MenuItem value='passed'>Past Products</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default ProductFilters;
