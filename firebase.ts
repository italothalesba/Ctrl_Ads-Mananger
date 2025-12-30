
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3B_4kVLCjj1hi6OKIogiKa9tvnbVYEjk",
  authDomain: "ads-manager-5961a.firebaseapp.com",
  projectId: "ads-manager-5961a",
  storageBucket: "ads-manager-5961a.firebasestorage.app",
  messagingSenderId: "799050559344",
  appId: "1:799050559344:web:473521124f3dcb8573a9b5",
  measurementId: "G-WH3VTT2QYG"
};

// Singleton para inicialização do App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta a instância do banco de dados
export const db = getFirestore(app);
