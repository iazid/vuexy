'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, CardContent, Typography, Divider, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { collection, getDocs, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { adb } from '../../../../app/firebase/firebaseconfigdb';
import Reservation, { RES_STATUS } from '../../../../utils/Reservation';
import { slugify } from '../../../../utils/slugify'; // Ensure this is imported

const BookingTab = React.memo(() => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Get the UID from the search parameters (or any other way you're passing the UID)
  const searchParams = useSearchParams();
  const uid = useMemo(() => searchParams.get('uid'), [searchParams]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        // Fetch all reservations from the 'reservations' collection
        const reservationsRef = collection(adb, 'reservations');
        const querySnapshot = await getDocs(reservationsRef);

        const reservationsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const reservation = Reservation.fromFirebase(doc);

            // Extract the UID from ownerRef
            const ownerRefPath = reservation.ownerRef.path;
            const reservationUid = ownerRefPath.split('/')[1];

            // Filter reservations by UID
            if (reservationUid === uid) {
              const eventSnap = await getDoc(reservation.eventRef);
              const eventName = eventSnap.exists() ? eventSnap.data().name : "Événement inconnu";
              const eventSlug = eventSnap.exists() ? slugify(eventName) : null; // Slugify the event name

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
                eventName: eventName,
                eventSlug: eventSlug, // Store the slugified event name
                statusLabel: getStatusLabel(reservation.status),
                paymentProgress,
              };
            } else {
              return null;
            }
          })
        );

        // Filter out any null values (where the UID didn't match)
        const filteredReservations = reservationsData.filter(res => res !== null);

        setReservations(filteredReservations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reservations:", error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, [uid]);

  const getStatusLabel = (status) => {
    const statusMap = {
      [RES_STATUS.PENDING]: 'En attente',
      [RES_STATUS.ACCEPTED]: 'Acceptée',
      [RES_STATUS.REFUSED]: 'Refusée',
      [RES_STATUS.CANCELED]: 'Annulée',
      [RES_STATUS.TODO]: 'À faire',
    };
    return statusMap[status] || 'Inconnu';
  };

  const handleNavigateToEvent = (eventSlug) => {
    router.push(`/events/eventpage/${eventSlug}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6"> 
        <div>
          <Typography variant="h5">Réservations</Typography> 
          <Divider className="mlb-4" />
          {reservations.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Événement</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Nombre d'invités</TableCell>
                    <TableCell>Date de la demande</TableCell>
                    <TableCell>Avancement du paiement</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation, index) => (
                    <TableRow key={index}>
                      <TableCell>{reservation.eventName}</TableCell>
                      <TableCell>{reservation.statusLabel}</TableCell>
                      <TableCell>{reservation.guests.length}</TableCell>
                      <TableCell>{new Date(reservation.created).toLocaleDateString()}</TableCell>
                      <TableCell>{reservation.paymentProgress}</TableCell>
                      <TableCell>
                        {reservation.eventSlug && (
                          <IconButton
                            color="primary"
                            onClick={() => handleNavigateToEvent(reservation.eventSlug)}
                          >
                            <ArrowForwardIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1">Aucune réservation trouvée.</Typography>
          )}
        </div>
      </CardContent>
    </Card> 
  );
});

export default BookingTab;
