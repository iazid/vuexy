'use client'

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Card, CardHeader, Button, IconButton, MenuItem } from '@mui/material';
import OptionMenu from '@core/components/option-menu';
import tableStyles from '@core/styles/table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import CustomTextField from '@core/components/mui/TextField';
import TablePagination from '@mui/material/TablePagination';

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

const ProductTypeListTable = React.memo (({ productTypes, setAddProductTypeOpen }) => {
  const columnHelper = createColumnHelper();
  const [globalFilter, setGlobalFilter] = useState('');
  const router = useRouter();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nom',
      cell: info => (
        <Typography
          variant="body1"
          onClick={() => router.push(`/products?type=${info.row.original.name}`)}
          style={{ cursor: 'pointer' }}
        >
          {info.row.original.name}
        </Typography>
      )
    }),
    columnHelper.accessor('idblank', {
      header: '',
    }),
    columnHelper.accessor('productCount', {
      header: 'Nombre de Produits',
      cell: info => <Typography variant="body2">{info.row.original.productCount}</Typography>
    }),
    columnHelper.accessor('idblank', {
      header: '',
    }),
    columnHelper.accessor('action', {
      header: 'Action',
      cell: ({ row }) => (
        <div className='flex items-center'>
          <IconButton onClick={() => setData(data?.filter(product => product.id !== row.original.id))}>
            <i className='tabler-trash text-textSecondary' />
          </IconButton>
          <i className='tabler-eye text-textSecondary' />
          <IconButton>
          </IconButton>
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Download',
                icon: 'tabler-download',
                menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
              },
              {
                text: 'Edit',
                icon: 'tabler-edit',
                menuItemProps: { className: 'flex items-center gap-2 text-textSecondary' }
              }
            ]}
          />
        </div>
      ),
      enableSorting: false
    })
  ], [router]);

  const tableInstance = useReactTable({
    data: productTypes,
    columns,
    filterFns: {
      fuzzy: (row, columnId, value, addMeta) => {
        const itemRank = rankItem(row.getValue(columnId), value);
        addMeta({ itemRank });
        return itemRank.passed;
      },
    },
    state: {
      globalFilter,
    },
    globalFilterFn: 'fuzzy',
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader title="Types de produits" />
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4">
        <CustomTextField
          select
          value={tableInstance.getState().pagination.pageSize}
          onChange={e => tableInstance.setPageSize(Number(e.target.value))}
          className="is-[70px]"
        >
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="25">25</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </CustomTextField>
        <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder="Rechercher un type"
            className="is-full sm:is-auto"
          />
          <Button
            variant="contained"
            startIcon={<i className="tabler-plus" />}
            onClick={() => setAddProductTypeOpen(true)}
            className="is-full sm:is-auto"
          >
            Ajouter nouveau type de produit
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={tableStyles.table}>
          <thead>
            {tableInstance.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} style={{ minWidth: '200px' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableInstance.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>No product types available</td>
              </tr>
            ) : (
              tableInstance.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={{ minWidth: '200px' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        component="div"
        count={tableInstance.getRowModel().rows.length}
        onPageChange={(event, newPage) => tableInstance.setPageIndex(newPage)}
        onRowsPerPageChange={event => tableInstance.setPageSize(Number(event.target.value))}
        page={tableInstance.getState().pagination.pageIndex}
        rowsPerPage={tableInstance.getState().pagination.pageSize}
      />
    </Card>
  );
});

export default ProductTypeListTable;
