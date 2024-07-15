class ProductTypeModel {
    constructor({
        category = 0,
        description = '',
        name = 'No Name Provided',
        productType = 0,
        products = [],
        visible = false
    } = {}) {
        this.category = category;
        this.description = description;
        this.name = name;
        this.productType = productType;
        this.products = products;
        this.visible = visible;
    }
}

export default ProductTypeModel;
