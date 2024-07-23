import axios from 'axios';
import { auth, adb, storagedb } from './firebaseconfigdb';
import { collection, addDoc, doc, setDoc, getDocs, query, where, orderBy, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const baseUri = "https://us-central1-no-matter-ba487.cloudfunctions.net";

class FirebaseService {
  static async addProductType(selectedCategory, productType, name, description) {
    try {
      await addDoc(collection(adb, 'productTypes'), {
        name,
        description,
        category: selectedCategory,
        productType,
        products: [],
        visible: true
      });
    } catch (error) {
      console.error("Error adding product type: ", error);
    }
  }

  static async addEvent(docRef, data) {
    try {
      await setDoc(doc(docRef), data);
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  }

  static async updateCommand({ order, status, token }) {
    const url = `${baseUri}/updateCommand`;
    try {
      const response = await axios.post(url, {
        data: {
          orderId: order.orderRef.id,
          status: status
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating command: ", error);
      throw error;
    }
  }

  static async validateProfile({ profileId, token }) {
    const url = `${baseUri}/validateProfile`;
    try {
      const response = await axios.post(url, {
        documentId: profileId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error validating profile: ", error);
      throw error;
    }
  }

  static async refuseProfile({ profileId, token }) {
    const url = `${baseUri}/refuseProfile`;
    try {
      const response = await axios.post(url, {
        documentId: profileId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error refusing profile: ", error);
      throw error;
    }
  }

  static async validateBooking({ bookingId, userId, token }) {
    const url = `${baseUri}/validateBooking`;
    try {
      const response = await axios.post(url, {
        bookingId,
        userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error validating booking: ", error);
      throw error;
    }
  }

  static async validateOrder({ orderId, userId, token }) {
    const url = `${baseUri}/validateOrder`;
    try {
      const response = await axios.post(url, {
        orderId,
        userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error validating order: ", error);
      throw error;
    }
  }

  static async refuseBooking({ bookingId, userId, token }) {
    const url = `${baseUri}/refuseBooking`;
    try {
      const response = await axios.post(url, {
        bookingId,
        userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error refusing booking: ", error);
      throw error;
    }
  }

  static getIdentity(user) {
    const userDoc = doc(adb, 'documents', user.userRef.id);
    return userDoc.onSnapshot((snapshot) => {
      return snapshot.exists ? snapshot.data() : null;
    });
  }

  static streamUsers() {
    const userQuery = collection(adb, 'users');
    return userQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static streamProductTypes() {
    const productTypesQuery = query(collection(adb, 'productTypes'), where('visible', '==', true));
    return productTypesQuery.onSnapshot(snapshot => {
      return snapshot.docs
        .filter(doc => doc.id !== 'RxinDmMcZxegKr6E9QSu')
        .map(doc => doc.data());
    });
  }

  static streamCapacities(productsRef) {
    const capacitiesQuery = query(collection(adb, 'capacities'), where('product', '==', productsRef));
    return capacitiesQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static async getProductCapacitiesAndType(map) {
    try {
      const [productSnapshot, productTypeSnapshot, capacitySnapshot] = await Promise.all([
        getDoc(map.product),
        getDoc(map.productType),
        getDoc(map.capacity)
      ]);

      return {
        product: productSnapshot.data(),
        productType: productTypeSnapshot.data(),
        capacity: capacitySnapshot.data()
      };
    } catch (error) {
      console.error("Error getting product capacities and type: ", error);
      throw error;
    }
  }

  static async getCapacities(productRef) {
    try {
      const capacitiesQuery = query(collection(adb, 'capacities'), where('product', '==', productRef));
      const querySnapshot = await getDocs(capacitiesQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting capacities: ", error);
      throw error;
    }
  }

  static async getTable(tableRef) {
    try {
      const tableSnapshot = await getDoc(tableRef);
      return tableSnapshot.data();
    } catch (error) {
      console.error("Error getting table: ", error);
      throw error;
    }
  }

  static async getAllCapacities(productRefs) {
    try {
      const capacitySnapshots = await Promise.all(productRefs.map(ref => getDoc(ref)));
      return capacitySnapshots.map(snapshot => snapshot.data()).sort((a, b) => a.capacity - b.capacity);
    } catch (error) {
      console.error("Error getting all capacities: ", error);
      throw error;
    }
  }

  static async getEvents() {
    try {
      const eventsQuery = query(collection(adb, 'events'), where('visible', '==', true), orderBy("date", "asc"));
      const querySnapshot = await getDocs(eventsQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting events: ", error);
      throw error;
    }
  }

  static streamUser(ref) {
    const userDoc = doc(ref);
    return userDoc.onSnapshot(snapshot => {
      return snapshot.exists ? snapshot.data() : null;
    });
  }

  static streamProducts() {
    const productsQuery = query(collection(adb, 'products'), where('visible', '==', true));
    return productsQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static async getAdmins() {
    try {
      const getAdminUsers = httpsCallable(functions, 'getAdminUsers');
      const result = await getAdminUsers();
      return result.data.adminUsers.map(adminData => adminData);
    } catch (error) {
      console.error("Error getting admins: ", error);
      throw error;
    }
  }

  static async getUsers() {
    try {
      const usersQuery = collection(adb, 'users');
      const querySnapshot = await getDocs(usersQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting users: ", error);
      throw error;
    }
  }

  static async placeDetails(placeId) {
    const url = `${baseUri}/placeDetails?placeId=${placeId}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error getting place details: ", error);
      throw error;
    }
  }

  static async placesAutocomplete(input) {
    const url = `${baseUri}/placesAutocomplete?input=${input}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error getting places autocomplete: ", error);
      throw error;
    }
  }

  static streamEvents() {
    const eventsQuery = query(collection(adb, 'events'), orderBy("date", "asc"));
    return eventsQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static streamTables(eventRef) {
    const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', eventRef), where('active', '==', true));
    return tablesQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static async getTables(eventRef) {
    try {
      const tablesQuery = query(collection(adb, 'tables'), where('eventRef', '==', eventRef), where('active', '==', true));
      const querySnapshot = await getDocs(tablesQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting tables: ", error);
      throw error;
    }
  }

  static async getSimpleEntries(eventRef) {
    try {
      const resaQuery = query(collection(adb, 'reservations'), where('eventRef', '==', eventRef), where('tableRef', '==', null));
      const querySnapshot = await getDocs(resaQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting simple entries: ", error);
      throw error;
    }
  }

  static async getBookingRequest(eventRef) {
    try {
      const resaQuery = query(collection(adb, 'reservations'), where('eventRef', '==', eventRef), where('status', '==', 0), orderBy('created', 'asc'));
      const querySnapshot = await getDocs(resaQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting booking request: ", error);
      throw error;
    }
  }

  static async getCommands(eventRef) {
    try {
      const resaQuery = query(collection(adb, 'orders'), where('eventRef', '==', eventRef), orderBy('created', 'asc'));
      const querySnapshot = await getDocs(resaQuery);
      return querySnapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error("Error getting commands: ", error);
      throw error;
    }
  }

  static streamOrders(eventRef) {
    const resaQuery = query(collection(adb, 'orders'), where('eventRef', '==', eventRef), where('status', '==', 0), orderBy('created', 'asc'));
    return resaQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static streamBookingRequests(eventRef) {
    const resaQuery = query(collection(adb, 'reservations'), where('eventRef', '==', eventRef), where('status', '==', 0), orderBy('created', 'asc'));
    return resaQuery.onSnapshot(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }

  static async getUser(ref) {
    try {
      const userSnapshot = await getDoc(ref);
      return userSnapshot.data();
    } catch (error) {
      console.error("Error getting user: ", error);
      throw error;
    }
  }

  static async uploadEventImage(imageData, eventID, fileName) {
    try {
      const filePath = `events/${eventID}/${fileName}`;
      const storageRef = ref(storagedb, filePath);
      await uploadBytes(storageRef, imageData);
      return filePath;
    } catch (error) {
      console.error("Error uploading event image: ", error);
      throw error;
    }
  }

  static async uploadProductImage(imageData, productId, fileName) {
    try {
      const filePath = `products/${productId}/${fileName}`;
      const storageRef = ref(storagedb, filePath);
      await uploadBytes(storageRef, imageData);
      return filePath;
    } catch (error) {
      console.error("Error uploading product image: ", error);
      throw error;
    }
  }
}

export default FirebaseService;
