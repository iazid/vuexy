import { doc, getFirestore, Timestamp } from 'firebase/firestore';

// Enum pour les types d'utilisateurs
export const USER_TYPE = {
  OWNER: 0,
  ADMIN: 1,
  READER: 2,
  WAITER: 3,
  SPONSOR: 4,
  REGULAR: 5,
  INSTA: 6,
};

class UserData {
  constructor({
    userRef,
    mail = null,
    type = USER_TYPE.REGULAR, 
    name,
    surname,
    pic = null,
    doc = null,
    insta = null,
    dateOfBirth = null,
    docverified = false,
    isVerified = false,
    phoneVerified = false,
    mailVerified = false,
    phoneNumber = null,
    countryCode = null,
    phoneCode = null,
  }) {
    this.userRef = userRef;
    this.mail = mail;
    this.type = type;
    this.name = name;
    this.surname = surname;
    this.pic = pic;
    this.doc = doc;
    this.insta = insta;
    this.dateOfBirth = dateOfBirth;
    this.docverified = docverified;
    this.isVerified = isVerified;
    this.phoneVerified = phoneVerified;
    this.mailVerified = mailVerified;
    this.phoneNumber = phoneNumber;
    this.countryCode = countryCode;
    this.phoneCode = phoneCode;
  }

 
  static fromFirebase(doc) {
    const data = doc.data();

    return new UserData({
      userRef: doc.ref,
      mail: data.email || null,
      type: USER_TYPE[data.type] || USER_TYPE.REGULAR, 
      name: data.name || '',
      surname: data.surname || '',
      pic: data.pic || null,
      doc: data.doc || null,
      insta: data.insta || null,
      dateOfBirth: data.date ? data.date.toDate() : null,
      docverified: data.docVerified || false,
      isVerified: data.isVerified || false,
      phoneVerified: data.phoneVerified || false,
      mailVerified: data.mailVerified || false,
      phoneNumber: data.phoneNumber || null,
      phoneCode: data.phoneCode || null,
      countryCode: data.countryCode || null,
    });
  }

  // Méthode pour convertir l'instance UserData en JSON pour Firestore
  toJson() {
    return {
      email: this.mail,
      type: this.type,
      name: this.name,
      surname: this.surname,
      pic: this.pic,
      doc: this.doc,
      insta: this.insta,
      date: this.dateOfBirth ? Timestamp.fromDate(this.dateOfBirth) : null,
      docVerified: this.docverified,
      isVerified: this.isVerified,
      phoneVerified: this.phoneVerified,
      mailVerified: this.mailVerified,
      phoneNumber: this.phoneNumber,
      phoneCode: this.phoneCode,
      countryCode: this.countryCode,
    };
  }
}

export default UserData;
