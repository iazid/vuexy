'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

// MUI Imports
import { Card, Typography, MenuItem, styled, Select, CardHeader, Button } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

// Third-party Imports
import classnames from 'classnames';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel
} from '@tanstack/react-table';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import tableStyles from '@core/styles/table.module.css';
import CustomTextField from '@core/components/mui/TextField';
import EventFilters from './EventFilters';
import AddEventDrawer from './AddEventDrawer';
import EditEventDrawer from './EditEventDrawer';
import { adb, storagedb } from '../../app/firebase/firebaseconfigdb';
import EventFactory from '../../utils/EventFactory';

const Icon = styled('i')({});

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />;
};

const EventListTable = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('passed');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [editEventOpen, setEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setStatus('loading');
      try {
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

        const validEvents = eventsList.filter(event => event);
        setEvents(validEvents);
        setFilteredEvents(validEvents);
        setStatus('succeeded');
      } catch (err) {
        setError(err.message);
        setStatus('failed');
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filteredData = events?.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      if (dateFilter === 'passed' && eventDate >= today) return false;
      if (dateFilter === 'today' && (eventDate.getDate() !== today.getDate() || eventDate.getMonth() !== today.getMonth() || eventDate.getFullYear() !== today.getFullYear())) return false;
      if (dateFilter === 'upcoming' && eventDate < today) return false;

      return true;
    });

    setFilteredEvents(filteredData);
  }, [dateFilter, events]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('avatar', {
        header: '',
        cell: ({ row }) => (
          <CustomAvatar src={row.original.avatar} alt={row.original.name} sx={{ width: 160, height: 160 }} />
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nom',
        cell: ({ row }) => (
          <Typography 
            variant="body1" 
            onClick={() => {
              setSelectedEvent(row.original); // Set the selected event
              setEditEventOpen(true); // Open the edit drawer
            }}
            style={{ cursor: 'pointer' }}
          >
            {row.original.name || 'Nom non disponible'}
          </Typography>
        )
      }),
      columnHelper.accessor('address', {
        header: 'Lieu',
        cell: ({ row }) => (
          <Typography variant="body2">{row.original.address || 'Lieu non disponible'}</Typography>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography variant="body2">{row.original.date !== 'not indicated' ? new Date(row.original.date).toLocaleDateString() : 'Date non disponible'}</Typography>
        )
      })
    ],
    []
  );

  const table = useReactTable({
    data: filteredEvents,
    columns,
    state: {
      globalFilter
    },
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  const handleMenuChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleEventAdded = async (eventId) => {
    const eventDoc = await getDoc(doc(adb, 'events', eventId));
    const newEvent = EventFactory(eventDoc);
    const imageRef = ref(storagedb, `events/${eventId}/pic`);
    newEvent.avatar = await getDownloadURL(imageRef).catch(() => `events/${eventId}/pic`);
    setEvents(prevEvents => [...prevEvents, newEvent]);
    setFilteredEvents(prevEvents => [...prevEvents, newEvent]);
  };

  const handleEventUpdated = async () => {
    const eventDoc = await getDoc(doc(adb, 'events', selectedEvent.id));
    const updatedEvent = EventFactory(eventDoc);
    const imageRef = ref(storagedb, `events/${selectedEvent.id}/pic`);
    updatedEvent.avatar = await getDownloadURL(imageRef).catch(() => `events/${selectedEvent.id}/pic`);
    setEvents(prevEvents => prevEvents.map(event => event.id === selectedEvent.id ? updatedEvent : event));
    setFilteredEvents(prevEvents => prevEvents.map(event => event.id === selectedEvent.id ? updatedEvent : event));
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <div className='flex justify-between items-center'>
        <div className='flex items-center'>
          <Select
            value={dateFilter}
            onChange={handleMenuChange}
            displayEmpty
            variant="standard"
            inputProps={{
              style: {
                fontSize: '3rem',
                fontWeight: 'bold',
                border: 'none'
              }
            }}
            IconComponent={ArrowDropDownIcon}
            style={{
              minWidth: '250px', 
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}
          >
            <MenuItem value='upcoming'>Evenements futurs</MenuItem>
            <MenuItem value='today'>Evenements d'aujourd'hui</MenuItem>
            <MenuItem value='passed'>Evenements passés</MenuItem>
          </Select>
        </div>
        <Button
          variant="contained"
          startIcon={<i className="tabler-plus" />}
          onClick={() => setAddEventOpen(true)}
          className="is-full sm:is-auto"
        >
          Ajouter un nouvel événement
        </Button>
      </div>
      <br/>
      <Card>
        <CardHeader title='Filtres' className='pbe-4' />
        <EventFilters setData={setFilteredEvents} eventData={events} />
      </Card>
      <br/>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Rechercher un évènement'
            className='is-full sm:is-auto'
          />
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} style={{ minWidth: '200px' }}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort()
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <i className='tabler-chevron-up text-xl' />,
                            desc: <i class='tabler-chevron-down text-xl' />
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ minWidth: '200px' }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </Card>
      <AddEventDrawer
        open={addEventOpen}
        handleClose={() => setAddEventOpen(false)}
        onEventAdded={handleEventAdded}
      />
      <EditEventDrawer
        open={editEventOpen}
        handleClose={() => setEditEventOpen(false)}
        eventId={selectedEvent?.id}
        eventImage={selectedEvent?.avatar}  // Pass the image URL
        onEventUpdated={handleEventUpdated}
        selectedEvent={selectedEvent} // Pass the selected event details
      />
    </div>
  );

};

export default EventListTable;
