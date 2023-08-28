import React, {useState} from "react";
import {FaBell, FaRegBell} from "react-icons/fa";

export default function PerformerPopup(props: {
    show: boolean, performers: string[], currentPerformer: number, currentStage: string, close: () => void
}) {
    const {show, performers, currentPerformer, currentStage, close} = props;

    const [notifs, setNotifs] = useState(new Set());

    return (
        <div className={"w-full h-full fixed top-0 " + (show ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: show ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}} onClick={e => (e.target as HTMLElement).classList.contains("PopupContainer") && close()}>
            <div className={"PopupContainer w-full h-full "+(show ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                <div className="w-4/5 h-4/5 fixed overflow-hidden -translate-x-2/4 -translate-y-2/4 rounded-[30px] left-2/4 top-2/4" style={{background: "white"}}>
                    <div className="text-[1.35em] text-[#0A2240] inline-block w-full h-[4.4rem] shadow-[0_2px_10px_-5px] rounded-t-[30px] border-b-[#A6A6A6] border-b-2">
                        <p>{currentStage} Performers</p>
                    </div>
                    <div className="w-full h-[calc(100%_-_4.4rem_-_2px)] overflow-x-hidden overflow-y-auto flex-col">
                        {([] as any[]).concat(...performers.map((s,i) =>
                            [<div key={`1${i}`} className={"items-center flex "+(i === currentPerformer ? "text-[#0A2240]" : "text-[#5e6b7c]")}>
                                <div onClick={()=>{
                                    if (notifs.has(i)) notifs.delete(i);
                                    else notifs.add(i);

                                    setNotifs(new Set(notifs));

                                    new Promise(async () => {
                                        await new Promise(resolve => setTimeout(resolve, 2000));

                                        Notification.requestPermission().then((permission) => {
                                            new Notification("Title", {
                                                body: "body"
                                            });
                                        })
                                    }).then();
                                }}>
                                    {
                                        notifs.has(i) ? <FaBell className="h-5 ml-[30px]" /> : <FaRegBell className="h-5 ml-[30px]" />
                                    }
                                </div>
                                <p className={"inline-block text-[17px] ml-[15px] font2" + (i < currentPerformer ? " line-through" : i === currentPerformer ? " text-[22px]" : "")}>
                                    {s}
                                </p>
                            </div>, <div key={`2${i}`} className="flex bg-[#cbcbcb] w-[90%] h-px m-auto"></div>]
                        )).slice(0, -1)}
                    </div>
                </div>
            </div>
        </div>
    )
}