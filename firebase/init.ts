import {initializeApp} from "@firebase/app";
import {getAuth, signInWithEmailAndPassword} from "@firebase/auth";

const firebase = initializeApp({
    apiKey: "AIzaSyBkKKxUvn9taDY1ZuRGCZOCl7t-qd5JML0",
    authDomain: "lasacoffeehouse-74e2e.firebaseapp.com",
    projectId: "lasacoffeehouse-74e2e",
    storageBucket: "lasacoffeehouse-74e2e.appspot.com",
    messagingSenderId: "381492655921",
    appId: "1:381492655921:web:cce18985eb9f83aed36210",
    measurementId: "G-0PZJ153E97",
    databaseURL: "https://lasacoffeehouse-74e2e-default-rtdb.firebaseio.com/"
});
signInWithEmailAndPassword(getAuth(), "admin@username.com", "lasa123").then();

export default firebase;