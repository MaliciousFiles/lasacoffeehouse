import {useRef, useState} from "react";
import {getAuth, signInWithEmailAndPassword} from "@firebase/auth";
import firebase from "@/app/util/firebase/init";
import {AiOutlineWarning} from "react-icons/ai";

export default function SignIn(props: {onLogin: () => void}) {
    const [error, setError] = useState<string>();

    const warningRef = useRef<HTMLDivElement>(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const tryLogIn = async (evt: React.MouseEvent<HTMLButtonElement>) => {
        try {
            await signInWithEmailAndPassword(getAuth(firebase),
                `${usernameRef.current!.value}@username.com`,
                passwordRef.current!.value);

            props.onLogin();
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
        <>
            <div className="mt-4 mx-2 text-[1.35rem]">
                <p>Enter Manager</p>
                <p>Credentials</p>
            </div>
            <div ref={warningRef}
                 className={`text-sm w-full text-rose-600 mt-2.5 absolute transition-opacity duration-[0.3s] opacity-${error ? '100' : '0'}`}>
                <AiOutlineWarning className="-translate-y-0.5 inline-block"/>
                <span className="inline-block mt-0 mb-2">&nbsp;{error}</span>
            </div>
            <div className={"flex-col mt-8 mb-7 justify-between"}>
                <div className="w-full">
                    <input ref={usernameRef} autoCapitalize={"off"} autoCorrect={"off"}
                           className="bg-gray-100 rounded-md py-2 px-3 w-3/4" placeholder="Username"></input>
                    <input ref={passwordRef} type="password" className="bg-gray-100 rounded-md mt-5 py-2 px-3 w-3/4"
                           placeholder="Password"></input>
                </div>
                <button onClick={tryLogIn}
                        className={`rounded-[0.4rem] bg-[#0A2240] text-blue-50 py-1 mt-8 w-[calc(75%-2rem)]`}>Log In
                </button>
            </div>
        </>
    )
}