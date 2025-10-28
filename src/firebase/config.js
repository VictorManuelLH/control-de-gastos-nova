import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

const firebaseConfig = {
  apiKey: "AIzaSyCmVrGjTUTeVxE2wi9MJ3pKnB9Q3vJax1o",
  authDomain: "control-gastos-6d509.firebaseapp.com",
  projectId: "control-gastos-6d509",
  storageBucket: "control-gastos-6d509.firebasestorage.app",
  messagingSenderId: "1058216943885",
  appId: "1:1058216943885:web:c413f26de626ded7c95044",
  measurementId: "G-TYHWB4GMBW"
};

export const FireBaseApp = initializeApp(firebaseConfig);
export const FireBaseAuth = getAuth(FireBaseApp);
export const FireBaseDB = getFirestore(FireBaseApp);
