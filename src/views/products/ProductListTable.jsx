'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';

// MUI Imports
import { Card, Typography, MenuItem, styled, CardHeader, TablePagination } from '@mui/material';

// Third-party Imports
import classnames from 'classnames';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel
} from '@tanstack/react-table';

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar';
import tableStyles from '@core/styles/table.module.css';
import CustomTextField from '@core/components/mui/TextField';
import ProductFilters from './ProductFilters';

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

const ProductListTable = ({ productData }) => {
  const [data, setData] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { lang: locale } = useParams();

  useEffect(() => {
    setData(productData);
  }, [productData]);

  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor('pic', {
        header: '',
        cell: ({ row }) => (
          <CustomAvatar src={row.original.pic} alt={row.original.name} sx={{ width: 160, height: 160 }} />
        )
      }),
      columnHelper.accessor('name', {
        header: 'Nom',
        cell: ({ row }) => (
          <Typography variant="body1">{row.original.name || 'Name not available'}</Typography>
        )
      }),
      columnHelper.accessor('description', {
        header: 'Description',
        cell: ({ row }) => (
          <Typography variant="body2">{row.original.description || 'Description not available'}</Typography>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography variant="body2">{row.original.date !== 'not indicated' ? new Date(row.original.date).toLocaleDateString() : 'Date not available'}</Typography>
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
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div>
      <Card>
        <CardHeader title='Filtres' className='pbe-4' />
        <ProductFilters setData={setData} productData={productData} />
      </Card>
      <br/>
      <Card>
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Rechercher un produit'
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
        <TablePagination
          component='div'
          count={table.getPageCount() * table.getState().pagination.pageSize}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => table.setPageIndex(page)}
          onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        />
      </Card>
    </div>
  );
};

export default ProductListTable;
