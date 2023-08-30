"use client";

import React, {useEffect, useState} from "react";
import PerformerPopup from "@/app/performers/PerformerPopup";
import {AiOutlineUnorderedList} from "react-icons/ai";
import {get, getDatabase, onValue, ref, set} from "@firebase/database";
import firebase from "@/firebase/init";
import {getMessaging, getToken, onMessage} from "@firebase/messaging";
import {onBackgroundMessage} from "@firebase/messaging/sw";
import {exists} from "fs";

type Stage = {
    name: string
    performers: string[]
    currentPerformer: number
}

export default function ViewPerformers(props: {initialData: {[index: string]: Stage}}) {
    const [selectedStage, setStage] = useState(0);
    const [showPerformers, setShowPerformers] = useState(false);
    const [data, setData] = useState(Object.values(props.initialData));

    // TODO: associated with temp notification permission button
    const [notifsEnabled, setNotifsEnabled] = useState(false);
    useEffect(() => {
        setNotifsEnabled(Notification.permission == "granted");
    }, []);

    // init Firebase and service worker
    useEffect(() => {
        const dataRef = ref(getDatabase(firebase), "/data");

        return onValue(dataRef, (snapshot) => {
            setData(snapshot.val());
        });
    }, [])

    useEffect(() => {
        if (!notifsEnabled) return;

        const messaging = getMessaging(firebase);

        getToken(messaging, {vapidKey: "BKTiO6q1fNuQyg35h5_2PAzJhCktM0hur4llEn1gIB5Dlf6oCRCD5RIA4OY6BJvdR1UifBM22hAcKwVMc-OSUnc"})
            .then(token => {
                if (token) {
                    alert(token)
                    // set(ref(getDatabase(firebase), `/fcm/${token}`), Date.now())
                    //     .catch(() => {});
                }
            })

        console.log("registering messages");
        onMessage(messaging, (payload) => {
            new Notification("cc", payload.notification);
            // navigator.serviceWorker.getRegistration("/firebase-cloud-messaging-push-scope")
            //     .then(registration => {
            //         registration?.active?.postMessage(payload)
            //     })
        });

    }, [notifsEnabled]);

    console.log(data);
    const stages = data.map(s=>s.name);
    const stage = data.at(selectedStage)?.name ?? "";
    const performers = data.at(selectedStage)?.performers ?? [""];
    const currentPerformer = data.at(selectedStage)?.currentPerformer ?? 0;

    return (
        <div>
            <div className="mt-12 w-full">
                <p className="text-2xl text-center text-[#0A2240] mb-2.5">LASA Coffeehouse</p>
                <div className="w-[95%] h-0.5 m-auto" style={{background: "linear-gradient(to right, #00000000 10%, #5e6b7c, #00000000 90%)"}}></div>
            </div>

            {!notifsEnabled && <button className={"p-3 bg-indigo-950 mt-10 text-blue-200 rounded-3xl text-sm font-bold"} onClick={(evt) => {
                Notification.requestPermission().then(permission => {
                    setNotifsEnabled(permission == 'granted')
                })
            }}>Enable Notifications</button>}

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
            <PerformerPopup show={showPerformers} performers={performers} currentPerformer={currentPerformer} currentStage={stage} close={()=>setShowPerformers(false)}></PerformerPopup>
        </div>
    )
}