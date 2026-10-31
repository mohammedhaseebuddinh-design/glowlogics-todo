
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC8hTrKE5ClvCmLfKKKZHvyQ7htdsI0hHk",
  authDomain: "glowlogics-todo.firebaseapp.com",
  projectId: "glowlogics-todo",
  storageBucket: "glowlogics-todo.firebasestorage.app",
  messagingSenderId: "433774949351",
  appId: "1:433774949351:web:002a0aefb04355b64f4342"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
