'use client'

import React, { useMemo } from 'react';
import { Typography, Card, CardHeader, TablePagination } from '@mui/material';

import tableStyles from '@core/styles/table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const ProductTypeListTable = ({ productTypes }) => {
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Nom',
      cell: info => <Typography variant="body1">{info.row.original.name}</Typography>
    }),
    columnHelper.accessor('description', {
      header:'',
      cell: info => <Typography variant="body2">{info.row.original.description}</Typography>
    }),
    columnHelper.accessor('productCount', {
      header: 'Nombre de Produits',
      cell: info => <Typography variant="body2">{info.row.original.productCount}</Typography>
    }),
  ], []);

  const tableInstance = useReactTable({
    data: productTypes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader title="Liste des Types de Produits" />
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
        <TablePagination
          component="div"
          count={tableInstance.getRowModel().rows.length}
          onPageChange={(event, newPage) => tableInstance.setPageIndex(newPage)}
          onRowsPerPageChange={event => tableInstance.setPageSize(Number(event.target.value))}
          page={tableInstance.getState().pagination.pageIndex}
          rowsPerPage={tableInstance.getState().pagination.pageSize}
        />
      </div>
    </Card>
  );
};

export default ProductTypeListTable;
