"use client";

import Image from "next/image";
import React, {ReactNode, useEffect, useState} from "react";
import {getAuth} from "@firebase/auth";
import firebase from "@/app/util/firebase/init";
import SignIn from "@/app/onboarding/SignIn";

export enum Flow {
    MAIN,
    MANAGE
}

export default function Onboarding(props: {flow: Flow, children: ReactNode | ReactNode[]}) {
    const [pwa, setPWA] = useState(false);
    const [iOS, setIOS] = useState(true);

    useEffect(() => {
        setPWA(window.matchMedia('(display-mode: standalone)').matches);
        setIOS(/iPad|iPhone|iPod/.test(navigator.platform));
    }, []);

    const [notif, setNotif] = useState(typeof(Notification) === 'undefined' ? 'default' :  props.flow != Flow.MAIN ? 'granted' : Notification.permission);
    useEffect(() => {
        alert("notif set to "+notif);
    }, [notif]);
    useEffect(() => {
        navigator.permissions.query({name:'notifications'}).then(function(perm) {
            perm.onchange = () => {
                setNotif(Notification.permission);
            };
        });
    }, []);

    const auth = getAuth(firebase);
    const [loggedIn, setLoggedIn] = useState(props.flow != Flow.MANAGE || auth.currentUser !== null);
    if (props.flow == Flow.MANAGE) {
        auth.onAuthStateChanged((user) => {
            setLoggedIn(user !== null);
        });
    }

    let inner = undefined;
    if (iOS && !pwa) {
        inner = (
            <div className={"mb-5 mt-1.5"}>
                <p className={"text-xl mb-4"}>Add to Home Screen</p>
                <Image className="drop-shadow-lg mx-auto" width={200} height={0}
                       src="/images/share_button.jpeg" alt="Share button"/>
                <Image className="drop-shadow-lg mx-auto mt-4" src="/images/add_pwa.jpeg"
                       width={150}
                       height={0} alt="Add to home screen"/>
                <p className="mx-4 mt-6">To enable notifications, install this website as a Progressive Web
                    App.</p>
                <p className={"mx-4 mt-3"}>Tap Share, and then &quot;Add to Home Screen&quot; (Safari pictured
                    above).</p>
            </div>
        );
    } else if (notif !== 'granted') {
        inner = (
            <div className={"mb-6 mt-1.5"}>
                <p className={"text-xl mb-6"}>Stay Up to Date</p>
                {/*<Image className="drop-shadow-lg mx-auto -my-4" width={105} height={0}*/}
                {/*       src="/images/notifs.png" alt="Notifications"/>,*/}
                <button
                    className="inline-block text-white bg-blue-600 w-fit mx-auto px-4 py-2 rounded-xl"
                    onClick={() => {
                        Notification.requestPermission().then(setNotif);
                    }}>
                    {notif === 'denied'
                        ? 'Continue to App'
                        : 'Enable Notifications'
                    }
                </button>
                <p className="mx-4 mt-6">
                    {notif === 'denied'
                        ? 'Notification permissions have been explicitly denied. Enable them in Settings to continue.'
                        : 'To be notified of upcoming performances, tap "Enable Notifications" and grant permission.'
                    }
                </p>
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