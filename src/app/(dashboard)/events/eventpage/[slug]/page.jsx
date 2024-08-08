'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button, Box, CircularProgress, Typography, Divider, Container, useTheme, Tabs, Tab } from '@mui/material';
import { useForm } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FirebaseService from '../../../../../app/firebase/firebaseService';
import { adb, storagedb } from '../../../../firebase/firebaseconfigdb';
import { slugify } from '../../../../../utils/slugify';
import AddTableForm from '../../../../../views/events/tabs/tableTab';
import EditEventForm from '../../../../../views/events/tabs/editTab';

const Category2 = ({ handleClose }) => (
  <Box>
    <br />
    <Typography variant='h4'>Ajouter une table</Typography>
    <AddTableForm handleClose={handleClose} />
  </Box>
);

const Category3 = () => (
  <Box>
    <Typography variant='h6'>a faire</Typography>
    
  </Box>
);

const Category4 = () => (
  <Box>
    <Typography variant='h6'>A faire</Typography>
    
  </Box>
);

const EditEventPage = () => {
  const theme = useTheme();
  const { slug } = useParams();
  const router = useRouter();
  const { control, reset, handleSubmit, setValue, formState: { errors } } = useForm({
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

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split('T')[0];
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toTimeString().split(' ')[0].slice(0, 5);
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          <Tab label="Synthèse" />
        </Tabs>
        
        {selectedTab === 0 && (
          <EditEventForm 
            control={control}
            handleSubmit={handleSubmit}
            setValue={setValue}
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
        {selectedTab === 1 && <Category2  />}
        {selectedTab === 2 && <Category3 />}
        {selectedTab === 3 && <Category4 />}
      </Box>
    </Container>
  );
};

export default EditEventPage;
