import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export const checkFileExists = async (fileHashes) => {
  try {
    const filesRef = collection(db, 'files');
    const q = query(
      filesRef,
      where('hashes.md5', '==', fileHashes.md5),
      where('hashes.sha256', '==', fileHashes.sha256)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        exists: true,
        data: { 
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date() // Convertir Timestamp a Date
        }
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error checking file existence:', error);
    throw error;
  }
};

export const saveFileData = async (fileData) => {
  try {
    const filesRef = collection(db, 'files');
    const docData = {
      ...fileData,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(filesRef, docData);
    
    // Retornar los datos con el timestamp convertido a Date
    return {
      id: docRef.id,
      ...docData,
      createdAt: new Date() // El serverTimestamp se resolverá en el servidor
    };
  } catch (error) {
    console.error('Error saving file data:', error);
    throw error;
  }
};