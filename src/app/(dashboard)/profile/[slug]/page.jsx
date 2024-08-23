'use client'

import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import UserLeftOverview from '../../../../views/users/user-left-overview/index';
import UserRight from '../../../../views/users/user-right/index';

const UserViewTab = () => {
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingRight, setLoadingRight] = useState(true);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        
        setLoadingLeft(true);
        setLoadingRight(true);

      
        await Promise.all([new Promise(res => setTimeout(res, 1000)), new Promise(res => setTimeout(res, 1000))]);

        setLoadingLeft(false);
        setLoadingRight(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoadingLeft(false);
        setLoadingRight(false);
      }
    };

    fetchData();
  }, []);

  if (loadingLeft || loadingRight) {
    return (
      <Grid container spacing={6} justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} lg={4} md={5}>
        <UserLeftOverview setLoading={setLoadingLeft} />
      </Grid>
      <Grid item xs={12} lg={8} md={7}>
        <UserRight setLoading={setLoadingRight} />
      </Grid>
    </Grid>
  );
};

export default UserViewTab;
