import {
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

const FILES_COLLECTION = "files";

/**
 * Check if a file with the given hash exists in Firestore
 * @param {string} hash - SHA-256 hash of the file
 * @returns {Promise<{exists: boolean, data: Object|null}>} - Whether the file exists and its data
 */
export async function checkFileExists(hash) {
  try {
    // Query by SHA-256 hash
    const q = query(
      collection(db, FILES_COLLECTION),
      where("hashes.sha256", "==", hash)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Return the first matching document
      const docData = querySnapshot.docs[0].data();
      return { exists: true, data: docData };
    }

    return { exists: false, data: null };
  } catch (error) {
    console.error("Error checking file existence:", error);
    throw error;
  }
}

/**
 * Save file data to Firestore
 * @param {Object} fileData - File data to save
 * @returns {Promise<string>} - ID of the saved document
 */
export async function saveFileData(fileData) {
  try {
    // Create a new document with auto-generated ID
    const newFileRef = doc(collection(db, FILES_COLLECTION));

    // Add timestamp and ID to the file data
    const enhancedFileData = {
      ...fileData,
      id: newFileRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save to Firestore
    await setDoc(newFileRef, enhancedFileData);

    return newFileRef.id;
  } catch (error) {
    console.error("Error saving file data:", error);
    throw error;
  }
}

/**
 * Get all files from Firestore
 * @returns {Promise<Array>} - Array of file data
 */
export async function getAllFiles() {
  try {
    const querySnapshot = await getDocs(collection(db, FILES_COLLECTION));
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error getting all files:", error);
    throw error;
  }
}

/**
 * Get file by ID
 * @param {string} id - File ID
 * @returns {Promise<Object|null>} - File data or null if not found
 */
export async function getFileById(id) {
  try {
    const docRef = doc(db, FILES_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting file by ID:", error);
    throw error;
  }
}

/**
 * Update file data in Firestore
 * @param {string} id - File ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<void>}
 */
export async function updateFile(id, updateData) {
  try {
    const docRef = doc(db, FILES_COLLECTION, id);
    await setDoc(
      docRef,
      {
        ...updateData,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error updating file:", error);
    throw error;
  }
}

/**
 * Delete file from Firestore
 * @param {string} id - File ID
 * @returns {Promise<void>}
 */
export async function deleteFile(id) {
  try {
    const docRef = doc(db, FILES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

export const deleteMultipleFiles = async (ids) => {
  try {
    // Firestore tiene un límite de 500 operaciones por batch
    const batchSize = 450; // Usar un valor seguro por debajo del límite
    let successCount = 0;

    // Si hay muchos IDs, dividirlos en grupos
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = ids.slice(i, i + batchSize);

      // Añadir cada operación de eliminación al batch
      chunk.forEach((id) => {
        const docRef = doc(db, FILES_COLLECTION, id);
        batch.delete(docRef);
      });

      // Ejecutar el batch
      await batch.commit();
      successCount += chunk.length;
    }

    console.log(`Eliminados ${successCount} archivos correctamente`);
    return successCount;
  } catch (error) {
    console.error("Error eliminando múltiples archivos:", error);
    throw error;
  }
};
