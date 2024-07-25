import { doc, setDoc } from 'firebase/firestore';

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

    static async fromFirebase(productTypeDoc) {
        try {
            const productTypeData = productTypeDoc.data();
            return new ProductTypeModel({
                category: productTypeData.category,
                description: productTypeData.description,
                name: productTypeData.name,
                productType: productTypeData.productType,
                products: productTypeData.products || [],
                visible: productTypeData.visible,
            });
        } catch (e) {
            console.error(`Error while creating product type from firebase with ID: ${productTypeDoc.id}`, e);
            throw new Error(e);
        }
    }

    toMap() {
        return {
            category: this.category,
            description: this.description,
            name: this.name,
            productType: this.productType,
            products: this.products.map(ref => ref.id), // Store only the IDs of the products
            visible: this.visible,
        };
    }

    async save() {
        const productTypeRef = doc(collection(adb, 'productTypes'), this.productType);
        await setDoc(productTypeRef, this.toMap());
    }
}

export default ProductTypeModel;
