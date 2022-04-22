// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMAxyWCxAI-XfH_KbrOoLv5P_mvFimQSg",
  authDomain: "g18-essen-final.firebaseapp.com",
  projectId: "g18-essen-final",
  storageBucket: "g18-essen-final.appspot.com",
  messagingSenderId: "798773782854",
  appId: "1:798773782854:web:23ca69b16910048fa9dd47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    updateDoc,
} from 'https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js';
  
const db = getFirestore();
