import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNg7_CRyEiFXEHD2QZ2ayiirdHVPkAiEY",
  authDomain: "easy-gst-1.firebaseapp.com",
  projectId: "easy-gst-1",
  storageBucket: "easy-gst-1.firebasestorage.app",
  messagingSenderId: "391506186059",
  appId: "1:391506186059:web:dca5765d99765348aba2ce"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


