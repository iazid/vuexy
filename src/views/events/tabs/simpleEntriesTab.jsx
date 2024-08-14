'use client'

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TableFooter } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation'; // Importation du hook useRouter de next/navigation
import FirebaseService from '../../../app/firebase/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import { adb } from '../../../app/firebase/firebaseconfigdb';

const SimpleEntriesTab = ({ eventId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0); 
  const router = useRouter(); // Initialisation du hook useRouter de next/navigation

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

            // Accumule les montants de chaque entrée simple
            totalAmountAccumulated += entry.amount || 0;

            // Pour chaque entrée simple, inclure les totaux de leurs réservations associées
            if (entry.ordersRef && entry.ordersRef.length > 0) {
              const paymentDetails = await Promise.all(
                entry.ordersRef.map(async (orderRef) => {
                  const orderSnap = await getDoc(orderRef);
                  const orderData = orderSnap.exists() ? orderSnap.data() : { total: 0 };
                  return orderData.total || 0;
                })
              );
              totalAmountAccumulated += paymentDetails.reduce((sum, current) => sum + current, 0);
            }

            return {
              ...entry,
              clientName: `${userData.name} ${userData.surname}`,
              ownerUid: entry.ownerRef.id, // Stockez l'UID du propriétaire pour la redirection
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

  const handleProfileClick = (name, surname, uid) => {
    // Convertir le nom et prénom en slug
    const slug = `${name}-${surname}`;
    // Redirige vers la page de profil avec le slug et l'UID
    router.push(`/profile/${slug}?uid=${uid}`);
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
                    <IconButton 
                      color="default" 
                      onClick={() => handleProfileClick(entry.clientName.split(" ")[0], entry.clientName.split(" ")[1], entry.ownerUid)}
                    >
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
