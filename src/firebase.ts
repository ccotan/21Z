import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDCs5XlLW6rSYAWD9VepuBX3bgIa49-17M",
  authDomain: "zv-3e35c.firebaseapp.com",
  projectId: "zv-3e35c",
  storageBucket: "zv-3e35c.firebasestorage.app",
  messagingSenderId: "849643220654",
  appId: "1:849643220654:web:0421a7ba9c1e9a2b0b473f",
  measurementId: "G-5PBTBRF90V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
