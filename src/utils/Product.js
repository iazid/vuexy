import { doc, setDoc } from 'firebase/firestore';

class Product {
    constructor({ productRef, productTypeRef, pic, name, date, description, capacities, visible }) {
      this.productRef = productRef; // Reference to the product document
      this.productTypeRef = productTypeRef; // Reference to the product type document
      this.pic = pic; // URL to the product image
      this.name = name; // Product name
      this.date = date; // Date of creation
      this.description = description; // Product description
      this.capacities = capacities; // Array of references to capacity documents
      this.visible = visible; // Visibility status
    }
  
    async save() {
      await setDoc(this.productRef, {
        productTypeRef: this.productTypeRef,
        pic: this.pic,
        name: this.name,
        date: this.date,
        description: this.description,
        capacities: this.capacities,
        visible: this.visible
      });
    }
  
    addCapacity(capacityRef) {
      if (!this.capacities.includes(capacityRef)) {
        this.capacities.push(capacityRef);
      }
    }

    removeCapacity(capacityRef) {
        this.capacities = this.capacities.filter(ref => ref.id !== capacityRef.id);
    }

    updateCapacity(updatedCapacityRef) {
        const index = this.capacities.findIndex(ref => ref.id === updatedCapacityRef.id);
        if (index !== -1) {
            this.capacities[index] = updatedCapacityRef;
        }
    }

    toMap() {
        return {
            productType: this.productType, // Store the reference to the product type
            pic: this.pic,
            name: this.name,
            date: this.date,
            description: this.description,
            capacities: this.capacities.map(ref => ref.id), // Store only the IDs of the capacities
            visible: this.visible,
        };
    }

    async save() {
        await setDoc(this.productRef, this.toMap());
    }
}

export default Product;
