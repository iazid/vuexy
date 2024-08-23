import { doc, getDoc } from "firebase/firestore";

const DOCUMENT_STATUS = {
  0: 'En attente',
  1: 'Envoyé',
  2: 'Accepté',
  3: 'Refusé',
};

class DocumentModel {
  constructor({ ref, status, date, documentPath = null }) {
    this.ref = ref;
    this.status = status;
    this.date = date;
    this.documentPath = documentPath;
  }

  static async fromFirebase(docRef) {
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();

      const statusKey = data.status; // Assume status is stored as an integer in Firestore
      const status = DOCUMENT_STATUS[statusKey] || 'Unknown'; // Map the status to its string representation
      const date = data.date ? data.date.toDate() : null;
      const documentPath = data.document || null;

      console.log("Document Data Fetched:", { status, date, documentPath });

      return new DocumentModel({
        ref: docSnap.ref,
        status: status,
        date: date,
        documentPath: documentPath,
      });
    } else {
      console.error("No such document!");
      return null;
    }
  }
}

export default DocumentModel;
