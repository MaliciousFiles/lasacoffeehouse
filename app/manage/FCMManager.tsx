"use server";

import {initializeApp, getApps, cert} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import {getDatabase} from "firebase-admin/database";
import {getAuth} from "firebase-admin/auth";
import {AES, enc} from "crypto-js";
import {Performer} from "@/app/util/firebase/init";

const firebase = getApps().find(a => a.name == "Admin App") ??
    initializeApp({
        credential: cert(JSON.parse(enc.Utf8.stringify(AES.decrypt(process.env.FIREBASE_ADMIN_DATA!, enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(16)), {iv: enc.Utf8.parse(process.env.FIREBASE_ADMIN_CRED!.slice(0, 16))})))),
        databaseURL: "https://lasacoffeehouse-74e2e-default-rtdb.firebaseio.com/"
    }, "Admin App")

async function isInvalid(jwt: string) {
    // TODO: some sort of logging on failure?
    try {
        await getAuth(firebase).verifyIdToken(jwt, true);
    } catch { return true; }

    return false;
}

export async function setCurrentPerformer(jwt: string, stage: string, performer: number) {
    if (await isInvalid(jwt)) return;
    const database = getDatabase(firebase);

    await database.ref(`/data/${stage}/currentPerformer`).set(performer);
}

export async function updatePerformers(jwt: string, stage: string, performers: Performer[]) {
    if (await isInvalid(jwt)) return;
    const database = getDatabase(firebase);

    await database.ref(`/data/${stage}/performers`).set(performers);
}

export async function renamePerformer(jwt: string, stage: string, performer: number, name: string) {
    if (await isInvalid(jwt)) return;
    const database = getDatabase(firebase);

    await database.ref(`/data/${stage}/performers/${performer}`).set(name);
}

export async function removePerformer(jwt: string, stage: string, performers: Performer[], performer: number) {
    if (await isInvalid(jwt)) return;
    const database = getDatabase(firebase);

    performers.splice(performer, 1);
    await database.ref(`/data/${stage}/performers`).set(performers);
}

export async function updateClients(jwt: string, stage: string, current: Performer, next: Performer) {
    if (await isInvalid(jwt)) return;
    const database = getDatabase(firebase);
    const messaging = getMessaging(firebase);

    const fcm = (await database.ref("/fcm").get()).val();

    for (let token in fcm) {
        let timestamp = parseInt(fcm[token]['last_used']) || 0;

        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            database.ref(`/fcm/${token}`).remove().then();
            continue;
        }

        if (stage in fcm[token]) {
            for (let i = 0; i <= 1; i++) {
                const performer = i == 0 ? current : next;

                if (fcm[token][stage].some(((p: any) => p === performer?.uid))) {
                    messaging.send({
                        token,
                        notification: {
                            title: !i ? "Performing Now" : "Up Next",
                            body: !i ? `${performer.name} is now performing!` : `${performer.name} is performing next!`
                        }
                    }).then().catch(() => {
                        return database.ref(`/fcm/${token}`).remove();
                    });
                }
            }
        }
    }
}