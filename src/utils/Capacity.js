import { doc, setDoc } from 'firebase/firestore';

class Capacity {
  constructor({ capacityRef, productTypeRef, productRef, capacity, unity, price, quantity }) {
    this.capacityRef = capacityRef;
    this.productTypeRef = productTypeRef;
    this.productRef = productRef;
    this.capacity = capacity;
    this.unity = unity;
    this.price = price;
    this.quantity = quantity;
  }

  toMap() {
    return {
      capacity: this.capacity,
      unity: this.unity,
      price: this.price,
      quantity: this.quantity,
      product: this.productRef,
      productType: this.productTypeRef,
    };
  }

  async save() {
    await setDoc(this.capacityRef, this.toMap());
  }
}

export default Capacity;
