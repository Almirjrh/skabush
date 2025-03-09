import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  QuerySnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDchMNh4_o7EqVY8cDdhVKrdEId2j00uEg",
  authDomain: "orgpacks.firebaseapp.com",
  projectId: "orgpacks",
  storageBucket: "orgpacks.firebasestorage.app",
  messagingSenderId: "978399420403",
  appId: "1:978399420403:web:08bb234b6ebc84ea9afc86",
  measurementId: "G-9GSP93B5F4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Function to add a document to a collection
export async function addDocument<T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Function to delete a document from a collection
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Function to subscribe to collection changes
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (data: T[]) => void
): () => void {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const documents = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    })) as T[];
    onUpdate(documents);
  }, (error) => {
    console.error('Error subscribing to collection:', error);
  });
}

// Export Firebase instances
export { app, db, analytics };