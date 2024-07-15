
'use client'

import React from 'react';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import parseEvent from '../utils/eventParse'; 

const EventCard = (props) => {
    const event = parseEvent(props);

    return (
        <Card>
            <CardHeader
                title={event.name}
                subheader={event.date.toLocaleDateString()}
            />
            {event.imageUri && (
                <CardMedia
                    component="img"
                    height="194"
                    image={event.imageUri}
                    alt={event.name}
                    style={{
                        height: '194px',
                        width: '194px',  
                        borderRadius: '50%',
                        objectFit: 'cover',
                        display: 'block', 
                        marginLeft: 'auto',  
                        marginRight: 'auto'
                      }}
                />
            )}
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {event.address}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default EventCard;
