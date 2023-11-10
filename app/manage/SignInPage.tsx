"use client";

import Image from "next/image";
import React, {useRef, useState} from "react";
import {AiOutlineWarning} from "react-icons/ai";
import {getAuth, signInWithEmailAndPassword} from "@firebase/auth";
import firebase from "@/app/util/firebase/init";

export default function SignInPage(props: {logIn: ()=>void}) {
    const [error, setError] = useState<string>();

    const warningRef = useRef<HTMLDivElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const tryLogIn = async (evt: React.MouseEvent<HTMLButtonElement>) => {
        try {
            await signInWithEmailAndPassword(getAuth(firebase),
                `${usernameRef.current!.value}@username.com`,
                passwordRef.current!.value);

            props.logIn();
        } catch {
            let button = evt.target as HTMLButtonElement;

            if (error) {
                warningRef.current!.animate(
                    {
                        color: ["rgb(225 29 72)", "rgb(238,157,180)", "rgb(225 29 72)"]
                    },
                    {
                        easing: "ease-out",
                        duration: 850
                    }
                )
            }
            button.animate(
                {
                    marginLeft: ["0", "0.5rem", "-0.5rem", "0"],
                },
                {
                    easing: "ease-out",
                    duration: 175,
                    iterations: 2,
                    delay: 100
                }
            )

            setError("Invalid username or password");
        }
    }

    return (
        <div className="w-full h-full bg-left" style={{backgroundImage: "url('/images/background.jpeg')"}}>
            <div className="absolute rounded-[20px] w-4/5 h-2/3 left-1/2 top-2/4 -translate-x-2/4 -translate-y-2/4 bg-white">
                <div className="mt-6">
                    <Image className="inline-block -translate-y-0.5" src="/images/logo.svg" height={27} width={27} alt="LASA logo"></Image>
                    <div className="ml-2 inline-block">
                        <p className="text-[#051324] inline-block font2 font-semibold">LASA&nbsp;</p>
                        <p className="text-[#0A2240] inline-block font2 font-[530]">Coffee</p>
                        <p className="text-[#5e6b7c] inline-block font2 font-[530]">house</p>
                    </div>
                </div>

                <div className="mt-3 mx-2 text-[1.35rem]">
                    <p>Enter Manager</p>
                    <p>Credentials</p>
                </div>
                <div ref={warningRef} className={`text-sm w-full text-rose-600 mt-1.5 absolute transition-opacity duration-[0.3s] opacity-${error ? '100' : '0'}`}>
                    <AiOutlineWarning className="-translate-y-0.5 inline-block" />
                    <span className="inline-block mt-0 mb-2">&nbsp;{error}</span>
                </div>
                <div className="mt-8 w-full">
                    <input ref={usernameRef} autoCapitalize={"off"} autoCorrect={"off"} className="bg-gray-100 rounded-md py-2 px-3 w-3/4" placeholder="Username"></input>
                    <input ref={passwordRef} type="password" className="bg-gray-100 rounded-md mt-5 py-2 px-3 w-3/4" placeholder="Password"></input>
                    <br />
                    <button onClick={tryLogIn} className={`rounded-[0.4rem] bg-[#0A2240] text-blue-50 py-1 mt-5 w-[calc(75%-2rem)]`}>Log In</button>
                </div>
            </div>
        </div>
    )
}