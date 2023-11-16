import React, {useEffect, useRef} from "react";

export default function Popup(props: {title: string, open: boolean, colorScheme: {border: string, bg: string, text: string, textLight: string}, close?: (cancelled: boolean)=>void, children: React.JSX.Element[] | React.JSX.Element}) {
    const {title, open, colorScheme, close} = props;

    const childrenContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        childrenContainer.current?.querySelectorAll("input")
            .forEach(input => input.value = "");

        new Promise(r => setTimeout(r, 75)).then(() => {
            const input = childrenContainer.current?.querySelectorAll("input")[0];
            input?.focus();
            input?.select();
        });
    }, [open]);

    return (
        <div>
            {/* Popup */}
            <div onClick={evt => {if (close && (evt.target as HTMLElement).id === "background") close(true)}} className={"z-50 w-full h-full fixed top-0 " + (open ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: open ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
                <div id="background" className={"w-full h-full "+(open ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                    <div className={`py-5 fixed overflow-hidden w-4/5 h-fit -translate-x-1/2 -translate-y-1/2 rounded-[30px] left-1/2 top-1/2`} style={{background: "white"}}>
                        <p className={"text-xl"} >{title}</p>

                        <div ref={childrenContainer} className={"flex flex-col justify-between mb-6 mt-2"}>
                            {props.children}
                        </div>

                        {close &&
                            <div className={"mx-3 flex justify-evenly"}>
                                <button onClick={() => close(true)} className={`inline-block px-5 ${colorScheme.border} ${colorScheme.text} rounded-xl py-1.5`}>Cancel</button>
                                <button onClick={() => close(false)} className={`inline-block px-5 ${colorScheme.bg} ${colorScheme.textLight} rounded-xl py-1.5`}>Submit</button>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}