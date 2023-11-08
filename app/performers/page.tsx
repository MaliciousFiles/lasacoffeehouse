"use client";

import React, {useContext, useEffect, useRef, useState} from "react";
import {getDatabase, ref, set} from "@firebase/database";
import firebase from "@/app/util/firebase/init";
import {getMessaging, getToken, onMessage} from "@firebase/messaging";
import SetupPopup, {SetupStage} from "@/app/performers/SetupPopup";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";
import {BiBell, BiBellOff, BiSolidSquareRounded} from "react-icons/bi";
import {TbTriangleFilled} from "react-icons/tb";

export default function ViewPerformers() {
    const data = useContext(FirebaseContext);

    const [fbToken, setFbToken] = useState<string>();
    const [setupStage, setSetupStage] = useState<SetupStage>();
    const [selectedStage, setStage] = useState(0);

    // notifs are special because they're synced to local storage, not FB
    const [notifs, setNotifs] = useState<{[i: string]: string[]}>({});

    // sync to FB and localStorage every time `notifs` is updated
    useEffect(() => {
        for (const stage in notifs) {
            localStorage.setItem(`lasacoffeehouse:notifs:${stage}`, JSON.stringify(notifs[stage]));

            if (fbToken) {
                set(ref(getDatabase(firebase), `/fcm/${fbToken}/${stage}`), notifs[stage]).then();
            }
        }
    }, [fbToken, notifs])

    // load from localStorage and determine setup stage
    useEffect(() => {
        Object.keys(data).reduce((obj, s) => {
            obj[s] = JSON.parse(localStorage.getItem(`lasacoffeehouse:notifs:${s}`) ?? '[]');
            return obj;
        }, notifs);

        new Promise(resolve => setTimeout(resolve, 50))
            .then(() => {
                let iOS = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform);
                let notifExists = "Notification" in window
                let pwa = window.matchMedia('(display-mode: standalone)').matches

                setSetupStage(notifExists && Notification.permission === 'granted' ? SetupStage.NONE :
                    iOS && !notifExists ? SetupStage.OPEN_SAFARI :
                    iOS && !pwa ? SetupStage.DOWNLOAD_PWA :
                        Notification.permission === 'denied' ? SetupStage.NOTIFS_DENIED :
                            SetupStage.ENABLE_NOTIFS);
            });
    }, [])

    // init notif service when we have permission
    useEffect(() => {
        if (setupStage !== SetupStage.NONE) return;

        const messaging = getMessaging(firebase);
        const database = getDatabase(firebase);

        getToken(messaging, {vapidKey: "BKTiO6q1fNuQyg35h5_2PAzJhCktM0hur4llEn1gIB5Dlf6oCRCD5RIA4OY6BJvdR1UifBM22hAcKwVMc-OSUnc"})
            .then(token => {
                if (token) {
                    set(ref(database, `/fcm/${token}/last_used`), Date.now()).then();

                    setFbToken(token);
                }
            })

        // just let the SW handle it
        onMessage(messaging, (payload) => {
            navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope")
                .then(registration => {
                    registration?.active?.postMessage(payload)
                })
        });

    }, [setupStage]);

    const stage = Object.keys(data)[selectedStage];
    const performers = data[stage].performers;
    const currentPerformer = data[stage].currentPerformer;

    const [cohort, setCohort] = useState<-1|1>(1);

    // scroll to top when view changes
    const scrollView = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollView.current?.scrollTo(0, 0);
    }, [cohort, stage]);

    // tailwind won't load if I just define the pink/emerald part
    const color = {
        bg: selectedStage == 0 ? 'bg-pink-600' : 'bg-emerald-600',
        bgLight: selectedStage == 0 ? 'bg-pink-50' : 'bg-emerald-50',
        border: `border ${(selectedStage == 0 ? 'border-pink-600' : 'border-emerald-600')}`,
        text: selectedStage == 0 ? 'text-pink-600' : 'text-emerald-600',
        textLight: selectedStage == 0 ? 'text-pink-100' : 'text-emerald-100'
    };

    return (
        <div className={"bg-[--navy] flex flex-col h-full"} >
            <div className={"h-[45%] flex"}>
                <div className={"flex flex-col justify-evenly h-4/5 m-auto text-[--light-gray]"}>
                    <p className={"text-sm font-semiheavy"}>Currently Performing</p>
                    <p className={"text-3xl m-1 font-heavy"}>{performers[currentPerformer]?.name}</p>
                    {/* TODO: actually store people in data */}
                    <p className={"text-lg font-semiheavy"}>{performers[currentPerformer]?.artists && `Performed by ${performers[currentPerformer]?.artists.join(',')}`}</p>
                </div>
            </div>
            <div className={"bg-white h-[55%] rounded-t-xl flex flex-col overflow-hidden"}>
                <div className={"bg-gray-50 h-16 flex text-left"}>
                    {[-1, 1].map(c =>
                        <div key={`cohort${c}`} onClick={()=>setCohort(c as -1|1)} className={`w-1/2 ${c == cohort ? 'text-gray-800' : 'text-gray-500'} relative overflow-hidden`+(c == cohort ? ` ${color.bgLight}` : "")}>
                            <p className={"text-xs mt-2 ml-4 mb-0"}>{c == -1 ? "Previous" : "Up Next"}</p>
                            <p className={"ml-4 mt-1 mb-3 font-semiheavy"}>{performers[currentPerformer+c]?.name}</p>
                            {c == cohort && <div className={`${color.bg} w-full absolute bottom-[-1px] rounded h-1`} />}
                        </div>
                    )}
                </div>
                <div ref={scrollView} className={"flex-grow overflow-auto"}>
                    {performers[currentPerformer+cohort] ?
                        <div className={"h-full"} >
                            {(cohort == -1 ? performers.slice(0, currentPerformer-1).reverse() : performers.slice(currentPerformer+2))
                            .map(p =>
                                <div key={"performer"+p.name} className={"h-11 w-full flex justify-between"} >
                                    <div className={"text-left flex overflow-hidden whitespace-nowrap my-auto flex-grow"}>
                                        <p className={"pl-4"} >{p.name}</p>
                                        {p.artists && <div className={"flex-grow my-auto overflow-hidden whitespace-nowrap text-ellipsis text-xs text-gray-500"}>
                                            <p className={"inline"}>&nbsp;by</p>
                                            {([] as any[]).concat(...p.artists.map((a, i) => [
                                                <p key={"artist"+i} className={"inline font-semiheavy"}>&nbsp;{a}</p>,
                                                <p key={"c"+i} className={"inline font-light"}>,</p>
                                            ])).slice(0,-1)}
                                        </div>}
                                    </div>
                                    <button onClick={() => {
                                        const {uid} = p;

                                        if (notifs[stage]?.includes(uid)) {
                                            notifs[stage]?.splice(notifs[stage].indexOf(uid), 1);
                                        } else {
                                            notifs[stage]?.push(uid);
                                        }

                                        setNotifs({...notifs});
                                    }} className={`mr-4 flex-shrink-0 my-auto ${notifs[stage]?.includes(p.uid) ? color.bg : color.border} ${notifs[stage]?.includes(p.uid) ? color.textLight : color.text} rounded-2xl basis-1/5 h-[1.65rem] text-sm`}>
                                        {notifs[stage]?.includes(p.uid) ?
                                            <BiBellOff className={"m-auto"} /> :
                                            <BiBell className={"m-auto"} />
                                        }
                                    </button>
                                </div>
                            )}
                            <div className={"h-[calc(100%-2.75rem)]"} />
                        </div> :
                        <p>{cohort == -1 ? "Welcome to Coffeehouse!" : "All done!"}</p>
                    }

                    {/* width = width of button + mr of button - right of this*/}
                    <div className={"fixed pointer-events-none z-10 bottom-0 right-2.5 w-[calc(20%+1rem-0.625rem)] h-[calc(55%-4rem)] bg-gradient-to-b from-transparent to-[#ffffffcf]"} />
                </div>
                <div className={"flex justify-evenly bg-white w-4/5 h-11 drop-shadow-lg z-40 rounded-3xl absolute bottom-3 left-1/2 -translate-x-1/2"}>
                    {Object.keys(data).map((s, i) =>
                        <div key={"stage"+s} onClick={()=>setStage(i)} className={`m-1.5 flex-grow flex ${s == stage ? "bg-gray-100" : "bg-gray-50"} rounded-3xl`} >
                            <div className={"my-auto w-1/3"} >
                                {i == 0 ?
                                    <TbTriangleFilled className={`mx-auto ${s == stage ? "text-pink-600" : "text-pink-300"}`} />
                                    : <BiSolidSquareRounded className={`mx-auto ${s == stage ? "text-emerald-500" : "text-emerald-200"}`} />
                                }
                            </div>
                            <p className={`my-auto flex-grow text-xs text-left font-heavy text-gray-${s == stage ? "700" : "400"}`}>{s}</p>
                        </div>
                    )}
                </div>
            </div>

            <SetupPopup stage={setupStage} setNotifsStatus={(perm) => {setSetupStage(perm === 'granted' ? SetupStage.NONE : perm === 'denied' ? SetupStage.NOTIFS_DENIED : SetupStage.ENABLE_NOTIFS)}} />
        </div>
    )
}