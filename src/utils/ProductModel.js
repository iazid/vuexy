class ProductModel {
    constructor({
        capacities = [],
        date = 'not indicated',
        description = 'No Description Provided',
        name = 'No Name Provided',
        pic = '/path/to/default/image.jpg',
        productType = 'No Product Type Provided',
        visible = false
    } = {}) {
        this.capacities = capacities;
        this.date = date && date.seconds ? new Date(date.seconds * 1000) : 'not indicated';
        this.description = description;
        this.name = name;
        this.pic = pic;
        this.productType = productType;
        this.visible = visible;
    }
}

export default ProductModel;
