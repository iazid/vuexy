import { initializeApp, getApps, getApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfigdb = {
  apiKey: "AIzaSyDGbO_ag-zoiGu5xuS3xxMn0eg5nkZooqg",
  authDomain: "no-matter-ba487.firebaseapp.com",
  projectId: "no-matter-ba487",
  storageBucket: "no-matter-ba487.appspot.com",
  messagingSenderId: "1030950833212",
  appId: "1:1030950833212:web:ea4ef4ef1b33aaa24d8739",
  measurementId: "G-DMSZF2FK0Z"
};


const appdb = initializeApp(firebaseConfigdb,"secondary")
const auth = getAuth(appdb)
const adb = getFirestore(appdb);
const storagedb = getStorage(appdb)


export { adb, appdb, storagedb, auth } ;
