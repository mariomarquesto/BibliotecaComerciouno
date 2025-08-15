// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
// Asegúrate de que 'onSnapshot' esté aquí en la importación
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore'; // <-- ¡Añadido onSnapshot aquí!
// Si vas a usar Storage para PDF o imágenes, también estas:
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// **TU CONFIGURACIÓN DE FIREBASE** - ¡Estos valores deben ser los que obtuviste de la consola!
const firebaseConfig = {
  apiKey: "AIzaSyADFqDxMqe_lVR18pZhNwwOUvJr4ksZLDI",
  authDomain: "bibliotecavirtual-12e9f.firebaseapp.com",
  projectId: "bibliotecavirtual-12e9f",
  storageBucket: "bibliotecavirtual-12e9f.firebasestorage.app",
  messagingSenderId: "161361143720",
  appId: "1:161361143720:web:3f995dc0521178f1789f9d"
};

// **¡MUY IMPORTANTE! Inicializar la aplicación de Firebase**
const app = initializeApp(firebaseConfig);

// **¡MUY IMPORTANTE! Inicializar Firestore (la base de datos)**
const db = getFirestore(app);

// **Inicializar Cloud Storage (si lo usarás para PDFs)**
const storage = getStorage(app);

// **¡MUY IMPORTANTE! Exportar 'onSnapshot' junto con el resto**
export { db, storage, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot, ref, uploadBytes, getDownloadURL, deleteObject }; // <-- ¡Añadido onSnapshot aquí!