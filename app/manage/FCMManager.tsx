"use server";

import {cert, getApps, initializeApp} from 'firebase-admin/app';
import {getMessaging, TokenMessage} from 'firebase-admin/messaging';
import {getDatabase} from "firebase-admin/database";
import {getAuth} from "firebase-admin/auth";
import {AES, enc} from "crypto-js";
import {Performer, Stage} from "@/app/util/firebase/init";

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

export async function setAllData(jwt: string, stages: {[name: string]: Stage}) {
    if (!(await isValidJwt(jwt))) return;

    await getDatabase(firebase).ref('/data').set(stages);
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

export async function clearFCM(jwt: string) {
    if (!(await isValidJwt(jwt))) return;

    await getDatabase(firebase).ref(`/fcm`).remove();
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

// 1000 is about the limit within 10 seconds, so needs to be batched client-side
export async function sendMessageBatch(jwt: string, messages: TokenMessage[]) {
    if (!(await isValidJwt(jwt))) return;
    if (messages.length > 500) throw new Error("Must be fewer than 500 messages");

    const database = getDatabase(firebase);
    const messaging = getMessaging(firebase);

    for (let i = 0; i < messages.length; i += 500) {
        const batch = await messaging.sendEach(messages.slice(i, i + 500));
        batch.responses.forEach((response, j) => {
            if (response.success) return;
            database.ref(`/fcm/${messages[i + j].token}`).remove().then();
        });
    }
}

async function batchMessages(messages: TokenMessage[]) {
    const batches: TokenMessage[][] = [];

    for (let i = 0; i < messages.length; i += 500) {
        batches.push(messages.slice(i, i + 500));
    }

    return batches;
}

export async function sendNotification(jwt: string, title: string, body: string) {
    if (!(await isValidJwt(jwt))) return [];
    const fcm = await getFCM();

    let messages: TokenMessage[] = [];
    for (let token in fcm) {
        messages.push({
            token,
            notification: {
                title: title,
                body: body
            }
        });
    }

    return await batchMessages(messages);
}

export async function updateClients(jwt: string, stage: string, current: Performer, next: Performer) {
    if (!(await isValidJwt(jwt))) return [];

    const fcm = await getFCM();

    let messages: TokenMessage[] = [];
    for (let i = 0; i <= 1; i++) {
        const performer = i == 0 ? current : next;
        if (!performer) continue;

        let ref = getDatabase(firebase).ref(`/data/${stage}/lastNotif/${i == 0 ? 'current' : 'next'}`);
        if ((await ref.get()).val() === performer.uid) continue;
        await ref.set(performer.uid);

        for (let token in fcm) {
            if (!(stage in fcm[token])) continue;

            if (fcm[token][stage].some(((p: any) => p === performer?.uid))) {
                messages.push({
                    token,
                    notification: {
                        title: !i ? "Performing Now" : "Up Next",
                        body: !i ? `${performer.name} is on stage! Catch them now.` : `${performer.name} is about to go on. Get ready!`
                    }
                });
            }
        }
    }

    return messages ? await batchMessages(messages) : undefined;
}