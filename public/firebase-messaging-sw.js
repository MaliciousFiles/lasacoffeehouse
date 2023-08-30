importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBkKKxUvn9taDY1ZuRGCZOCl7t-qd5JML0",
    authDomain: "lasacoffeehouse-74e2e.firebaseapp.com",
    projectId: "lasacoffeehouse-74e2e",
    storageBucket: "lasacoffeehouse-74e2e.appspot.com",
    messagingSenderId: "381492655921",
    appId: "1:381492655921:web:cce18985eb9f83aed36210",
    measurementId: "G-0PZJ153E97",
    databaseURL: "https://lasacoffeehouse-74e2e-default-rtdb.firebaseio.com/"
});
const messaging = firebase.messaging();

function handleMessage(payload) {
    self.registration.showNotification(payload.notification.title, payload.notification).then();
}

// doesn't need to send notification on iOS - happens automatically
// iOS detection taken from https://stackoverflow.com/a/9039885
if (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod']
    .includes(navigator.platform)  ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document)) {
    addEventListener('message', evt=>handleMessage(evt.data))
    messaging.onBackgroundMessage(handleMessage);
}
// let notifsDB;
//
// (() => {
//     let request = indexedDB.open("notifications", 1);
//
//     request.onsuccess = (evt) => {
//         notifsDB = evt.target.result;
//     }
// })()
//
// function handleMessage(payload) {
//     console.log("[SW] handleMessage ", payload);
//     const {stage} = payload.data;
//     const performers = [payload.data.current, payload.data.next];
//
//     const store = notifsDB.transaction(stage, "readwrite").objectStore(stage);
//
//     for (let i = 0; i <= 1; i++) {
//         const performer = performers[i]
//
//         store.count(performer).onsuccess = (evt) => {
//             console.log(stage+"/"+performer+" = "+evt.target.result);
//             if (!evt.target.result) return;
//
//             self.registration.showNotification(!i ? "Performing Now" : "Up Next", {
//                 body: !i ? `${performer} is now performing!` : `${performer} is performing next!`
//             }).then();
//         }
//     }
//     self.registration.showNotification("Received Notification!").then();
// }
//

// messaging.onBackgroundMessage(handleMessage)