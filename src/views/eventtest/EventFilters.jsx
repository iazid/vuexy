// React Imports
import { useState, useEffect } from 'react';

// MUI Imports
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';

// Component Imports
import CustomTextField from '@core/components/mui/TextField';

const EventFilters = ({ setData, eventData }) => {
  // States
  const [location, setLocation] = useState('');

  useEffect(() => {
    const filteredData = eventData?.filter(event => {
      if (location && !event.address.toLowerCase().includes(location.toLowerCase())) return false;
      return true;
    });

    setData(filteredData);
  }, [location, eventData, setData]);

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-location'
            value={location}
            onChange={e => setLocation(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Choisir un emplacement</MenuItem>
            <MenuItem value='paris'>Paris</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default EventFilters;
