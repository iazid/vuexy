'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Typography, Chip, Divider, Avatar, Button, Dialog, DialogContent } from '@mui/material';
import { 
  fetchUserDetails, 
  selectUser, 
  selectProfilePictureUrl, 
  selectDocumentStatus, 
  selectDocumentUrl, 
  getUserDetailsStatus, 
  getUserDetailsError,
  fetchDocumentDetails,
} from '../../../redux-store/slices/userDetailsSlice';

const UserDetails = React.memo(() => {
  const searchParams = useSearchParams(); 
  const dispatch = useDispatch();
  const uid = useMemo(() => searchParams.get('uid'), [searchParams]);

  const userData = useSelector(selectUser);
  const profilePictureUrl = useSelector(selectProfilePictureUrl);
  const documentStatus = useSelector(selectDocumentStatus);
  const documentUrl = useSelector(selectDocumentUrl);
  const status = useSelector(getUserDetailsStatus);
  const error = useSelector(getUserDetailsError);

  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (uid) {
      dispatch(fetchUserDetails(uid));
      dispatch(fetchDocumentDetails(uid));
    }
  }, [uid, dispatch]);

  const handleOpenImage = () => {
    setIsImageOpen(true);
  };

  const handleCloseImage = () => {
    setIsImageOpen(false);
  };

  if (status === 'failed') {
    return <Typography variant="h6">Erreur : {error}</Typography>;
  }

  if (!userData) {
    return <Typography variant="h6">Aucune donnée utilisateur trouvée.</Typography>;
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
          <Typography variant="h5">ID du profil</Typography>
          <Divider className="mlb-4" />
          <Typography className="font-medium" color="text.primary">UID : {uid}</Typography>
        </div>

        <div>
          <Typography variant="h5">Identité</Typography>
          <Divider className="mlb-4" />
          <div className="flex flex-col gap-2">
            <Typography className="font-medium" color="text.primary">Nom : {`${userData.name} ${userData.surname}`}</Typography>
            <Typography className="font-medium" color="text.primary">Date de naissance : {userData.dateOfBirth ? userData.dateOfBirth.toLocaleDateString() : "Non disponible"}</Typography>
            <Typography className="font-medium" color="text.primary">Genre : {userData.gender || "Non spécifié"}</Typography>
            <Typography className="font-medium" color="text.primary">
              Vérification d'identité : {documentStatus || "Non disponible"}
              {documentStatus === 'Accepté' && documentUrl && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleOpenImage} 
                  sx={{ marginLeft: '10px' }}
                >
                  Voir
                </Button>
              )}
            </Typography>
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

      <Dialog open={isImageOpen} onClose={handleCloseImage}>
        <DialogContent>
          {documentUrl && (
            <img 
              src={documentUrl} 
              alt="Document d'identité" 
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
});

export default UserDetails;
