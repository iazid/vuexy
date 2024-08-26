'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Typography, Chip, Divider, Avatar, Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
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
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (uid) {
      dispatch(fetchUserDetails(uid));
      dispatch(fetchDocumentDetails(uid));
    }
  }, [uid, dispatch]);

  const handleOpenImage = () => {
    if (documentUrl) {
      setIsImageOpen(true);
    } else {
      setErrorMessage("Erreur : aucun document n'a été transmis");
    }
  };

  const handleCloseImage = () => {
    setIsImageOpen(false);
    setErrorMessage('');
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
          <Chip label={userData.isVerified ? "Vérifié" : "non vérifié"} color="secondary" size="small" variant="tonal" />
        </div>

        <div>
          <Typography variant="h5">Identité</Typography>
          <Divider className="mlb-4" />
          <div className="flex flex-col gap-2">
            <Typography className="font-medium" color="text.primary">Nom : {`${userData.name} ${userData.surname}`}</Typography>
            <Typography className="font-medium" color="text.primary">Date de naissance : {userData.dateOfBirth ? userData.dateOfBirth.toLocaleDateString() : "non disponible"}</Typography>
            <Typography className="font-medium" color="text.primary">Genre : {userData.gender || "non spécifié"}</Typography>
            <Typography className="font-medium" color="text.primary">
              Vérification d'identité : {documentStatus || "non disponible"}
              {documentStatus === 'Accepté' && (
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
            <Typography className="font-medium" color="text.primary">Adresse email : {userData.mail || "non disponible"}</Typography>
            <Typography className="font-medium" color="text.primary">
              Numéro de téléphone : 
              {userData.phoneCode && userData.phoneNumber ? 
                `+${userData.phoneCode} ${userData.phoneNumber}` : 
                " non indiqué"}
            </Typography>
          </div>
        </div>
      </CardContent>

      <Dialog open={isImageOpen} onClose={handleCloseImage}>
        <DialogContent>
          {documentUrl ? (
            <img 
              src={documentUrl} 
              alt="Document d'identité" 
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }} 
            />
          ) : (
            <Typography variant="body1">Erreur : aucun document n'a été transmis</Typography>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(errorMessage)} onClose={handleCloseImage}>
        <DialogTitle>Erreur</DialogTitle>
        <DialogContent>
          <Typography>{errorMessage}</Typography>
        </DialogContent>
      </Dialog>
    </Card>
  );
});

export default UserDetails;
