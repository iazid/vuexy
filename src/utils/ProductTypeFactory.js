import ProductTypeModel from './ProductTypeModel';

const ProductTypeFactory = (doc) => {
    if (!doc || !doc.exists) {
        throw new Error("No document provided for parsing.");
    }

    const data = doc.data();

    return new ProductTypeModel({
        category: data.category,
        description: data.description,
        name: data.name,
        productType: data.productType,
        products: data.products || [],
        visible: !!data.visible
    });
};

export default ProductTypeFactory;
