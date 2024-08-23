// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserDetails from './UserDetails'

const UserLeftOverview = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserDetails />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview;
