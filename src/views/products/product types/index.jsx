// MUI Imports
import Grid from '@mui/material/Grid'
import React from 'react'

// Component Imports
import UserListTable from './ProductTypeTable'


const UserList = React.memo(({ userData }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
      </Grid>
      <Grid item xs={12}>
        <UserListTable tableData={userData} />
      </Grid>
    </Grid>
  )
})

export default UserList
