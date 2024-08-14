'use client'

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Avatar, Card, CardContent } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { auth, adb } from '../../../app/firebase/firebaseconfigdb';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      console.log("Current user UID:", user.uid); // Affiche l'UID de l'utilisateur courant

      try {
        const userRef = doc(adb, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.error("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6">User data could not be loaded.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              alt="User Profile Picture" 
              src={userData.profilePictureUrl || "/default-profile.png"} 
              sx={{ width: 120, height: 120 }}
            />
            <Typography variant="h5" sx={{ marginTop: 2 }}>
              {userData.name || "Nom inconnu"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {userData.email || "Email non disponible"}
            </Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Identité</Typography>
            <Typography variant="body1"><strong>Date de naissance:</strong> {userData.dateOfBirth || "Non disponible"}</Typography>
            <Typography variant="body1"><strong>Genre:</strong> {userData.gender || "Non spécifié"}</Typography>
            <Typography variant="body1"><strong>Profil:</strong> {userData.profileStatus || "Non spécifié"}</Typography>
            <Typography variant="body1"><strong>Pièce d'identité:</strong> {userData.identityStatus || "Non spécifié"}</Typography>
          </Box>
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>Coordonnées</Typography>
            <Typography variant="body1"><strong>Adresse email:</strong> {userData.email || "Non disponible"}</Typography>
            <Typography variant="body1"><strong>Numéro de téléphone:</strong> {userData.phoneNumber || "Non disponible"}</Typography>
            <Typography variant="body1"><strong>Genre:</strong> {userData.gender || "Non spécifié"}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
