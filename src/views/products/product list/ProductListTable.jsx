import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Card, CardHeader, Button, MenuItem } from '@mui/material';
import CustomAvatar from '@core/components/mui/Avatar';
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
import { rankItem } from '@tanstack/match-sorter-utils'
import CustomTextField from '@core/components/mui/TextField';
import TablePagination from '@mui/material/TablePagination';
import TablePaginationComponent from '@components/TablePaginationComponent';

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

const ProductListTable = React.memo (({ productData, setAddProductOpen }) => {
  const columnHelper = createColumnHelper();
  const [globalFilter, setGlobalFilter] = useState('');

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
    columnHelper.accessor('numberOfCapacities', {
      header: 'Nombre de Capacités',
      cell: info => <Typography variant="body2">{info.row.original.numberOfCapacities}</Typography>
    }),
  ], []);

  const tableInstance = useReactTable({
    data: productData,
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
      <CardHeader title="liste des produits" />
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
            placeholder="Rechercher un produit"
            className="is-full sm:is-auto"
          />
          
          <Button
            variant="contained"
            startIcon={<i className="tabler-plus" />}
            onClick={() => setAddProductOpen(true)}
            className="is-full sm:is-auto"
          >
            Ajouter un nouveau produit
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
      </div>
      <TablePagination
        component="div"
        count={tableInstance.getFilteredRowModel().rows.length}
        onPageChange={(event, newPage) => tableInstance.setPageIndex(newPage)}
        onRowsPerPageChange={event => tableInstance.setPageSize(Number(event.target.value))}
        page={tableInstance.getState().pagination.pageIndex}
        rowsPerPage={tableInstance.getState().pagination.pageSize}
      />
    </Card>
  );
});

export default ProductListTable;
