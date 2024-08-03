// EventModel.js


class EventModel {
    constructor({
        name = 'No Name Provided',
        description = 'No Description Provided',
        date = new Date(2024, 0, 1, 0, 0, 0),
        address = 'No Address Provided',
        imageUri = '/path/to/default/image.jpg',
        dressed_up = false,
        place_description = 'No Place Description Provided',
        regular_price = 0,
        simpCount = 0,
        simpEntry = 0,
        visible = true,
        place = null 
    } = {}) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.time = date;
        this.address = address;
        this.imageUri = imageUri;
        this.dressed_up = dressed_up;
        this.place_description = place_description;
        this.regular_price = regular_price;
        this.simpCount = simpCount;
        this.simpEntry = simpEntry;
        this.visible = visible;
        this.place = place;
    }

    toPlainObject() {
        return {
            name: this.name,
            description: this.description,
            date: this.date,
            time: this.date,
            address: this.address,
            imageUri: this.imageUri,
            dressed_up: this.dressed_up,
            place_description: this.place_description,
            regular_price: this.regular_price,
            simpCount: this.simpCount,
            simpEntry: this.simpEntry,
            visible: this.visible,
            place: this.place
        };
    }
}

export default EventModel;
