'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, query, where, deleteDoc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { Button, Box, CircularProgress, Typography, Divider, Container, useTheme, Tabs, Tab } from '@mui/material';
import { useForm } from 'react-hook-form';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../../../firebase/firebaseconfigdb';
import { slugify } from '../../../../../utils/slugify';
import AddTableForm from '../../../../../views/events/tabs/tableTab';
import EditEventForm from '../../../../../views/events/tabs/editTab';
import BookingTab from '../../../../../views/events/tabs/bookingTab';
import SimpleEntriesTab from '../../../../../views/events/tabs/simpleEntriesTab'; 

const EventPage = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const router = useRouter();

  const { control, setValue, reset, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      date: '',
      time: '',
      address: '',
      description: '',
      place_description: '',
      dressed_up: false,
      regular_price: 0,
      simpEntry: 0,
    }
  });

  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tables, setTables] = useState([]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toTimeString().split(' ')[0].slice(0, 5);
  };

  const fetchTables = async () => {
    if (!eventId) {
      console.error("eventId is null or undefined");
      return;
    }
    setLoading(true);
    try {
      const eventDocRef = doc(adb, 'events', eventId);
      const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', eventDocRef));
      const querySnapshot = await getDocs(tablesQuery);
      const tablesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTables(tablesData);
    } catch (error) {
      console.error("Erreur lors de la récupération des tables:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    try {
      await deleteDoc(doc(adb, 'tables', tableId));
      fetchTables();
    } catch (error) {
      console.error("Erreur lors de la suppression de la table:", error);
    }
  };

  const handleSaveTable = async (tableId, tableData) => {
    try {
      await updateDoc(doc(adb, 'tables', tableId), {
        name: tableData.name,
        price: Number(tableData.price),
        size: Number(tableData.size),
        quantity: Number(tableData.quantity),
      });
      fetchTables();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la table:", error);
    }
  };

  const addTable = async (data) => {
    const eventRef = doc(adb, 'events', eventId);

    const tableData = {
      name: data.tableName.charAt(0).toUpperCase() + data.tableName.slice(1),
      price: parseInt(data.price, 10),
      size: parseInt(data.guests, 10),
      quantity: parseInt(data.tableNumber, 10),
      eventRef: eventRef,
      date: Timestamp.now(),
    };

    try {
      await addDoc(collection(adb, 'tables'), tableData);
      fetchTables();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la table:", error);
    }
  };

  const refreshData = async () => {
    fetchTables();
  };

  useEffect(() => {
    if (slug) {
      const fetchEventDataBySlug = async () => {
        try {
          const eventsCollectionRef = collection(adb, 'events');
          const eventData = await getDocs(eventsCollectionRef);
          const event = eventData.docs.find(doc => slugify(doc.data().name) === slug);
          if (event) {
            const eventData = event.data();
            setEventId(event.id);
            setValue('date', formatDate(eventData.date));
            setValue('time', formatTime(eventData.date));
            setValue('name', eventData.name || '');
            setValue('address', eventData.address || '');
            setValue('description', eventData.description || '');
            setValue('place_description', eventData.place_description || '');
            setValue('dressed_up', eventData.dressed_up || false);
            setValue('regular_price', eventData.regular_price || 0);
            setValue('simpEntry', eventData.simpEntry || 0);
            if (eventData.pic) {
              setImagePreview(await getDownloadURL(ref(storagedb, eventData.pic)));
            }
            fetchTables();
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching event data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchEventDataBySlug();
    }
  }, [slug, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageRemove = () => {
    setImage(null);
    setImagePreview(null);
  };

  const uploadImage = async (file, path) => {
    const imageRef = ref(storagedb, path);
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const eventDocRef = doc(adb, 'events', eventId);
      const eventTimestamp = Timestamp.fromDate(new Date(`${data.date}T${data.time}:00`));
      const updatedEvent = { 
        name: data.name,
        date: eventTimestamp,
        time: eventTimestamp,
        address: data.address,
        description: data.description,
        place_description: data.place_description,
        dressed_up: data.dressed_up,
        regular_price: Number(data.regular_price),  
        simpEntry: Number(data.simpEntry),          
      };

      if (image && eventId) {
        const normalImagePath = `events/${eventId}/pic`;
        const croppedImagePath = `events/${eventId}/pic_cropped`;

        await uploadImage(image, normalImagePath);
        await uploadImage(image, croppedImagePath);

        updatedEvent.imageUri = normalImagePath;
        updatedEvent.pic = normalImagePath;
        updatedEvent.croppedUri = croppedImagePath;
      }

      await FirebaseService.updateEvent(eventDocRef, updatedEvent);
      refreshData();

    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'événement:', error);
    } finally {
      setLoading(false);
      router.push('/events/eventpage');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Container className='overflow-x-auto' maxWidth="xl" sx={{ paddingY: 3, paddingX: 2 }}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          padding: 10,
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example">
          <Tab label="Modifier l'évènement" />
          <Tab label="Ajouter une table" />
          <Tab label="Demandes" />
          <Tab label="Entrées simples" /> 

        </Tabs>

        {selectedTab === 0 && (
          <EditEventForm 
            control={control}
            handleSubmit={handleSubmit}
            setValue={setValue}
            reset={reset}
            errors={errors}
            loading={loading}
            handleImageChange={handleImageChange}
            handleImageRemove={handleImageRemove}
            imagePreview={imagePreview}
            today={today}
            onSubmit={onSubmit}
            router={router}
          />
        )}
        {selectedTab === 1 && (
          <AddTableForm
            eventId={eventId}
            tables={tables}
            onDelete={handleDeleteTable}
            onSave={handleSaveTable}
            onAdd={addTable}
          />
        )}
        {selectedTab === 2 && <BookingTab eventId={eventId} />}
        {selectedTab === 3 && <SimpleEntriesTab eventId={eventId} />} 
      </Box>
    </Container>
  );
};

export default EventPage;
