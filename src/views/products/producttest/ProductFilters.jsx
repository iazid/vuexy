import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Grid, MenuItem } from '@mui/material';
import CustomTextField from '@core/components/mui/TextField';

const ProductFilters = ({ setData, productData, productTypes, initialType }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [selectedType, setSelectedType] = useState(initialType);

  useEffect(() => {
    let filteredData = [...productData];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedType) {
      filteredData = filteredData.filter(product => product.type === selectedType);
    }

    if (dateFilter === 'upcoming') {
      filteredData = filteredData.filter(product => new Date(product.date) > today);
    } else if (dateFilter === 'today') {
      filteredData = filteredData.filter(product => {
        const productDate = new Date(product.date);
        return productDate >= today && productDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
    } else if (dateFilter === 'passed') {
      filteredData = filteredData.filter(product => new Date(product.date) < today);
    }

    setData(filteredData);
  }, [dateFilter, selectedType, productData, setData]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  return (
    <Card>
      <CardHeader title='Filters' className='pbe-4' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              select
              fullWidth
              id='select-date-filter'
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value=''>Filtrer par date</MenuItem>
              <MenuItem value='upcoming'>prochains produits</MenuItem>
              <MenuItem value='today'>aujourd'hui</MenuItem>
              <MenuItem value='passed'>produits passés</MenuItem>
            </CustomTextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <CustomTextField
              select
              fullWidth
              id='select-product-type'
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value=''>Sélectionner le type de produit</MenuItem>
              {productTypes.map(type => (
                <MenuItem key={type.id} value={type.name}>
                  {type.name}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
