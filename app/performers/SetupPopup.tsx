import React, {useEffect, useState} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

enum Prerequisite {
    OPEN_SAFARI,
    DOWNLOAD_PWA
}

function NoSSRSetupPopup(props: {show: boolean, setNotifsStatus: (perm: NotificationPermission)=>void}) {
    const {show, setNotifsStatus} = props;

    let prereq = undefined;
    if (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform)) {
        if (!("Notification" in window)) {
            prereq = Prerequisite.OPEN_SAFARI;
        } else if (!window.matchMedia('(display-mode: standalone)').matches) {
            prereq = Prerequisite.DOWNLOAD_PWA;
        }
    }

    return (
        <div className={"w-full h-full fixed top-0 " + (show ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: show ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
            <div className={"w-full h-full "+(show ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                <div className="w-4/5 h-4/5 fixed overflow-hidden -translate-x-2/4 -translate-y-2/4 rounded-[30px] left-2/4 top-2/4" style={{background: "white"}}>
                    {
                        prereq === Prerequisite.OPEN_SAFARI ? (
                            <div>
                                <p className="text-2xl mt-8">Open in Safari</p>
                                <Image className="drop-shadow-lg m-auto mt-8 mb-11" src="/images/safari.png" width={80} height={80} alt="Safari icon" />
                                <p className="mx-4">Due to iOS limitations, please open this webpage in the Safari app to continue setup.</p>
                                <Link className="inline-block text-white bg-blue-600 px-4 py-2 rounded-xl mt-10" href="https://apps.apple.com/us/app/safari/id1146562112">Open in App Store</Link>
                            </div>
                        ) : prereq === Prerequisite.DOWNLOAD_PWA ? (
                            <div>
                                <p className="text-2xl mt-8">Add to Home Screen</p>
                                <Image className="drop-shadow-lg m-auto mt-8" width={200} height={0} src="/images/share_button.jpeg" alt="Share button" />
                                <Image className="drop-shadow-lg m-auto mt-8" src="/images/add_pwa.jpeg" width={150} height={0} alt="Add to home screen" />
                                <p className="mx-4 mt-9">For notifications, please install this website as a Progressive Web App (PWA).</p>
                            </div>
                        ) : Notification.permission === 'denied' ? (
                            <div>
                                <p className="text-2xl mt-8">Notifications Denied</p>
                                <Image className="drop-shadow-lg m-auto mt-8" width={115} height={0} src="/images/sad.png" alt="Sad face" />
                                <p className="mx-4 mt-16">Notification permissions have been explicitly denied. Please enable them to continue. </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-2xl mt-8">Enable Notifications</p>
                                <Image className="drop-shadow-lg m-auto mt-8" width={115} height={0} src="/images/notifs.png" alt="Notifications" />
                                <p className="mx-4 mt-7">To be notified of upcoming performances, please enable notifications.</p>
                                <button className="inline-block text-white bg-blue-600 px-4 py-2 rounded-xl mt-8" onClick={() => {
                                    Notification.requestPermission().then(setNotifsStatus);
                                }}>Enable Notifications</button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

const SetupPopup = dynamic(() => Promise.resolve(NoSSRSetupPopup), {ssr: false});
export default SetupPopup;