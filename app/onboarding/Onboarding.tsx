"use client";

import Image from "next/image";
import React, {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {getAuth} from "@firebase/auth";
import firebase from "@/app/util/firebase/init";
import SignIn from "@/app/onboarding/SignIn";

export enum Flow {
    MAIN,
    MANAGE
}

export default function Onboarding(props: {flow: Flow, children: ReactNode | ReactNode[]}) {
    const [pwa, setPWA] = useState(true);
    const [pwaUrl, setPWAUrl] = useState("/");

    useEffect(() => {
        setPWA(process.env.NODE_ENV === 'development' || window.matchMedia('(display-mode: standalone)').matches);

        const ios = /iPad|iPhone|iPod|Mac/.test(navigator.platform);
        const chrome = /(?:chrome|crios)\/(\d+)/.test(navigator.userAgent.toLowerCase());

        setPWAUrl(`/images/add_pwa/${ios ? "ios" : "android"}_${chrome ? "chrome" : "safari"}`);
    }, []);

    const auth = getAuth(firebase);
    const [loggedIn, setLoggedIn] = useState(props.flow != Flow.MANAGE || auth.currentUser !== null);
    if (props.flow == Flow.MANAGE) {
        auth.onAuthStateChanged((user) => {
            setLoggedIn(user !== null);
        });
    }

    let inner;
    if (!pwa) {
        inner = (
            <div className={"mb-5 mt-1.5"}>
                <p className={"text-xl mb-4"}>Add to Home Screen</p>
                <Image className="drop-shadow-lg mx-auto" width={200} height={0}
                       src={`${pwaUrl}_1.jpg`} alt="Share button"/>
                <Image className="drop-shadow-lg mx-auto mt-4" src={`${pwaUrl}_2.jpg`}
                       width={150}
                       height={0} alt="Add to home screen"/>
                <p className="mx-4 mt-6">
                    {props.flow === Flow.MAIN && "To enable notifications, add this website to your home screen."}
                    {props.flow === Flow.MANAGE && "For the proper viewing experience, add this website to your home screen."}
                </p>
                <p className={"mx-4 mt-3"}>{`Tap Share, and then "Add to Home Screen" (${pwaUrl.includes("safari") ? "Safari" : "Chrome"} pictured above).`}</p>
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