// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
// Importa las funciones de Firestore necesarias
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
// Importa las funciones de Storage (si las vas a usar)
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
// Importa las funciones de autenticación
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'; 

// Tu configuración de Firebase - ¡Asegúrate de que estos valores sean los que copiaste de la consola!
const firebaseConfig = {
  apiKey: "AIzaSyADFqDxMqe_lVR18pZhNwwOUvJr4ksZLDI",
  authDomain: "bibliotecavirtual-12e9f.firebaseapp.com",
  projectId: "bibliotecavirtual-12e9f",
  storageBucket: "bibliotecavirtual-12e9f.firebasestorage.app",
  messagingSenderId: "161361143720",
  appId: "1:161361143720:web:3f995dc0521178f1789f9d"
};

// Inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore (la base de datos)
const db = getFirestore(app);

// Inicializa Cloud Storage
const storage = getStorage(app);         

// Inicializa Firebase Authentication
const auth = getAuth(app); 

// Exporta todas las instancias y funciones que necesitas usar en otros componentes
export { 
  db, 
  storage, 
  auth, // <-- ¡Este 'auth' es crucial!
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged // <-- ¡Este 'onAuthStateChanged' es crucial!
};
