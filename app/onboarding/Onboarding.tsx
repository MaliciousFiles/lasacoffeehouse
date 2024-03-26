"use client";

import Image from "next/image";
import React, {ReactNode, useEffect, useState} from "react";
import {getAuth} from "@firebase/auth";
import firebase from "@/app/util/firebase/init";
import SignIn from "@/app/onboarding/SignIn";

export enum Flow {
    NORMAL,
    MANAGE
}

export default function Onboarding(props: {flow: Flow, children: ReactNode | ReactNode[]}) {
    const [pwa, setPWA] = useState(true);
    const [iOS, setIOS] = useState(false);

    useEffect(() => {
        setPWA(window.matchMedia('(display-mode: standalone)').matches);
        setIOS(/iPad|iPhone|iPod/.test(navigator.platform));
    }, []);

    const [notif, setNotif] = useState(typeof(Notification) === 'undefined' ? 'denied' :  props.flow == Flow.MANAGE ? 'granted' : Notification.permission);

    const auth = getAuth(firebase);
    const [loggedIn, setLoggedIn] = useState(props.flow == Flow.NORMAL || auth.currentUser !== null);
    auth.onAuthStateChanged((user) => {
        setLoggedIn(user !== null);
    });

    let inner = undefined;
    if (iOS && !pwa) {
        inner = (
            <div className={"my-4"}>
                <p className={"text-xl mb-4"}>Add to Home Screen</p>
                <Image key="image1" className="drop-shadow-lg mx-auto" width={200} height={0}
                       src="/images/share_button.jpeg" alt="Share button"/>
                <Image key="image2" className="drop-shadow-lg mx-auto mt-4" src="/images/add_pwa.jpeg"
                       width={150}
                       height={0} alt="Add to home screen"/>
                <p key="p" className="mx-4 mt-6">To enable notifications, install this website as a Progressive Web
                    App.</p>
                <p key="p2" className={"mx-4 mt-3"}>Tap Share, and then &quot;Add to Home Screen&quot; (Safari pictured
                    above).</p>
            </div>
        );
    } else if (notif !== 'granted') {
        inner = (
            <div className={"my-4"}>
                <p className={"text-xl mb-4"}>Enable Notifications</p>
                {/*<Image key="image" className="drop-shadow-lg mx-auto -my-4" width={105} height={0}*/}
                {/*       src="/images/notifs.png" alt="Notifications"/>,*/}
                <p key="p" className="mx-4 mt-5">
                    {notif === 'denied' ?
                        "Notification permissions have been explicitly denied. Enable them in Settings to continue." :
                        "To be notified of upcoming performances, tap &quot;Enable Notifications&quot; and grant permission."
                    }
                </p>
                <button key="button"
                        className="inline-block text-white bg-blue-600 w-fit mx-auto px-4 py-2 rounded-xl mt-8"
                        onClick={() => {
                            Notification.requestPermission().then(setNotif);
                        }}>Enable Notifications
                </button>
            </div>
        );
    } else if (!loggedIn) {
        inner = (<SignIn onLogin={() => setLoggedIn(true)} />);
    }

    return (
        <>
            {inner &&
                <div className="w-full h-full bg-left" style={{backgroundImage: "url('/images/background.jpeg')"}}>
                    <div
                        className="absolute rounded-[20px] w-4/5 left-1/2 top-2/4 -translate-x-2/4 -translate-y-2/4 bg-white">
                        <div className="mt-7">
                            <Image className="inline-block -translate-y-[4.5px] -mr-1 -translate-x-1" src="/images/logo.svg"
                                   height={27} width={27} alt="LASA logo"></Image>
                            <div className="ml-2 inline-block text-[1.1rem]">
                                <p className="text-[#051324] inline-block font2 font-semibold">LASA&nbsp;</p>
                                <p className="text-[#0A2240] inline-block font2 font-[530]">Coffee</p>
                                <p className="text-[#5e6b7c] inline-block font2 font-[530]">house</p>
                            </div>
                        </div>
                        {inner}
                    </div>
                </div>
            }
            {!inner && props.children}
        </>
    )
}