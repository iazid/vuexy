import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

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
    this.capacitiesData = [];
  }

  static async fromFirebase({ product }) {
    try {
      const data = product.data();
      return new Product({
        productRef: product.ref,
        productType: data.productType,
        pic: data.pic,
        name: data.name,
        date: data.date.toDate(),
        description: data.description,
        capacities: data.capacities ? data.capacities.map(ref => doc(ref)) : [],
        visible: data.visible,
      });
    } catch (e) {
      console.error(`Error while creating product from firebase with ID: ${product.id}`, e);
      throw e;
    }
  }

  addCapacity(capacity) {
    this.capacitiesData.push(capacity);
    this.capacities.push(capacity.capacityRef);
  }

  removeCapacity(capacity) {
    this.capacitiesData = this.capacitiesData.filter(cap => cap.capacityRef.id !== capacity.capacityRef.id);
    this.capacities = this.capacities.filter(ref => ref.id !== capacity.capacityRef.id);
  }

  updateCapacity(capacity) {
    const index = this.capacitiesData.findIndex(cap => cap.capacity === capacity.capacity);
    if (index !== -1) {
      this.capacitiesData[index] = capacity;
      this.capacities[index] = capacity.capacityRef;
    }
  }

  toMap() {
    return {
      productType: this.productType,
      pic: this.pic,
      name: this.name,
      date: Timestamp.fromDate(this.date),
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
