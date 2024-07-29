// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import ProductListTable from './ProductListTable'


const UserList = ({ userData }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      </Grid>
      <Grid item xs={12}>
        <ProductListTable tableData={userData} />
      </Grid>
    </Grid>
  )
}

export default UserList
