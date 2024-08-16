'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { Card, CardContent, Typography, Chip, Divider, Avatar } from '@mui/material';
import { adb, storagedb } from '../../../app/firebase/firebaseconfigdb';
import UserData from '../../../utils/UserData';

const UserDetails = ({ setLoading }) => {
  const searchParams = useSearchParams(); 
  const [uid, setUid] = useState(null); 
  const [userData, setUserData] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    const uidFromQuery = searchParams.get('uid');
    if (uidFromQuery) {
      setUid(uidFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uid) {
        console.log('Aucun UID disponible pour l’instant.');
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(adb, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const user = UserData.fromFirebase(userSnap);
          setUserData(user);

          if (user.pic) {
            const picRef = ref(storagedb, user.pic);
            const url = await getDownloadURL(picRef);
            setProfilePictureUrl(url);
          }
        } else {
          console.error("Utilisateur introuvable");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'utilisateur :", error);
      } finally {
        setLoading(false);  // Une fois les données chargées, on arrête le chargement
      }
    };

    fetchUserData();
  }, [uid]);

  if (!userData) {
    return <Typography variant="h6">Les données de l'utilisateur n'ont pas pu être chargées.</Typography>;
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar 
            alt="Photo de profil de l'utilisateur" 
            src={profilePictureUrl || "/default-profile.png"} 
            sx={{ width: 120, height: 120 }}
          />
          <Typography variant="h5">{`${userData.name} ${userData.surname}`}</Typography>
          <Chip label={userData.isVerified ? "Vérifié" : "Non vérifié"} color="secondary" size="small" variant="tonal" />
        </div>
        <div>
          <Typography variant="h5">Identité</Typography>
          <Divider className="mlb-4" />
          <div className="flex flex-col gap-2">
            <Typography className="font-medium" color="text.primary">Nom : {`${userData.name} ${userData.surname}`}</Typography>
            <Typography className="font-medium" color="text.primary">Date de naissance : {userData.dateOfBirth ? userData.dateOfBirth.toLocaleDateString() : "Non disponible"}</Typography>
            <Typography className="font-medium" color="text.primary">Genre : {userData.gender || "Non spécifié"}</Typography>
            <Typography className="font-medium" color="text.primary">Vérification d'identité : {userData.docverified ? "Vérifiée" : "En attente"}</Typography>
          </div>
        </div>
        <div>
          <Typography variant="h5">Coordonnées</Typography>
          <Divider className="mlb-4" />
          <div className="flex flex-col gap-2">
            <Typography className="font-medium" color="text.primary">Adresse email : {userData.mail || "Non disponible"}</Typography>
            <Typography className="font-medium" color="text.primary">Numéro de téléphone : {userData.phoneCode ? `+${userData.phoneCode} ${userData.phoneNumber}` : "Non disponible"}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
