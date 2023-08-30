"use server";

import {applicationDefault, initializeApp, getApp, getApps} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import {getDatabase} from "firebase-admin/database";
import {getAuth} from "firebase-admin/auth";

const firebase = getApps().find(a => a.name == "Admin App") ??
    initializeApp({
        credential: applicationDefault(),
        databaseURL: "https://lasacoffeehouse-74e2e-default-rtdb.firebaseio.com/"
    }, "Admin App")

export default async function updateClients(jwt: string, stage: string, current: string, next: string) {
    // TODO: some sort of logging on failure?
    try {
        await getAuth(firebase).verifyIdToken(jwt, true);
    } catch { return; }

    const database = getDatabase(firebase);
    const messaging = getMessaging(firebase);

    const data = (await database.ref("/data").get()).val();
    const fcm = (await database.ref("/fcm").get()).val();

    for (let token in fcm) {
        let timestamp = parseInt(fcm[token]) || 0;

        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
            database.ref(`/fcm/${token}`).remove().then();
            continue;
        }

        console.log("sending message to ", token);

        messaging.send({
            token,
            data: {stage, current, next}
        }).catch(() => {});
    }
}