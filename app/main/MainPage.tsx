"use client";

import React, {useContext, useEffect, useRef, useState} from "react";
import {getDatabase, ref, set} from "@firebase/database";
import firebase from "@/app/util/firebase/init";
import {getMessaging, getToken, onMessage} from "@firebase/messaging";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";
import {BiBell, BiBellOff} from "react-icons/bi";
import {getColorScheme} from "@/app/util/util";
import StageSelector from "@/app/util/StageSelector";
import PerformerText from "@/app/main/PerformerText";

export default function MainPage() {
    const data = useContext(FirebaseContext);

    const [fbToken, setFbToken] = useState<string>();
    const [selectedStage, setStage] = useState(0);

    // notifs are special because they're synced to local storage, not FB
    const [notifs, setNotifs] = useState<{[i: string]: string[]}>({});

    const [messagingSetup, setMessagingSetup] = useState(false);
    const initMessaging = () => {
        if (messagingSetup) return;
        setMessagingSetup(true);

        const messaging = getMessaging(firebase);
        const database = getDatabase(firebase);

        // noinspection SpellCheckingInspection
        getToken(messaging, {vapidKey: "BKTiO6q1fNuQyg35h5_2PAzJhCktM0hur4llEn1gIB5Dlf6oCRCD5RIA4OY6BJvdR1UifBM22hAcKwVMc-OSUnc"})
            .then(token => {
                if (token) {
                    const updateLastUsed = () => set(ref(database, `/fcm/${token}/last_used`), Date.now());
                    document.addEventListener('visibilitychange', () => {
                        document.visibilityState === 'visible' && updateLastUsed();
                    })
                    updateLastUsed();

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
    };

    // init notif service and load data from localStorage
    useEffect(() => {
        // load stored notif data
        Object.keys(data).reduce((obj, s) => {
            obj[s] = JSON.parse(localStorage.getItem(`lasacoffeehouse:notifs:${s}`) ?? '[]');
            return obj;
        }, notifs);

        if (window.Notification?.permission == 'granted') initMessaging();
    }, []);

    // sync to FB and localStorage every time `notifs` is updated
    useEffect(() => {
        for (const stage in notifs) {
            localStorage.setItem(`lasacoffeehouse:notifs:${stage}`, JSON.stringify(notifs[stage]));

            if (fbToken) {
                set(ref(getDatabase(firebase), `/fcm/${fbToken}/${stage}`), notifs[stage]).then();
            }
        }
    }, [fbToken, notifs])

    const stage = Object.keys(data)[selectedStage];
    const performers = data[stage].performers;
    const currentPerformer = data[stage].currentPerformer;

    const [cohort, setCohort] = useState<-1|1>(1);

    const gradientRef = useRef<HTMLDivElement>(null);

    // scroll to top when view changes
    const scrollView = useRef<HTMLDivElement>(null);
    useEffect(() => {
        scrollView.current?.scrollTo(0, 0);
    }, [cohort, stage]);

    const color = getColorScheme(selectedStage);

    const backgroundRef = useRef<HTMLDivElement>(null);

    const [expanded, setExpanded] = useState(Object.keys(data).reduce((o: {[i: string]: boolean[]}, s) => {o[s] = data[s].performers.map(_=>false); return o;}, {}));

    return (
        <div className={`flex flex-col h-full`} >
            <StageSelector stages={Object.keys(data)} selected={selectedStage} setSelected={setStage} className={"h-14 z-50 bg-white rounded-b-2xl overflow-hidden"} />
            <div ref={backgroundRef} style={{
                backgroundImage: `url(/images/bg_images/${currentPerformer % 6}.jpg)`,
                backgroundColor: color.imageBackgroundColor(currentPerformer % 6)
            }} className={`absolute top-10 w-full h-[37%] bg-[length:auto_100%] bg-no-repeat bg-center`} />
            <div className={`h-[35%]`} />
            <div className={"bg-white z-10 h-[65%] rounded-t-3xl flex flex-col overflow-hidden"}>
                <div
                    className={`flex flex-col ${color.performerText} px-4 justify-evenly w-full flex-shrink-0 h-24 py-3 bg-gradient-to-b ${color.performerBg} m-auto`}>
                    <p className={`text-3xl ${color.performerNameText} text-ellipsis line-clamp-1 leading-7 m-1 font-semiheavy`}>{performers[currentPerformer]?.name}</p>
                    <p className={"text-sm text-ellipsis line-clamp-1 font-semiheavy"}>{performers[currentPerformer]?.artists && performers[currentPerformer]!.artists.join(", ")}</p>
                    <p className={"text-sm text-ellipsis line-clamp-1 font-semiheavy"}>{performers[currentPerformer]?.songs && `${performers[currentPerformer]!.songs.map(s => `"${s.name}" ${s.original ? "(original)" : s.artist ? `by ${s.artist}` : ""}`)}`}</p>
                </div>
                <div className={"bg-gray-50 h-16 flex text-left"}>
                    {[-1, 1].map(c => {
                        const p = performers[currentPerformer + c];

                        return (<div key={`cohort${c}`} onClick={() => setCohort(c as -1 | 1)}
                                     className={`w-1/2 ${c == cohort ? 'text-gray-800' : 'text-gray-500'} relative overflow-hidden` + (c == cohort ? ` ${color.bgLight}` : "")}>
                                <p className={"text-xs mt-2 ml-4 mb-0"}>{c == -1 ? "Previous" : "Up Next"}</p>
                                <p className={`ml-4 mt-1 ${c == -1 && "text-sm"} mb-3 font-semiheavy line-clamp-1 text-ellipsis`}>{p?.name}</p>
                                {c == cohort && <div className={`${color.bg} w-full absolute bottom-[-1px] rounded h-1`}/>}
                            </div>
                        )})}
                </div>
                <div ref={scrollView} className={"flex-grow overflow-auto"}>
                    {performers[currentPerformer + cohort*2] ?
                        <div className={"h-full"}>
                            {([] as any[]).concat(...(cohort == -1 ? performers.map((p,i)=>{return {p,i}}).slice(0, currentPerformer - 1).reverse() : performers.map((p,i)=>{return {p,i}}).slice(currentPerformer + 2))
                                .map((performer, idx) => {
                                    const {p, i} = performer
                                    return [
                                        <div
                                            key={"performer" + p.name}
                                            className={`${!expanded[stage][i] ? (p.artists && p.songs ? "max-h-[3.75rem] h-[3.75rem]" : p.artists || p.songs ? "max-h-10 h-10" : "max-h-5 h-5") : "max-h-52"} min-h-[2.5rem] w-full flex transition-[max-height] justify-between my-2`}
                                            onClick={() => {
                                                expanded[stage][i] = !expanded[stage][i]
                                                setExpanded({...expanded})
                                            }}>
                                            <PerformerText expanded={expanded[stage][i]} performer={p}/>
                                            {cohort == 1 ? <button onClick={async (e) => {
                                                    e.stopPropagation()

                                                    if (await window.Notification?.requestPermission() != 'granted') {
                                                        alert("Notifications have been explicitly denied. Enable them in system settings to continue.");
                                                        return;
                                                    }
                                                    initMessaging();

                                                    const {uid} = p;

                                                    if (notifs[stage]?.includes(uid)) {
                                                        notifs[stage]?.splice(notifs[stage].indexOf(uid), 1);
                                                    } else {
                                                        notifs[stage]?.push(uid);
                                                    }

                                                    setNotifs({...notifs});
                                                }}
                                                                   className={`mr-4 flex-shrink-0 my-auto ${notifs[stage]?.includes(p.uid) ? color.bg : color.border} ${notifs[stage]?.includes(p.uid) ? color.textLight : color.text} rounded-2xl basis-1/5 h-[1.65rem] text-sm`}>
                                                    {notifs[stage]?.includes(p.uid) ?
                                                        <BiBell className={"m-auto"}/> :
                                                        <BiBellOff className={"m-auto"}/>
                                                    }
                                                </button> :
                                                <p className={"text-xs text-gray-400 flex-shrink-0 z-50 mr-4 my-auto"}>Already
                                                    performed</p>}
                                        </div>,
                                        <div key={"divider" + p.name}
                                             className={"w-full bg-gray-300 h-px relative z-50"}/>
                                    ]
                                })).slice(0, -1)}
                            <div className={"h-[calc(100%-2.75rem)]"}/>
                        </div> :
                        <p className={"mt-2"}>{cohort == -1 ? "Welcome to Coffeehouse!" : "That's a wrap!"}</p>
                    }

                    {/* width = width of button + mr of button - right of this*/}
                    <div ref={gradientRef}
                         className={"fixed pointer-events-none z-10 right-2.5 w-[calc(20%+1rem-0.625rem)] bottom-0 9 h-[calc(55%-4rem-0*2.25rem)] bg-gradient-to-b from-transparent to-[#ffffffcf]"}/>
                </div>
            </div>
        </div>
    )
}