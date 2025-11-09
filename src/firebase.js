// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCSzJ_i7fTcnlAqk1N91pdzxQilcX8XTBY",
  authDomain: "carsharing102.firebaseapp.com",
  projectId: "carsharing102",
  storageBucket: "carsharing102.firebasestorage.app",
  messagingSenderId: "783996564797",
  appId: "1:783996564797:web:443257642c13d03d61c154",
  measurementId: "G-W6293P3MMS"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };