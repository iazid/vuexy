'use client'

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { adb, storagedb, auth } from '../../firebase/firebaseconfigdb';
import { useRouter } from 'next/navigation';
import EventList from '../../../views/eventtest/EventListTable';
import { ref, getDownloadURL } from 'firebase/storage';
import EventFactory from '../../../utils/EventFactory';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import AddEventDrawer from '../../../views/eventtest/AddEventDrawer';
import EditEventDrawer from '../../../views/eventtest/EditEventDrawer';
import 'react-toastify/dist/ReactToastify.css';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, userLoading] = useAuthState(auth);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem('user'));
    if (!user && !userSession) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    const fetchEvents = async () => {
      const eventsCollectionRef = collection(adb, 'events');
      const eventData = await getDocs(eventsCollectionRef);
      const eventsList = await Promise.all(eventData.docs.map(async doc => {
        try {
          let event = EventFactory(doc);
          const imageRef = ref(storagedb, `events/${doc.id}/pic`); 
          event.avatar = await getDownloadURL(imageRef).catch(() => `events/${doc.id}/pic`);
          return event;
        } catch (error) {
          console.error("Error fetching event data:", error);
          return null;
        }
      }));

      const filteredEvents = eventsList.filter(event => event);
      console.log("Events fetched:", filteredEvents);
      setEvents(filteredEvents);
      setLoading(false);
    };

    fetchEvents();
  }, []);

  const handleEventAdded = async (eventId) => {
    const eventDoc = await getDoc(doc(adb, 'events', eventId));
    const newEvent = EventFactory(eventDoc);
    const imageRef = ref(storagedb, `events/${eventId}/pic`);
    newEvent.avatar = await getDownloadURL(imageRef).catch(() => `events/${eventId}/pic`);
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setEditEventOpen(true);
  };

  const handleEventUpdated = async (eventId, updatedData) => {
    const eventDoc = await getDoc(doc(adb, 'events', eventId));
    const updatedEvent = EventFactory(eventDoc);
    const imageRef = ref(storagedb, `events/${eventId}/pic`);
    updatedEvent.avatar = await getDownloadURL(imageRef).catch(() => `events/${eventId}/pic`);
    setEvents(prevEvents => prevEvents.map(event => event.id === eventId ? updatedEvent : event));
  };

  if (userLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <EventList 
        userData={events} 
        onEventClick={handleEventClick} 
        onAddEvent={() => setAddEventOpen(true)} 
      />
      <AddEventDrawer 
        open={addEventOpen} 
        handleClose={() => setAddEventOpen(false)} 
        onEventAdded={handleEventAdded} 
      />
      {selectedEvent && (
        <EditEventDrawer 
          open={editEventOpen} 
          handleClose={() => setEditEventOpen(false)} 
          eventData={selectedEvent} 
          onEventUpdated={handleEventUpdated} 
        />
      )}
    </div>
  );
}
