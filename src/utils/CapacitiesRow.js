import { TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const CapacitiesRow = ({ index, capacity, onCapacityChange }) => {
  const handleChange = (field) => (event) => {
    onCapacityChange(index, field, event.target.value);
  };

  return (
    <div>
      <TextField
        label="Prix"
        value={capacity.price}
        onChange={handleChange('price')}
      />
      <TextField
        label="Quantité"
        value={capacity.quantity}
        onChange={handleChange('quantity')}
      />
      <TextField
        label="Capacité"
        value={capacity.capacity}
        onChange={handleChange('capacity')}
      />
      <FormControl>
        <InputLabel>Unité</InputLabel>
        <Select
          value={capacity.unity}
          onChange={handleChange('unity')}
        >
          <MenuItem value="CL">Centilitres</MenuItem>
          <MenuItem value="L">Litres</MenuItem>
          {/* Add other units as necessary */}
        </Select>
      </FormControl>
    </div>
  );
};

export default CapacitiesRow;
