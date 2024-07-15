// EventFactory.js
import EventModel from './EventModel';

const EventFactory = (doc) => {
    if (!doc || !doc.exists) {
        throw new Error("No document provided for parsing.");
    }

    const data = doc.data();

    return new EventModel({
        name: data.name,
        description: data.description,
        date: data.date,
        address: data.address,
        imageUri: data.imageUri,
        dressed_up: !!data.dressed_up,
        place_description: data.place_description,
        regular_price: data.regular_price,
        simpCount: data.simpCount,
        simpEntry: data.simpEntry,
        visible: !!data.visible
    });
};

export default EventFactory;
