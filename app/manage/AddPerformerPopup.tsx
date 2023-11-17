import React, {useEffect, useRef, useState} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {parseArtists} from "@/app/util/util";

export default function AddPerformerPopup(props: {addingPerformer: number, cancel: ()=>void, add: (name: string, artists: string[])=>void}) {
    const {addingPerformer} = props;

    const nameRef = useRef<HTMLInputElement>(null);
    const artistRef = useRef<HTMLInputElement>(null);
    const addRef = useRef<HTMLButtonElement>(null);

    const [valid, setValid] = useState(false);

    const cancel = () => {
        props.cancel();
        nameRef.current!.value = "";
        artistRef.current!.value = "";
        setValid(false);
    }

    const add = () => {
        props.add(nameRef.current!.value, parseArtists(artistRef.current!.value));
        cancel();
    }

    useEffect(() => {
        if (addingPerformer != -1) {
            new Promise(r => setTimeout(r, 50)).then(() => {
                nameRef.current?.focus();
                nameRef.current?.select();
            });
        }
    }, [addingPerformer]);

    return (
        <div onClick={evt => {if ((evt.target as HTMLElement).id === "background") cancel()}} className={"z-50 w-full h-full fixed top-0 " + (addingPerformer !== -1 ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: addingPerformer !== -1 ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
            <div id="background" className={"w-full h-full "+(addingPerformer !== -1 ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                <div className="flex flex-col w-4/5 h-2/5 fixed overflow-hidden -translate-x-2/4 -translate-y-2/4 rounded-[30px] left-2/4 top-2/4" style={{background: "white"}}>
                    <h2 className={"mt-5"} >Add Performer</h2>

                    <input onKeyDown={evt => {
                        if (evt.key === "Escape") cancel();
                        else if (evt.key === "Enter" && valid) add();
                    }} onChange={evt => setValid((evt.target as HTMLInputElement).value.trim() != "")}
                           ref={nameRef} autoCapitalize={"off"} autoCorrect={"off"} className="m-auto bg-gray-100 rounded-md py-2 px-3 w-3/4" placeholder="Name" />
                    <input onKeyDown={evt => {
                        if (evt.key === "Enter") {/* TODO: make this store as chips or something */}
                    }} ref={artistRef} autoCapitalize={"off"} autoCorrect={"off"} className="mx-auto bg-gray-100 rounded-md py-2 px-3 w-3/4" placeholder="Artist 1, Artist 2, ..." />

                    <div className={"w-2/3 m-auto flex justify-between"}>
                        <button onClick={cancel} className={"inline-block w-16 bg-red-400 text-red-200 rounded-xl p-1.5"}>Cancel</button>
                        <button ref={addRef} disabled={!valid} onClick={add} className={`inline-block w-16 ${valid ? "bg-blue-400 text-blue-200" : "bg-blue-200 text-blue-100"} rounded-xl p-1.5`}>Add</button>
                    </div>
                </div>
            </div>
        </div>
    )
}