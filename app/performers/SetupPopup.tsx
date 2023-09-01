import React, {useEffect, useState} from "react";

export default function SetupPopup(props: {show: boolean}) {
    const {show} = props;

    const [msg, setMsg] = useState<string>("");

    useEffect(() => {
        if (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform)) {
            if (!("Notification" in window)) {
                setMsg("iOS - not Safari");
            } else if (window.matchMedia('(display-mode: standalone)').matches) {
                setMsg("iOS - PWA");
            } else {
                setMsg("iOS - Safari");
            }
        } else {
            setMsg("not iOS")
        }
    }, []);

    return (
        <div className={"w-full h-full fixed top-0 " + (show ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: show ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
            <div className={"w-full h-full "+(show ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                <div className="w-4/5 h-4/5 fixed overflow-hidden -translate-x-2/4 -translate-y-2/4 rounded-[30px] left-2/4 top-2/4" style={{background: "white"}}>
                    <p>{msg}</p>
                    <button onClick={()=>Notification.requestPermission().then((perm) => {

                    })}>Enable Notifs</button>
                </div>
            </div>
        </div>
    )
}