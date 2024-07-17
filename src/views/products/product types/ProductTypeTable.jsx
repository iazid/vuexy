'use client'

// Importations React
import { Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ProductTypeListTable = ({ productTypes }) => {
  return (
    <Card>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            </TableRow>
          </TableHead>
          <TableBody>
            {productTypes.length === 0 ? (
              <TableRow>
                <TableCell>No product types available</TableCell>
              </TableRow>
            ) : (
              productTypes.map((productType) => (
                <TableRow key={productType.id}>
                  <TableCell>{productType.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default ProductTypeListTable;
