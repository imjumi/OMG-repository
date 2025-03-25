import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAcFXhO6x36p96R1Yvf0aokRS6iPsAsu-c",
    authDomain: "calendar-app-462ce.firebaseapp.com",
    projectId: "calendar-app-462ce",
    storageBucket: "calendar-app-462ce.firebasestorage.app",
    messagingSenderId: "9642184306",
    appId: "1:9642184306:web:ce53269e517fcc0cf13ceb"
  };

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
