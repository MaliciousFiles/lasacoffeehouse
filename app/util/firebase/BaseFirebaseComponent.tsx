"use client"

import React, {ReactNode, useEffect, useState} from "react";
import firebase, {Stage} from "@/app/util/firebase/init";
import {get, getDatabase, onValue, ref} from "@firebase/database";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";

export default function BaseFirebaseComponent(props: {initialData: {[index: string]: Stage}, children: ReactNode}) {
    const [data, setData] = useState<{[index: string]: Stage}>(props.initialData);

    useEffect(() => {
        const dataRef = ref(getDatabase(firebase), "/data");
        const handleSnapshot = (s: any) => {
            alert("GOT DATA: "+s.val()['Main Stage'].performers.slice(s.val()['Main Stage'].currentPerformer, s.val()['Main Stage'].currentPerformer+2));
            setData(s.val());
        }

        document.onvisibilitychange = () => {
            document.visibilityState === 'visible' && get(dataRef).then(handleSnapshot);
        }

        return onValue(dataRef, handleSnapshot);
    }, [])

    return (
        <FirebaseContext.Provider value={data}>
            {props.children}
        </FirebaseContext.Provider>
    )
}