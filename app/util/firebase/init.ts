import {initializeApp} from "@firebase/app";
import {get, getDatabase, ref} from "@firebase/database";

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
export default firebase;

export function genUID() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export type Performer = {
    uid: string
    name: string
    artists: string[]
    image?: string
}

export type Stage = {
    name: string
    performers: Performer[]
    currentPerformer: number
}
