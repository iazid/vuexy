'use client'

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardHeader, Typography, Chip, IconButton, TablePagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';  
import { adb } from '../../../app/firebase/firebaseconfigdb';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(adb, 'users'));
        const userList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleProfileClick = (name, surname, uid) => {
    const slug = `${name}-${surname}`;
    router.push(`/profile/${slug}?uid=${uid}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography variant="h6">Chargement des utilisateurs...</Typography>
      </Box>
    );
  }

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
            {users.length > 0 ? (
              users.map((user, index) => (
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
                <TableCell colSpan={4} sx={{ pl: 4 }}>
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
        rowsPerPage={10}
        page={0}
        onPageChange={() => {}}
        onRowsPerPageChange={() => {}}
      />
    </Card>
  );
};

export default UserList;
