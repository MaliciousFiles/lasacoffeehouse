import React, {useEffect, useRef} from "react";

export type InputList = {[i: string]: string};

export default function Popup(props: {title: string, open: boolean, colorScheme: {border: string, bg: string, text: string, textLight: string}, close?: (cancelled: boolean, inputs: InputList)=>void, defaultValues?: InputList, children: React.JSX.Element[] | React.JSX.Element}) {
    const {title, open, colorScheme} = props;
    const defaultValues = props.defaultValues ?? {};

    const childrenContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        childrenContainer.current?.querySelectorAll("input")
            .forEach(input => input.value = defaultValues[input.alt] ?? "");
    }, [open]);

    let closeable = !!props.close;
    let close = (cancelled: boolean) => {
        const inputs: InputList = {};
        childrenContainer.current?.querySelectorAll("input")
            .forEach(input => inputs[input.alt] = input.value);

        props.close && props.close(cancelled, inputs);
    };

    return (
        <div>
            {/* Popup */}
            <div onClick={evt => {if (closeable && (evt.target as HTMLElement).id === "background") close(true)}} className={"z-50 w-full h-full fixed top-0 " + (open ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: open ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
                <div id="background" className={"w-full h-full "+(open ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                    <div className={`py-5 fixed overflow-hidden w-4/5 h-fit -translate-x-1/2 -translate-y-1/2 rounded-[30px] left-1/2 top-1/2`} style={{background: "white"}}>
                        <p className={"text-xl"} >{title}</p>

                        <div ref={childrenContainer} className={"flex flex-col justify-between mt-4"}>
                            {props.children}
                        </div>

                        {closeable &&
                            <div className={"mx-3 flex justify-evenly"}>
                                <button onClick={() => close(true)} className={`inline-block px-5 ${colorScheme.border} ${colorScheme.text} rounded-xl py-1.5`}>Cancel</button>
                                <button onClick={() => close(false)} className={`inline-block px-5 ${colorScheme.bg} ${colorScheme.textLight} rounded-xl py-1.5`}>Continue</button>
                            </div>}
                    </div>
                </div>
            </div>
        </div>
    )
}