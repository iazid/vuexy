'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Box, CircularProgress, Typography, Divider, Container, useTheme, Tabs, Tab } from '@mui/material';
import { useForm } from 'react-hook-form';
import { fetchEventBySlug, updateEvent, selectEvent, selectEventLoading, selectEventError } from '../../../../../redux-store/slices/eventSlice';
import { fetchTables, deleteTable, saveTable, addTable, selectTables, selectTablesLoading, selectTablesError } from '../../../../../redux-store/slices/tablesSlice';
import AddTableForm from '../../../../../views/events/tabs/tableTab';
import EditEventForm from '../../../../../views/events/tabs/editTab';
import BookingTab from '../../../../../views/events/tabs/bookingTab';
import SimpleEntriesTab from '../../../../../views/events/tabs/simpleEntriesTab'; 
import OrdersTab from '../../../../../views/events/tabs/ordersTab';  // Import the OrdersTab

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

  const dispatch = useDispatch();
  const event = useSelector(selectEvent);
  const loadingEvent = useSelector(selectEventLoading);
  const errorEvent = useSelector(selectEventError);

  const tables = useSelector(selectTables);
  const loadingTables = useSelector(selectTablesLoading);
  const errorTables = useSelector(selectTablesError);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  useEffect(() => {
    if (slug) {
      dispatch(fetchEventBySlug(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (event) {
      setValue('date', event.dateFormatted); 
      setValue('time', event.timeFormatted);  
      setValue('name', event.name);
      setValue('address', event.address);
      setValue('description', event.description);
      setValue('place_description', event.place_description);
      setValue('dressed_up', event.dressed_up);
      setValue('regular_price', event.regular_price);
      setValue('simpEntry', event.simpEntry);
      if (event.avatar) {
        setImagePreview(event.avatar);
      }
      dispatch(fetchTables(event.id));
    }
  }, [event, setValue, dispatch]);

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

  const onSubmit = (data) => {
    if (event) {
      dispatch(updateEvent({ eventId: event.id, data, image }))
        .then(() => router.push('/events/eventpage'));
    }
  };

  if (loadingEvent || loadingTables) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (errorEvent || errorTables) {
    return <div>Error: {errorEvent || errorTables}</div>;
  }

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
          <Tab label="Commandes" />  {/* Add new Tab for Commandes */}
        </Tabs>

        {selectedTab === 0 && (
          <EditEventForm 
            control={control}
            handleSubmit={handleSubmit}
            setValue={setValue}
            reset={reset}
            errors={errors}
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
            eventId={event?.id}
            tables={tables}
            onDelete={(tableId) => dispatch(deleteTable(tableId))}
            onSave={(tableId, tableData) => dispatch(saveTable({ tableId, tableData }))}
            onAdd={(data) => dispatch(addTable({ eventId: event.id, data }))}
          />
        )}
        {selectedTab === 2 && <BookingTab eventId={event?.id} />}
        {selectedTab === 3 && <SimpleEntriesTab eventId={event?.id} />} 
        {selectedTab === 4 && <OrdersTab eventId={event?.id} />}  {/* Render OrdersTab when selected */}
      </Box>
    </Container>
  );
};

export default EventPage;
