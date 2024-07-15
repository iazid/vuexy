import ProductModel from './ProductModel';

const ProductFactory = (doc) => {
    if (!doc || !doc.exists) {
        throw new Error("No document provided for parsing.");
    }

    const data = doc.data();

    return new ProductModel({
        capacities: data.capacities || [],
        date: data.date,
        description: data.description,
        name: data.name,
        pic: data.pic,
        productType: data.productType,
        visible: !!data.visible
    });
};

export default ProductFactory;
