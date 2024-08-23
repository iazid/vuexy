'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, Typography, Chip, IconButton, TablePagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';  
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, selectAllUsers, getUsersStatus, getUsersError } from '../../../redux-store/slices/userSlice';

const UserList = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const usersStatus = useSelector(getUsersStatus);
  const error = useSelector(getUsersError);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const router = useRouter();

  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchUsers());
    }
  }, [usersStatus, dispatch]);

  const handleProfileClick = (name, surname, uid) => {
    const slug = `${name}-${surname}`;
    router.push(`/profile/${slug}?uid=${uid}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Card>
      <CardHeader title="Liste des utilisateurs" />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 6}}>Nom</TableCell>
              <TableCell sx={{ pl: 4 }}>Email</TableCell>
              <TableCell sx={{ pl: 4 }}>Statut</TableCell>
              <TableCell sx={{ pl: 4 }}>Profil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersStatus === 'loading' ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">Chargement des utilisateurs...</Typography>
                </TableCell>
              </TableRow>
            ) : usersStatus === 'failed' ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error">Erreur: {error}</Typography>
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ pl: 6 }}>{`${user.name} ${user.surname}`}</TableCell>
                  <TableCell sx={{ pl: 4 }}>{user.email || 'Non disponible'}</TableCell>
                  <TableCell sx={{ pl: 4 }}>
                    <Chip
                      label={user.isVerified ? 'Vérifié' : 'Non vérifié'}
                      size="small"
                      color={user.isVerified ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell sx={{ pl: 4 }}>
                    <IconButton 
                      color="default" 
                      onClick={() => handleProfileClick(user.name, user.surname, user.id)}
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="body1">Aucun utilisateur trouvé.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Card>
  );
};

export default UserList;
