import React, { useMemo } from 'react';
import { Typography, Card, CardHeader, TablePagination } from '@mui/material';

import CustomAvatar from '@core/components/mui/Avatar';
import tableStyles from '@core/styles/table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

const ProductListTable = ({ productData }) => {
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => [
    columnHelper.accessor('pic', {
      header: '',
      cell: info => <CustomAvatar src={info.row.original.pic} alt={info.row.original.name} sx={{ width: 160, height: 160 }} />
    }),
    columnHelper.accessor('name', {
      header: 'Nom',
      cell: info => <Typography variant="body1">{info.row.original.name}</Typography>
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: info => <Typography variant="body2">{info.row.original.description}</Typography>
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: info => <Typography variant="body2">{new Date(info.row.original.date).toLocaleDateString()}</Typography>
    }),
  ], []);

  const tableInstance = useReactTable({
    data: productData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader title="Liste des Produits" />
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
            {tableInstance.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} style={{ minWidth: '200px' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
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

export default ProductListTable;
