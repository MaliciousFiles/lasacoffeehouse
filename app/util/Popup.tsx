import {FaEllipsisVertical} from "react-icons/fa6";
import React, {useEffect, useRef, useState} from "react";
import Dropdown from "@/app/util/Dropdown";
import scrollIntoView from "scroll-into-view-if-needed";
import {Performer} from "@/app/util/firebase/init";

export default function Popup(props: {title: string, open: boolean, dimensions: string, colorScheme: {border: string, bg: string, text: string, textLight: string}, closeable?: boolean, onOpen?: ()=>void, onClose?: (cancelled: boolean)=>void, children: React.JSX.Element[]}) {
    const {title, open, dimensions, colorScheme, onOpen, onClose} = props;
    const closeable = props.closeable ?? true;

    const [popupOpen, setPopupOpen] = useState(open);
    const childrenContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        open && onOpen && onOpen();

        setPopupOpen(open);
        new Promise(r => setTimeout(r, 75)).then(() => {
            const input = childrenContainer.current?.querySelectorAll("input")[0];
            input?.focus();
            input?.select();
        });
    }, [open]);

    function close(cancelled: boolean) {
        childrenContainer.current?.querySelectorAll("input")
            .forEach(input => input.value = "");

        onClose && onClose(cancelled);
        setPopupOpen(false);
    }

    return (
        <div>
            {/* Popup */}
            <div onClick={evt => {if (closeable && (evt.target as HTMLElement).id === "background") setPopupOpen(false)}} className={"z-50 w-full h-full fixed top-0 " + (popupOpen ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: popupOpen ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
                <div id="background" className={"w-full h-full "+(popupOpen ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                    <div className={`justify-between flex flex-col ${dimensions} fixed overflow-hidden -translate-x-1/2 -translate-y-1/2 rounded-[30px] left-1/2 top-1/2`} style={{background: "white"}}>
                        <p className={"text-xl mt-5"} >{title}</p>

                        <div ref={childrenContainer} className={"flex flex-grow flex-col justify-between mb-6 mt-8"}>
                            {props.children}
                        </div>

                        {closeable &&
                            <div className={"w-2/3 mb-5 mx-auto flex justify-between"}>
                                <button onClick={() => close(true)} className={"inline-block w-16 bg-red-400 text-red-200 rounded-xl p-1.5"}>Cancel</button>
                                <button onClick={() => close(false)} className={`inline-block w-16 bg-blue-400 text-blue-200 rounded-xl p-1.5`}>Select</button>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}