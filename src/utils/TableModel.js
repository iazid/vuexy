class TableModel {
    constructor({ name, count = 0, price, quantity, size, eventRef, date = new Date(), active = true }) {
      this.name = name;
      this.count = count;
      this.price = price;
      this.quantity = quantity;
      this.size = size;
      this.eventRef = eventRef;
      this.date = date;
      this.active = active;
    }
  
    toPlainObject() {
      return {
        name: this.name,
        count: this.count,
        price: this.price,
        quantity: this.quantity,
        size: this.size,
        eventRef: this.eventRef,
        date: this.date,
        active: this.active,
      };
    }
  }
  
  export default TableModel;
  