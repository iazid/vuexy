// EventFactory.js
import EventModel from './EventModel';
import { GeoPoint } from 'firebase/firestore';

const EventFactory = (doc) => {
    if (!doc || !doc.exists) {
        throw new Error("No document provided for parsing.");
    }

    const data = doc.data();

    return new EventModel({
        name: data.name || 'No Name Provided',
        description: data.description || 'No Description Provided',
        date: data.date ? new Date(data.date.seconds * 1000) : new Date('2024-01-01T00:01:00'),
        time : data.date ? new Date(data.date.seconds * 1000) : new Date('2024-01-01T00:01:00'),
        address: data.address || 'No Address Provided',
        imageUri: data.imageUri || '/path/to/default/image.jpg',
        dressed_up: data.dressed_up ?? false,
        place_description: data.place_description || 'No Place Description Provided',
        regular_price: data.regular_price ?? 0,
        simpCount: data.simpCount ?? 0,
        simpEntry: data.simpEntry ?? 0,
        visible: data.visible ?? true,
        place: data.place ? new GeoPoint(data.place.latitude, data.place.longitude) : null 
    });
};

export default EventFactory;
