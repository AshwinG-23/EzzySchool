import React, { createContext, useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchClasses = async (userId) => {
    if (!userId) return;

    setLoading(true);
    try {
      const userRef = firestore().collection('users').doc(userId);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.data();

      if (userData && Array.isArray(userData.classes)) {
        const classPromises = userData.classes.map((classId) =>
          firestore().collection('classes').doc(classId).get()
        );
        const classSnapshots = await Promise.all(classPromises);
        const classData = classSnapshots.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClasses(classData);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error('Error fetching classes: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const unsubscribeAuth = auth().onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        fetchClasses(user.uid);
      } else {
        setUserId(null);
        setClasses([]); 
      }
    });

    return () => unsubscribeAuth(); 
  }, []);

  return (
    <ClassContext.Provider value={{ classes, fetchClasses, loading }}>
      {children}
    </ClassContext.Provider>
  );
};
