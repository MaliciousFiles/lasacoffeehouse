"use client";

import firebase from "@/firebase/init";
import {getAuth} from "@firebase/auth";
import {useState} from "react";
import SignInPopup from "@/app/manage/SignInPopup";

export default function ManagePerformers() {
    const [loggedIn, setLoggedIn] = useState(getAuth(firebase).currentUser !== null);

    return !loggedIn ? <SignInPopup logIn={()=>setLoggedIn(true)} /> : (
        <div className="h-full w-full">
            <p className="text-center text-2xl">Manager Dashboard</p>
            
        </div>
    )
}