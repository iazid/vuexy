import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, Grid, MenuItem } from '@mui/material';
import CustomTextField from '@core/components/mui/TextField';

const ProductFilters = ({ setData, productData, productTypes, initialType, setCurrentFilters }) => {
  const [selectedType, setSelectedType] = useState(initialType);

  useEffect(() => {
    let filteredData = [...productData];

    if (selectedType) {
      filteredData = filteredData.filter(product => product.type === selectedType);
    }

    setData(filteredData);
    setCurrentFilters({ selectedType });
  }, [selectedType, productData, setData, setCurrentFilters]);

  useEffect(() => {
    setSelectedType(initialType);
  }, [initialType]);

  return (
    <Card>
      <CardHeader title='Filtres' className='pbe-4' />
      <CardContent>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
