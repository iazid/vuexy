'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, TableFooter, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import Order from '../../../utils/OrderModel';
import firebaseService from '../../../app/firebase/firebaseService';

const OrdersTab = ({ eventId }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalAmount, setTotalAmount] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [productDetails, setProductDetails] = useState({});
    const [capacityDetails, setCapacityDetails] = useState({});

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersRef = collection(adb, 'orders');
                const querySnapshot = await getDocs(ordersRef);

                const userCache = {};
                const tableCache = {};
                let totalAmountAccumulated = 0;

                const ordersData = await Promise.all(
                    querySnapshot.docs.map(async (doc) => {
                        const orderData = doc.data();

                        if (orderData.eventRef && orderData.eventRef.id === eventId) {
                            
                            let userData;
                            const orderUid = orderData.ownerRef.id;
                            if (userCache[orderUid]) {
                                userData = userCache[orderUid];
                            } else {
                                const userSnap = await getDoc(orderData.ownerRef);
                                userData = userSnap.exists() ? userSnap.data() : { name: "Inconnu", surname: "" };
                                userCache[orderUid] = userData;
                            }

                            const ownerName = `${userData.name} ${userData.surname}`;

                            
                            let tableName = "Non spécifié";
                            const reservationSnapshot = await getDocs(collection(adb, 'reservations'));
                            const reservation = reservationSnapshot.docs.find(resDoc => resDoc.data().ordersRef.some(ref => ref.id === doc.id));
                            if (reservation) {
                                const tableRef = reservation.data().tableRef;
                                if (tableCache[tableRef.id]) {
                                    tableName = tableCache[tableRef.id];
                                } else {
                                    const tableSnap = await getDoc(tableRef);
                                    tableName = tableSnap.exists() ? tableSnap.data().name : "Non spécifié";
                                    tableCache[tableRef.id] = tableName;
                                }
                            }

                            totalAmountAccumulated += orderData.total || 0;

                            return new Order({
                                id: doc.id,
                                ownerRef: orderData.ownerRef.id,
                                ownerName: ownerName,
                                eventRef: orderData.eventRef.id,
                                productMap: orderData.productMap,
                                contributionRefs: orderData.contributionRefs,
                                type: orderData.type,
                                status: orderData.status,
                                total: orderData.total,
                                alreadyPaid: orderData.alreadyPaid,
                                created: orderData.created.toDate(),
                                paid: orderData.paid,
                                tableName: tableName,
                            });
                        } else {
                            return null;
                        }
                    })
                );

                setOrders(ordersData.filter(order => order !== null));
                setTotalAmount(totalAmountAccumulated);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        if (eventId) {
            fetchOrders();
        }
    }, [eventId]);

    const fetchProductDetails = async (productId) => {
        if (!productDetails[productId]) {
            try {
                const productDoc = await getDoc(doc(adb, 'products', productId));
                if (productDoc.exists()) {
                    const productData = productDoc.data();

                    
                    let imageUrl;
                    try {
                        const imageRef = ref(storagedb, productData.pic);
                        imageUrl = await getDownloadURL(imageRef);
                    } catch (error) {
                        imageUrl = '/path/to/default/image.jpg'; 
                    }

                    setProductDetails(prevState => ({
                        ...prevState,
                        [productId]: {
                            name: productData.name,
                            picUrl: imageUrl
                        },
                    }));
                } else {
                    setProductDetails(prevState => ({
                        ...prevState,
                        [productId]: {
                            name: 'Produit non trouvé',
                            picUrl: '/path/to/default/image.jpg',
                        },
                    }));
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération des détails du produit avec ID ${productId}:`, error);
                setProductDetails(prevState => ({
                    ...prevState,
                    [productId]: {
                        name: 'Erreur de récupération',
                        picUrl: '/path/to/default/image.jpg',
                    },
                }));
            }
        }
    };

    const fetchCapacityDetails = async (capacityRef) => {
        if (capacityRef && !capacityDetails[capacityRef.id]) {
            try {
                const capacityDoc = await getDoc(capacityRef);
                if (capacityDoc.exists()) {
                    const capacityData = capacityDoc.data();

                    setCapacityDetails(prevState => ({
                        ...prevState,
                        [capacityRef.id]: {
                            capacity: capacityData.capacity,
                            unity: capacityData.unity,
                            price: capacityData.price, 
                        },
                    }));
                } else {
                    setCapacityDetails(prevState => ({
                        ...prevState,
                        [capacityRef.id]: {
                            capacity: 'Capacité non trouvée',
                            unity: '',
                            price: 0,
                        },
                    }));
                }
            } catch (error) {
                console.error(`Erreur lors de la récupération des détails de la capacité avec ID ${capacityRef.id}:`, error);
                setCapacityDetails(prevState => ({
                    ...prevState,
                    [capacityRef.id]: {
                        capacity: 'Erreur de récupération',
                        unity: '',
                        price: 0, 
                    },
                }));
            }
        }
    };

    const handleOpenDetails = (order) => {
        setSelectedOrder(order);
        order.productMap.forEach(product => {
            if (product && product.product && product.capacity) {
                fetchProductDetails(product.product.id);
                fetchCapacityDetails(product.capacity);
            }
        });
    };

    const handleCloseDetails = () => {
        setSelectedOrder(null);
    };

    const handleRefuseOrder = async () => {
        try {
            if (selectedOrder) {
                await firebaseService.refuseOrder({
                    orderId: selectedOrder.id,
                    userId: selectedOrder.ownerRef, 
                    token: userToken, 
                });
                alert('Order refused successfully.');
                handleCloseDetails(); 
            }
        } catch (error) {
            alert('Failed to refuse the order. Please try again.');
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
            
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Client</TableCell>
                            <TableCell>Nom de table</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date de la demande</TableCell>
                            <TableCell>Avancement du paiement</TableCell>
                            <TableCell>Détails</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.length > 0 ? (
                            orders.map((order, index) => (
                                <TableRow key={index}>
                                    <TableCell>{order.ownerName}</TableCell>
                                    <TableCell>{order.tableName}</TableCell>
                                    <TableCell>{order.getStatusLabel()}</TableCell>
                                    <TableCell>{new Date(order.created).toLocaleDateString()}</TableCell>
                                    <TableCell>{`${order.alreadyPaid}/${order.total}€`}</TableCell>
                                    <TableCell>
                                        <IconButton onClick={() => handleOpenDetails(order)}>
                                            <SearchIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <Typography variant="body1">Aucune commande trouvée.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={6} align="right">
                                <Typography variant="h6">Total : {totalAmount}€</Typography>
                            </TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            
            <Dialog open={Boolean(selectedOrder)} onClose={handleCloseDetails} maxWidth="md" fullWidth>
                <DialogTitle>Détails de la commande</DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <>
                            <Typography variant="h6" sx={{ mb: 2 }}>Commande</Typography>
                            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                {selectedOrder.productMap
                                    .filter(product => product && product.product && product.capacity) 
                                    .map((product, idx) => {
                                        const capacityDetail = capacityDetails[product.capacity.id];
                                        const totalPrice = (capacityDetail?.price || 0) * product.quantity;

                                        return (
                                            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Avatar 
                                                        src={productDetails[product.product.id]?.picUrl || '/path/to/default/image.jpg'} 
                                                        alt={productDetails[product.product.id]?.name || 'Image du produit'} 
                                                        sx={{ marginRight: 2 }}
                                                    />
                                                    <Box>
                                                        <Typography variant="body1">
                                                            <strong>{productDetails[product.product.id]?.name || 'Chargement...'}</strong>
                                                        </Typography>
                                                        <Typography variant="body2">
                                                            {capacityDetail?.capacity} {capacityDetail?.unity} x {product.quantity}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Typography variant="body1" sx={{ marginLeft: 'auto' }}>
                                                    {totalPrice}€
                                                </Typography>
                                            </li>
                                        );
                                    })}
                            </ul>
                            <Typography variant="h6" sx={{ textAlign: 'right', mt: 2 }}>
                                Total : {selectedOrder.total}€
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Fermer</Button>
                    <Button onClick={handleRefuseOrder} color="secondary">Annuler la commande</Button> 
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrdersTab;
