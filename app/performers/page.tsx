"use client";

import React, {useContext, useEffect, useState} from "react";
import PerformerPopup from "@/app/performers/PerformerPopup";
import {AiOutlineUnorderedList} from "react-icons/ai";
import {getDatabase, onValue, ref, set} from "@firebase/database";
import firebase, {Stage} from "@/app/util/firebase/init";
import {getMessaging, getToken, onMessage} from "@firebase/messaging";
import SetupPopup, {SetupStage} from "@/app/performers/SetupPopup";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";

export default function ViewPerformers(props: {initialData: {[index: string]: Stage}}) {
    const [selectedStage, setStage] = useState(0);
    const [showPerformers, setShowPerformers] = useState(false);
    const [notifsDB, setNotifsDB] = useState<IDBDatabase>();
    const [fbToken, setFbToken] = useState<string>();

    const data = useContext(FirebaseContext);

    const [setupStage, setSetupStage] = useState<SetupStage>();
    // window won't exist till page loads
    useEffect(() => {
        new Promise(resolve => setTimeout(resolve, 50))
            .then(() => {
                let iOS = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform);
                let notifExists = "Notification" in window
                let pwa = window.matchMedia('(display-mode: standalone)').matches

                setSetupStage(Notification.permission === 'granted' ? SetupStage.NONE : iOS && !notifExists ? SetupStage.OPEN_SAFARI :
                    iOS && !pwa ? SetupStage.DOWNLOAD_PWA :
                        Notification.permission === 'denied' ? SetupStage.NOTIFS_DENIED :
                            SetupStage.ENABLE_NOTIFS);
            });
    }, [])

    // init `notifsDB`
    useEffect(() =>{
        let request = indexedDB.open("notifications");
        request.onupgradeneeded = evt => {
            for (let name in data) {
                const db = (evt.target! as IDBOpenDBRequest).result;

                if (db.objectStoreNames.contains(name)) db.deleteObjectStore(name);
                db.createObjectStore(name, {keyPath: "performer"});
            }
        }

        request.onsuccess = (evt) => {
            setNotifsDB((evt.target as IDBOpenDBRequest).result);
        }
    }, [selectedStage]);

    useEffect(() => {
        if (setupStage === undefined || setupStage !== SetupStage.NONE) return;

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

    const stages = Object.keys(data);
    const stage = stages[selectedStage];
    const performers = data[stage].performers;
    const currentPerformer = data[stage].currentPerformer;

    return (
        <div>
            <div className="mt-12 w-full">
                <p className="text-2xl text-center text-[#0A2240] mb-2.5">LASA Coffeehouse</p>
                <div className="w-[95%] h-0.5 m-auto" style={{background: "linear-gradient(to right, #00000000 10%, #5e6b7c, #00000000 90%)"}}></div>
            </div>

            <div className="inline-block mt-[3rem] text-center">
                <div className="Names whitespace-nowrap w-screen overflow-x-hidden scroll-smooth relative">
                    {stages.map(s =>
                        <div key={s} className="inline-block text-center -translate-x-2/4 translate-y-0 ml-[50vw] mr-[50vw]">
                            <p className="text-[#0A2240] text-2xl font2">{performers[currentPerformer]}</p>
                            <p className="text-[#5e6b7c] text-xl mt-[35px] font2">{performers[currentPerformer+1]}</p>
                            <p className="text-[#5e6b7c] text-xl mt-[35px] font2">{performers[currentPerformer+2]}</p>
                        </div>
                    )}
                </div>
                <div className="text-[#5e6b7c] mt-[1.2rem] rounded-[30px] cursor-pointer inline-block" onClick={()=>setShowPerformers(true)}>
                    <AiOutlineUnorderedList className="inline-block" />
                    <p className="inline-block ml-2.5 mr-0 my-2.5">View All</p>
                </div>
            </div>
            <div className="bg-[#e7e7e7] text-[#0A2240] fixed -translate-x-2/4 whitespace-nowrap px-[35px] py-0 rounded-[40px] left-2/4 bottom-12" style={{filter: "drop-shadow(0px 3px 5px #a6a6a6)"}}>
                {([] as any[]).concat(...stages.map((s, i) => [
                    <div key={`div${i}`} className={"inline-block mr-[-17px] ml-[-17px] my-2.5 px-[17px] py-1.5"+(i === selectedStage ? " rounded-[30px]" : "")} style={i === selectedStage ? {background: "white", filter: "drop-shadow(0px 3px 5px #a9a9a9)"} : {}}>
                        <p className="m-0 cursor-pointer" onClick={() => {
                            setStage(i);

                            let namesDiv = document.querySelector(".Names");
                            namesDiv!.scrollTo((namesDiv!.children[i] as HTMLElement).offsetLeft-visualViewport!.width/2, 0);
                        }}>{s}</p>
                    </div>, <span key={`span${i}`} className="mx-[15px] my-0"></span>]))
                .slice(0, -1)}
            </div>

            <PerformerPopup show={showPerformers} notifsDB={notifsDB} fbToken={fbToken} performers={performers} currentPerformer={currentPerformer} currentStage={stage} close={()=>setShowPerformers(false)}></PerformerPopup>
            <SetupPopup stage={setupStage} setNotifsStatus={(perm) => {setSetupStage(perm === 'granted' ? SetupStage.NONE : perm === 'denied' ? SetupStage.NOTIFS_DENIED : SetupStage.ENABLE_NOTIFS)}} />
        </div>
    )
}