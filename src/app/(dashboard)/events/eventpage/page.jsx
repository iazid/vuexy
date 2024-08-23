'use client'

import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import EventList from '../../../../views/events/EventListTable';
import { fetchEvents, selectEvents, selectEventsLoading, selectEventsError } from '../../../../redux-store/slices/eventsSlice';
import { auth } from '../../../firebase/firebaseconfigdb';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function EventsPage() {
  const [user, userLoading] = useAuthState(auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem('user'));
    if (!user && !userSession) {
      router.push('/login');
    } else if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      dispatch(fetchEvents());
    }
  }, [user, dispatch, router]);

  if (userLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <EventList userData={events} />
    </div>
  );
}
