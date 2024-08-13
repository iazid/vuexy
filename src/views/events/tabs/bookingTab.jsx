import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DialogsAlert from '../../../components/DialogsAlert'; 
import FirebaseService from '../../../app/firebase/firebaseService';
import Reservation from '../../../utils/Reservation'; 
import { doc, getDoc } from 'firebase/firestore';
import { adb, auth } from '../../../app/firebase/firebaseconfigdb';

const BookingTab = ({ eventId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    const fetchTokenAndLog = async () => {
      const user = auth.currentUser;
  
      if (user) {
        const token = await user.getIdToken();
        console.log("Token on page load:", token);
      } else {
        console.error("User is not authenticated");
      }
    };

    fetchTokenAndLog();

    if (eventId) {
      const eventRef = doc(adb, 'events', eventId);

      const unsubscribe = FirebaseService.streamBookingRequests(eventRef, async (snapshot) => {
        const reservationsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const reservation = Reservation.fromFirebase(doc);
            const userSnap = await getDoc(reservation.ownerRef);
            const userData = userSnap.exists() ? userSnap.data() : { name: "Inconnu", surname: "" };

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
    const statusMap = {
      0: 'En attente',
      1: 'Acceptée',
      2: 'Refusée',
      3: 'Annulée',
      4: 'À faire',
    };
    return statusMap[status] || 'Inconnu';
  };

  const handleOpenDialog = (action, bookingId) => {
    setDialogAction(action);
    setSelectedBookingId(bookingId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleConfirmDialog = async () => {
    if (dialogAction === 'validate') {
      handleValidateBooking(selectedBookingId);
    } else if (dialogAction === 'refuse') {
      handleRefuseBooking(selectedBookingId);
    }
    setOpenDialog(false);
  };

  const handleValidateBooking = async (bookingId) => {
    try {
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
  
      const token = await user.getIdToken();
  
      await FirebaseService.validateBooking({ bookingId, userId: user.uid, token });
  
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.resaRef.id === bookingId ? { ...reservation, status: 1 } : reservation
        )
      );
    } catch (error) {
      console.error("Error validating booking: ", error);
    }
  };

  const handleRefuseBooking = async (bookingId) => {
    try {
      const user = auth.currentUser;
  
      if (!user) {
        console.error("User is not authenticated");
        return;
      }
  
      const token = await user.getIdToken();
  
      await FirebaseService.refuseBooking({ bookingId, userId: user.uid, token });
  
      setReservations((prevReservations) =>
        prevReservations.map((reservation) =>
          reservation.resaRef.id === bookingId ? { ...reservation, status: 2 } : reservation
        )
      );
    } catch (error) {
      console.error("Error refusing booking: ", error);
    }
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
              <TableCell>Actions</TableCell>
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
                  <TableCell>{reservation.paymentProgress}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpenDialog('validate', reservation.resaRef.id)}>
                      <CheckIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleOpenDialog('refuse', reservation.resaRef.id)}>
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
      
      <DialogsAlert
        open={openDialog}
        handleClose={handleCloseDialog}
        handleConfirm={handleConfirmDialog}
        title={dialogAction === 'validate' ? 'Confirmer la validation' : 'Confirmer le refus'}
        description={dialogAction === 'validate' ? 'Voulez-vous vraiment valider cette réservation?' : 'Voulez-vous vraiment refuser cette réservation?'}
      />
    </Box>
  );
};

export default BookingTab;
