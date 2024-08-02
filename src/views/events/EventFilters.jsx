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
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const filteredData = eventData?.filter(event => {
      if (eventType && event.type !== eventType) return false;
      if (location && !event.address.toLowerCase().includes(location.toLowerCase())) return false;

      return true;
    });

    setData(filteredData);
  }, [eventType, location, eventData, setData]);

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            select
            fullWidth
            id='select-event-type'
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>Sélectionnez le type d'événement</MenuItem>
            <MenuItem value='mondaine'>Mondaine</MenuItem>
            <MenuItem value='club'>Club</MenuItem>
            <MenuItem value='privée'>Privée</MenuItem>
            <MenuItem value='lounge'>Lounge</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <CustomTextField
            fullWidth
            id='select-location'
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder='Entrez la location'
          />
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default EventFilters;
