import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FirebaseService from '../../../app/firebase/firebaseService';
import Reservation from '../../../utils/Reservation'; 
import { doc, getDoc } from 'firebase/firestore';
import { adb } from '../../../app/firebase/firebaseconfigdb';

const BookingTab = ({ eventId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      const eventRef = doc(adb, 'events', eventId);

      const unsubscribe = FirebaseService.streamBookingRequests(eventRef, async (snapshot) => {
        const reservationsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const reservation = Reservation.fromFirebase(doc);
            console.log('Reservation fetched:', reservation); // Log the entire reservation object
            const userSnap = await getDoc(reservation.ownerRef);
            const userData = userSnap.exists() ? userSnap.data() : { name: "Inconnu", surname: "" };

            // Récupération des informations de paiement
            let paymentProgress = '0/0€';
            if (reservation.ordersRef && reservation.ordersRef.length > 0) {
              const paymentDetails = await Promise.all(
                reservation.ordersRef.map(async (orderRef) => {
                  const orderSnap = await getDoc(orderRef);
                  const orderData = orderSnap.exists() ? orderSnap.data() : { alreadyPaid: 0, total: 0 };
                  return `${orderData.alreadyPaid}/${orderData.total}€`;
                })
              );
              paymentProgress = paymentDetails.join(", ");
            }

            return {
              ...reservation,
              ownerName: `${userData.name} ${userData.surname}`,
              paymentProgress,
            };
          })
        );
        setReservations(reservationsData);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [eventId]);

  const getStatusLabel = (status) => {
    console.log("Status number:", status); // Log the status number
    if (status === undefined) {
      console.error("Status is undefined. This could mean the status is not properly fetched or stored.");
    }
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
        <br />
        <br />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Demandes de Réservation
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Nombre d'invités</TableCell>
              <TableCell>Date de la demande</TableCell>
              <TableCell>Avancement du paiement</TableCell>
              <TableCell>Profil</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.length > 0 ? (
              reservations.map((reservation, index) => (
                <TableRow key={index}>
                  <TableCell>{reservation.ownerName}</TableCell>
                  <TableCell>{getStatusLabel(reservation.status)}</TableCell>
                  <TableCell>{reservation.guests.length}</TableCell>
                  <TableCell>{new Date(reservation.created).toLocaleDateString()}</TableCell>
                  <TableCell>{reservation.paymentProgress}</TableCell> {/* Affiche alreadyPaid/total */}
                  <TableCell>
                    <IconButton color="primary">
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="error">
                      <CloseIcon />
                    </IconButton>
                    <IconButton color="default">
                      <SearchIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body1">Aucune demande de réservation en attente.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BookingTab;
