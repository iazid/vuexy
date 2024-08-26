'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Card, CardContent, Typography, Divider, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { collection, getDocs, getDoc } from 'firebase/firestore';
import { adb } from '../../../../app/firebase/firebaseconfigdb';

const OrdersTab = React.memo(() => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const uid = useMemo(() => searchParams.get('uid'), [searchParams]);

  const fetchOrders = useCallback(async () => {
    try {
      const ordersRef = collection(adb, 'orders');
      const querySnapshot = await getDocs(ordersRef);

      const userCache = {}; // Cache for user data to minimize repeated calls
      const eventCache = {}; // Cache for event data to minimize repeated calls

      const ordersData = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const order = doc.data();

          const ownerRefPath = order.ownerRef.path;
          const orderUid = ownerRefPath.split('/')[1];

          if (orderUid === uid) {
            let userData;
            if (userCache[orderUid]) {
              userData = userCache[orderUid];
            } else {
              const userSnap = await getDoc(order.ownerRef);
              userData = userSnap.exists() ? userSnap.data() : { name: "Inconnu", surname: "" };
              userCache[orderUid] = userData;
            }

            let eventName;
            if (eventCache[order.eventRef.id]) {
              eventName = eventCache[order.eventRef.id];
            } else {
              const eventSnap = await getDoc(order.eventRef);
              eventName = eventSnap.exists() ? eventSnap.data().name : "Événement inconnu";
              eventCache[order.eventRef.id] = eventName;
            }

            return {
              id: doc.id,
              ownerName: `${userData.name} ${userData.surname}`,
              eventName: eventName,
              total: order.total,
              alreadyPaid: order.alreadyPaid,
              isPaid: order.paid,
              status: order.status,
              created: order.created.toDate(),
            };
          } else {
            return null;
          }
        })
      );

      const filteredOrders = ordersData.filter(order => order !== null);
      setOrders(filteredOrders);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
        <Typography variant="h5">Commandes</Typography> 
          <Divider className="mlb-4" />
          {orders.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Événement</TableCell>
                    <TableCell>Montant Total</TableCell>
                    <TableCell>Déjà Payé</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Payé</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order, index) => (
                    <TableRow key={index}>
                      <TableCell>{order.eventName}</TableCell>
                      <TableCell>{order.total}€</TableCell>
                      <TableCell>{order.alreadyPaid}€</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{new Date(order.created).toLocaleDateString()}</TableCell>
                      <TableCell>{order.isPaid ? "Oui" : "Non"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1">Aucune commande trouvée pour cet utilisateur.</Typography>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default OrdersTab;
