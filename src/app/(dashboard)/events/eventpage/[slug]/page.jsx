'use client'

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Button, Box, CircularProgress, IconButton, Typography, Divider, TextField, FormControlLabel, Switch, Container, useTheme } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import FirebaseService from '../../../../../app/firebase/firebaseService';
import { adb, storagedb } from '../../../../firebase/firebaseconfigdb';
import { slugify } from '../../../../../utils/slugify';

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

  const today = new Date().toISOString().split('T')[0]; // Obtenir la date d'aujourd'hui au format ISO


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
        <Typography variant='h5'>Modifier l'événement</Typography>
        <Divider sx={{ marginY: 2 }} />
        <Box component='form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="raised-button-file-edit"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="raised-button-file-edit">
            <Button variant="contained" component="span">
              Sélectionner une image
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginY: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <img src={imagePreview} alt="Aperçu de l'événement" style={{ maxWidth: '400px', maxHeight: '400px', objectFit: 'contain' }} />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255, 255, 255, 0.7)' }}
                  onClick={handleImageRemove}
                >
                  <i className='tabler-trash text-textPrimary' />
                </IconButton>
              </Box>
            </Box>
          )}
          <Controller
            name='name'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Nom'
                placeholder='Nom'
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ''}
              />
            )}
          />
          <Controller
            name='date'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="date"
                label='Date'
                InputLabelProps={{ shrink: true }}
                error={!!errors.date}
                helperText={errors.date ? errors.date.message : ''}
                inputProps={{ min: today }} 
              />
            )}
          />
          <Controller
            name='time'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="time"
                label='Heure'
                InputLabelProps={{ shrink: true }}
                error={!!errors.time}
                helperText={errors.time ? errors.time.message : ''}
              />
            )}
          />
          <Controller
            name='address'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Adresse'
                placeholder='Adresse'
                error={!!errors.address}
                helperText={errors.address ? errors.address.message : ''}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label='Description'
                placeholder='Description'
                error={!!errors.description}
                helperText={errors.description ? errors.description.message : ''}
              />
            )}
          />
          <Controller
            name='place_description'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label='Description du lieu'
                placeholder='Description du lieu'
                error={!!errors.place_description}
                helperText={errors.place_description ? errors.place_description.message : ''}
              />
            )}
          />
          <Controller
            name='dressed_up'
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={!!field.value} />}
                label="Tenue habillée"
              />
            )}
          />
          <Controller
            name='regular_price'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label='Prix régulier'
                placeholder='Prix régulier'
                error={!!errors.regular_price}
                helperText={errors.regular_price ? errors.regular_price.message : ''}
              />
            )}
          />
          <Controller
            name='simpEntry'
            control={control}
            rules={{ required: 'Ce champ est requis.' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label='Entrée simple'
                placeholder='Entrée simple'
                error={!!errors.simpEntry}
                helperText={errors.simpEntry ? errors.simpEntry.message : ''}
              />
            )}

          />
          <br/>
          <br/>
          <Box display="flex" justifyContent="space-between">
            <Button variant='contained' type='submit' disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Terminer'}
            </Button>
            <Button variant='tonal' color='error' type='reset' onClick={() => router.push('/events/eventpage')}>
              Annuler
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default EditEventPage;
