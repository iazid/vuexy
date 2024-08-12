import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TableFooter } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FirebaseService from '../../../app/firebase/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { adb } from '../../../app/firebase/firebaseconfigdb';

const SimpleEntriesTab = ({ eventId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0); 

  useEffect(() => {
    if (eventId) {
      const eventRef = doc(adb, 'events', eventId);

      const unsubscribe = FirebaseService.streamSimpleEntries(eventRef, async (snapshot) => {
        let totalAmountAccumulated = 0; 
        const entriesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const entry = doc.data();
            const userSnap = await getDoc(entry.ownerRef);
            const userData = userSnap.exists() ? userSnap.data() : { name: "Inconnu", surname: "" };
            
            totalAmountAccumulated += entry.amount || 0; 

            return {
              ...entry,
              clientName: `${userData.name} ${userData.surname}`,
            };
          })
        );
        setEntries(entriesData);
        setTotalAmount(totalAmountAccumulated); 
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [eventId]);

  const getStatusLabel = (status) => {
    const statusMap = {
      0: 'En attente',
      1: 'Acceptée',
      2: 'Refusée',
      3: 'Annulée',
      4: 'À faire',
    };
    return statusMap[status] || 'Inconnu';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        <br />

        Entrées simples
      </Typography>
      <br />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date de la demande</TableCell>
              <TableCell>Profil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.clientName}</TableCell>
                  <TableCell>{getStatusLabel(entry.status)}</TableCell>
                  <TableCell>{new Date(entry.created.seconds * 1000).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton color="default">
                      <ArrowForwardIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body1">Aucune entrée simple trouvée.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography variant="h6">Total : {totalAmount}€</Typography>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SimpleEntriesTab;
