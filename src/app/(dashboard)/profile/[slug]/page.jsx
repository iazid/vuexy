'use client'

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import UserLeftOverview from '../../../../views/users/user-left-overview/index';
import UserRight from '../../../../views/users/user-right/index';

const UserViewTab = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler un temps de chargement
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Remplacez par le vrai temps de chargement si nécessaire

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ height: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={5}>
        <UserLeftOverview />
      </Grid>
      <Grid item xs={12} lg={8} md={7}>
        <UserRight />
      </Grid>
    </Grid>
  );
};

export default UserViewTab;
