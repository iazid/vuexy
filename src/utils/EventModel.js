// EventModel.js

class EventModel {
    constructor({
        name = 'No Name Provided',
        description = 'No Description Provided',
        date = 'not indicated',
        address = 'No Address Provided',
        imageUri = '/path/to/default/image.jpg',
        dressed_up = 'not indicated',
        place_description = 'No Place Description Provided',
        regular_price = 0,
        simpCount = 0,
        simpEntry = 0,
        visible = 'not indicated'
    } = {}) {
        this.name = name;
        this.description = description;
        this.date = date && date.seconds ? new Date(date.seconds * 1000) : 'not indicated';
        this.address = address;
        this.imageUri = imageUri;
        this.dressed_up = dressed_up;
        this.place_description = place_description;
        this.regular_price = regular_price;
        this.simpCount = simpCount;
        this.simpEntry = simpEntry;
        this.visible = visible;
    }
}

export default EventModel;
