"use client"

import React, {ReactNode, useEffect, useState} from "react";
import firebase, {Stage} from "@/firebase/init";
import {getDatabase, onValue, ref} from "@firebase/database";
import FirebaseContext from "@/firebase/FirebaseContext";

export default function FirebaseComponent(props: {initialData: {[index: string]: Stage}, children: ReactNode}) {
    const [data, setData] = useState<{[index: string]: Stage}>(props.initialData);

    useEffect(() => {
        const dataRef = ref(getDatabase(firebase), "/data");

        return onValue(dataRef, (snapshot) => {
            setData(snapshot.val());
        });
    }, [])

    return (
        <FirebaseContext.Provider value={data}>
            {props.children}
        </FirebaseContext.Provider>
    )
}