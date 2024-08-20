'use client'

import React, { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../../../../redux-store/slices/event'; 
import { auth } from '../../../firebase/firebaseconfigdb';
import EventList from '../../../../views/events/EventListTable';

export default function EventsPage() {
  const [user, userLoading] = useAuthState(auth);
  const router = useRouter();
  const dispatch = useDispatch();

  // Sélectionnez les données et le statut du store Redux
  const events = useSelector((state) => state.event?.filteredEvents || []); // Ajout de la vérification
  const loading = useSelector((state) => state.event?.status === 'loading'); // Ajout de la vérification

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem('user'));
    if (!user && !userSession) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      dispatch(fetchEvents()); // Déclenchez l'action pour récupérer les événements
    }
  }, [user, dispatch]);

  if (userLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <EventList userData={events} />
    </div>
  );
}
