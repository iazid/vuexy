// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserDetails from './UserDetails'

const UserLeftOverview = ({ setLoading }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <UserDetails setLoading={setLoading} />
      </Grid>
    </Grid>
  )
}

export default UserLeftOverview;
