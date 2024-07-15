'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';

// MUI Imports
import { Card, Typography, MenuItem, styled, Select, CardHeader} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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

// Util Imports
import { getInitials } from '@/utils/getInitials';

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

const UserListTable = ({ userData }) => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('passed');
  const { lang: locale } = useParams();

  useEffect(() => {
    setData(userData);
  }, [userData]);

  useEffect(() => {
    const filteredData = userData?.filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      if (dateFilter === 'passed' && eventDate >= today) return false;
      if (dateFilter === 'today' && (eventDate.getDate() !== today.getDate() || eventDate.getMonth() !== today.getMonth() || eventDate.getFullYear() !== today.getFullYear())) return false;
      if (dateFilter === 'upcoming' && eventDate < today) return false;

      return true;
    });

    setData(filteredData);
  }, [dateFilter, userData]);

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
          <Typography variant="body1">{row.original.name || 'Nom non disponible'}</Typography>
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
    data,
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
            <MenuItem value='upcoming'>Upcoming Events</MenuItem>
            <MenuItem value='today'>Today's Events</MenuItem>
            <MenuItem value='passed'>Past Events</MenuItem>
          </Select>
        </div>
      </div>
      <br/>
      <Card>
      <CardHeader title='Filters' className='pbe-4' />
      <EventFilters setData={setData} eventData={userData} />
      </Card>
      <br/>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Event'
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
    </div>
  );
};

export default UserListTable;
