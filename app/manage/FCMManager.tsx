"use server";

import {cert, getApps, initializeApp} from 'firebase-admin/app';
import {getMessaging} from 'firebase-admin/messaging';
import {getDatabase} from "firebase-admin/database";
import {getAuth} from "firebase-admin/auth";
import {AES, enc} from "crypto-js";
import {Performer} from "@/app/util/firebase/init";

// console.log(enc.Utf8.stringify(AES.decrypt(process.env.FIREBASE_ADMIN_DATA!, enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(16)), {iv: enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(0, 16))})))
const firebase = getApps().find(a => a.name == "Admin App") ??
    initializeApp({
        credential: cert(JSON.parse(enc.Utf8.stringify(AES.decrypt(process.env.FIREBASE_ADMIN_DATA!, enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(16)), {iv: enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(0, 16))})))),
        databaseURL: "https://lasacoffeehouse-74e2e-default-rtdb.firebaseio.com/"
    }, "Admin App")

export async function isValidJwt(jwt: string) {
    try {
        return await getAuth(firebase).verifyIdToken(jwt, false);
    } catch { return false; }
}

export async function doNothing() {
    console.log("doing nothing");
    await fetch("https://lasacoffeehouse.com/hi!", {method: "POST"});
}

export async function setCurrentPerformer(jwt: string, stage: string, performer: number) {
    if (!(await isValidJwt(jwt))) return;
    const database = getDatabase(firebase);

    await database.ref(`/data/${stage}/currentPerformer`).set(performer);
}

export async function updatePerformers(jwt: string, stage: string, performers: Performer[]) {
    if (!(await isValidJwt(jwt))) return;
    const ref = getDatabase(firebase).ref(`/data/${stage}/performers`);

    const current = (await ref.get()).val();

    for (let i = 0; i < current.length; i++) {
        current[i] = {...current[i], ...performers[i]};
    }

    await ref.set(current);
}

export async function updatePerformer(jwt: string, stage: string, performer: number, name: string, artists: string[]) {
    if (!(await isValidJwt(jwt))) return;
    const database = getDatabase(firebase);

    await database.ref(`/data/${stage}/performers/${performer}/name`).set(name);
    await database.ref(`/data/${stage}/performers/${performer}/artists`).set(artists);
}

export async function removePerformer(jwt: string, stage: string, performer: number) {
    if (!(await isValidJwt(jwt))) return;
    const ref = getDatabase(firebase).ref(`/data/${stage}/performers`);

    const performers = (await ref.get()).val()
    performers.splice(performer, 1);

    await ref.set(performers);
}

async function getFCM() {
    const database = getDatabase(firebase);

    const fcm = (await database.ref("/fcm").get()).val();
    let out: {[index: string]: any} = {};

    for (let token in fcm) {
        let timestamp = parseInt(fcm[token]['last_used']) || 0;

        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            database.ref(`/fcm/${token}`).remove().then();
            continue;
        }

        out[token] = {...fcm[token], last_used: undefined};
    }

    return out;
}

export async function getNumFCM(jwt: string) {
    if (!(await isValidJwt(jwt))) return;

    return Object.keys((await getFCM())).length;
}

export async function sendNotification(jwt: string, title: string, body: string) {
    if (!(await isValidJwt(jwt))) return;
    const database = getDatabase(firebase);
    const messaging = getMessaging(firebase);

    const fcm = await getFCM();

    for (let token in fcm) {
        console.log("sending notification to", token);

        messaging.send({
            token,
            notification: {
                title: title,
                body: body
            }
        }).then().catch(() => {
                return database.ref(`/fcm/${token}`).remove();
            });
    }
}

export async function updateClients(jwt: string, stage: string, current: Performer, next: Performer) {
    if (!(await isValidJwt(jwt))) return;
    const database = getDatabase(firebase);
    const messaging = getMessaging(firebase);

    const fcm = await getFCM();

    for (let token in fcm) {
        if (stage in fcm[token]) {
            for (let i = 0; i <= 1; i++) {
                const performer = i == 0 ? current : next;

                if (fcm[token][stage].some(((p: any) => p === performer?.uid))) {
                    console.log("updating", token);
                    messaging.send({
                        token,
                        notification: {
                            title: !i ? "Performing Now" : "Up Next",
                            body: !i ? `${performer.name} is on stage!` : `${performer.name} is about to go on`
                        }
                    }).then().catch(() => {
                        return database.ref(`/fcm/${token}`).remove();
                    });
                }
            }
        }
    }
}