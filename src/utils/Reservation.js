import { doc, getFirestore, Timestamp } from 'firebase/firestore';

// Enum pour les statuts de réservation
export const RES_STATUS = {
  PENDING: 0,
  ACCEPTED: 1,
  REFUSED: 2,
  CANCELED: 3,
  TODO: 4
};

class Reservation {
  constructor({
    eventRef,
    ownerRef,
    resaRef,
    created,
    guests,
    guestsStatus,
    status,
    tableRef = null,
    ordersRef = null,
  }) {
    this.eventRef = eventRef;
    this.ownerRef = ownerRef;
    this.resaRef = resaRef;
    this.created = created;
    this.guests = guests || [];
    this.guestsStatus = guestsStatus || [];
    this.status = status;
    this.tableRef = tableRef;
    this.ordersRef = ordersRef || [];
  }

  // Factory method to create a Reservation object from a Firestore document
  static fromFirebase(resaDoc) {
    const data = resaDoc.data();
    console.log('Data from Firestore:', data); // Log the data object
    return new Reservation({
      resaRef: resaDoc.ref,
      eventRef: data.eventRef,
      ownerRef: data.ownerRef,
      created: data.created.toDate(),
      status: data.status, // Ensure this is correct
      tableRef: data.tableRef || null,
      ordersRef: data.ordersRef ? data.ordersRef.map(ref => ref) : [],
      guests: data.guests ? data.guests.map(ref => ref) : [],
      guestsStatus: data.guestStatus ? data.guestStatus.map(status => status) : [],
    });
  }
  

  // Method to convert the Reservation object to a JSON object for Firestore
  toJson() {
    return {
      eventRef: this.eventRef.id,
      ownerRef: this.ownerRef.id,
      tableRef: this.tableRef ? this.tableRef.id : null,
      created: this.created.toISOString(),
      status: this.status,
      guests: this.guests.map(ref => ref.id),
      guestsStatus: this.guestsStatus,
      ordersRef: this.ordersRef.map(ref => ref.id),
    };
  }
}

export default Reservation;
