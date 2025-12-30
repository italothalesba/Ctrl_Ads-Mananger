
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Configurações oficiais do Firebase AdsManager Pro
 * Integrado com Firestore para persistência de clientes e métricas.
 */
const firebaseConfig = {
  apiKey: "AIzaSyC3B_4kVLCjj1hi6OKIogiKa9tvnbVYEjk",
  authDomain: "ads-manager-5961a.firebaseapp.com",
  projectId: "ads-manager-5961a",
  storageBucket: "ads-manager-5961a.firebasestorage.app",
  messagingSenderId: "799050559344",
  appId: "1:799050559344:web:473521124f3dcb8573a9b5",
  measurementId: "G-WH3VTT2QYG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
