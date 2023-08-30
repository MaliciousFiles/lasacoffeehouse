"use client";

import firebase from "@/firebase/init";
import {getAuth} from "@firebase/auth";
import {useState} from "react";
import SignInPopup from "@/app/manage/SignInPopup";
import {get, getDatabase, ref, remove, set} from "@firebase/database";

export default function ManagePerformers() {
    const [loggedIn, setLoggedIn] = useState(getAuth(firebase).currentUser !== null);

    return !loggedIn ? <SignInPopup logIn={()=>setLoggedIn(true)} /> : (
        <div className="h-full w-full">
            <p className="text-center text-2xl">Manager Dashboard</p>
            <button className={"bg-red-600 p-3 m-4"} onClick={() => {
                const idx = parseInt(prompt("Input main stage performer index") ?? "") || 0;

                const database = getDatabase(firebase);

                set(ref(database, "/data/0/currentPerformer"), idx).then();

                get(ref(database, "/fcm")).then(payload => {
                    const data = payload.val();

                    for (let token in data) {
                        let timestamp = parseInt(data[token]) || 0;

                        if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
                            remove(ref(database, `/fcm/${token}`)).then();
                            continue;
                        }

                        console.log(token);
                    }
                })

            }}>Set Main Stage Performer Index</button>
        </div>
    )
}