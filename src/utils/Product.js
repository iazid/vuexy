import { doc, setDoc, getDoc } from 'firebase/firestore';
import { adb } from '../app/firebase/firebaseconfigdb';

class Product {
  constructor({ productRef, productType, pic, name, date, description, capacities, visible }) {
    this.productRef = productRef;
    this.productType = productType;
    this.pic = pic;
    this.name = name;
    this.date = date;
    this.description = description;
    this.capacities = capacities || [];
    this.visible = visible;
  }

  static async fromFirebase(productDoc) {
    try {
      const productData = productDoc.data();
      return new Product({
        productRef: productDoc.ref,
        productType: productData.productType,
        pic: productData.pic,
        name: productData.name,
        date: productData.date.toDate(),
        description: productData.description,
        capacities: productData.capacities || [],
        visible: productData.visible,
      });
    } catch (e) {
      console.error(`Error while creating product from firebase with ID: ${productDoc.id}`, e);
      throw new Error(e);
    }
  }

  addCapacity(capacityRef) {
    this.capacities.push(capacityRef);
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
      productType: this.productType,
      pic: this.pic,
      name: this.name,
      date: this.date,
      description: this.description,
      capacities: this.capacities,
      visible: this.visible,
    };
  }

  async save() {
    await setDoc(this.productRef, this.toMap());
  }
}

export default Product;
