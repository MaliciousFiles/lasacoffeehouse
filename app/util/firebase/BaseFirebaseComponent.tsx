"use client"

import React, {ReactNode, useEffect, useState} from "react";
import firebase, {Stage} from "@/app/util/firebase/init";
import {get, getDatabase, onValue, ref} from "@firebase/database";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";

export default function BaseFirebaseComponent(props: {initialData: {[index: string]: Stage}, children: ReactNode}) {
    const [data, setData] = useState<{[index: string]: Stage}>(props.initialData);

    useEffect(() => {
        const dataRef = ref(getDatabase(firebase), "/data");

        const updateData = (val: any) => {
            setData(Object.keys(val).reduce((obj, stage) => {
                if (!('performers' in obj[stage])) obj[stage]['performers'] = [];
                return obj;
            }, val));
        }

        document.onvisibilitychange = () => {
            if (document.visibilityState == 'visible') updateData(get(dataRef));
        }

        return onValue(dataRef, (snapshot) => {
            updateData(snapshot.val());
        });
    }, [])

    return (
        <FirebaseContext.Provider value={data}>
            {props.children}
        </FirebaseContext.Provider>
    )
}