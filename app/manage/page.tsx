"use client";

import firebase from "@/firebase/init";
import {getAuth} from "@firebase/auth";
import {useContext, useState} from "react";
import SignInPopup from "@/app/manage/SignInPopup";
import FirebaseContext from "@/firebase/FirebaseContext";

export default function ManagePerformers() {
    const [loggedIn, setLoggedIn] = useState(getAuth(firebase).currentUser !== null);

    const data = useContext(FirebaseContext);

    return !loggedIn ? <SignInPopup logIn={()=>setLoggedIn(true)} /> : (
        <div className="h-full w-full">
            <p className="text-center text-2xl">Manager Dashboard</p>

            {/*<button className={"bg-red-600 p-3 m-4"} onClick={() => {*/}
            {/*    const idx = parseInt(prompt("Input main stage performer index") ?? "") || 0;*/}

            {/*    const database = getDatabase(firebase);*/}

            {/*    set(ref(database, "/data/0/currentPerformer"), idx).then();*/}
            {/*    get(ref(database, "/data/0")).then(snapshot => {*/}
            {/*        const data = snapshot.val()*/}

            {/*        getAuth(firebase).currentUser?.getIdToken()*/}
            {/*            .then(jwt => updateClients(jwt, data.name, data.performers[idx], data.performers[idx+1]).then());*/}
            {/*    })*/}
            {/*}}>Set Main Stage Performer Index</button>*/}
        </div>
    )
}