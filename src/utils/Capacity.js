// capacity.js

import { createContext, useContext, useState } from 'react';
import { adb } from '../app/firebase/firebaseconfigdb'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';

const CapacityContext = createContext();

export const useCapacity = () => {
  return useContext(CapacityContext);
};

export const CapacityProvider = ({ children }) => {
  const [capacity, setCapacity] = useState(null);
  const [capacityRef, setCapacityRef] = useState(null);

  const loadCapacity = async (capacityId) => {
    try {
      const capacityDoc = await getDoc(doc(adb, 'capacities', capacityId));
      if (capacityDoc.exists()) {
        setCapacity(capacityDoc.data());
        setCapacityRef(capacityDoc.ref);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error loading capacity:', error);
    }
  };

  const saveCapacity = async () => {
    try {
      await setDoc(capacityRef, capacity);
    } catch (error) {
      console.error('Error saving capacity:', error);
    }
  };

  const value = {
    capacity,
    capacityRef,
    loadCapacity,
    saveCapacity,
  };

  return (
    <CapacityContext.Provider value={value}>
      {children}
    </CapacityContext.Provider>
  );
};
