'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'
import UserTab from './UserTab'

const UserRight = () => {
  // States
  const [activeTab, setActiveTab] = useState('reservations')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid item xs={12} lg={12}> {/* Utilisez lg={12} pour occuper toute la largeur */}
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-calendar' />} value='reservations' label='Réservations' iconPosition='start' />
            <Tab icon={<i className='tabler-shopping-cart' />} value='commandes' label='Commandes' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid item xs={12} lg={12} style={{ display: 'flex', justifyContent: 'center' }}> {/* Occupe toute la largeur */}
          <TabPanel value='reservations' style={{ width: '100%', height: '100%' }}>
            <UserTab />
          </TabPanel>
          <TabPanel value='commandes' style={{ width: '100%', height: '100%' }}>
            <UserTab />
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default UserRight
