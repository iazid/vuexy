'use client'

import React from 'react'
import { Card, CardContent, Typography, Divider } from '@mui/material'

const UserTab = ({ profilePictureUrl }) => {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <Typography variant="h5">Titre</Typography> 
        </div>
        <div>
          <Typography variant="h5">Contenu</Typography>
          <Divider className="mlb-4" />
          <div className="flex flex-col gap-2">
            <Typography className="font-medium" color="text.primary">À faire1</Typography> 
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserTab
