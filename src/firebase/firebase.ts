import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyD9p-cokjKDp5Ugai_m1al5inY0nVoz1ro",
  authDomain: "mini-project-2-d68b4.firebaseapp.com",
  projectId: "mini-project-2-d68b4",
  storageBucket: "mini-project-2-d68b4.firebasestorage.app",
  messagingSenderId: "604498123760",
  appId: "1:604498123760:web:43304745c977c3d48d9b35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
