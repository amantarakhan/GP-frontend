// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdSf_sldOjh1IQQperouTEC4Y1pYDzDII",
  authDomain: "localyze-487918.firebaseapp.com",
  projectId: "localyze-487918",
  storageBucket: "localyze-487918.firebasestorage.app",
  messagingSenderId: "433289778815",
  appId: "1:433289778815:web:eadfdddfaed7072df4514a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const googleProvider = new GoogleAuthProvider();
export { sendPasswordResetEmail };