import {FaEllipsisVertical} from "react-icons/fa6";
import React, {useEffect, useRef, useState} from "react";
import scrollIntoView from "scroll-into-view-if-needed";
import {Performer} from "@/app/util/firebase/init";

export default function SetCurrentPerformer(props: {performers: Performer[], performer: number, setPerformer: (performer: number) => void}) {
    const {performers, performer, setPerformer} = props;

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedPerformer, setSelectedPerformer] = useState(performer);

    const scrollArea = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSelectedPerformer(performer);

        let child;
        if (!(child = scrollArea.current?.childNodes[performer*2])) return;

        scrollIntoView(child as Element, {behavior: 'instant', scrollMode: 'always'});
    }, [performer]);

    return (
        <div>
            {/* Popup */}
            <div onClick={evt => {if ((evt.target as HTMLElement).id === "background") setPopupOpen(false)}} className={"z-50 w-full h-full fixed top-0 " + (popupOpen ? "opacity-100 visible transition-opacity duration-[0.3s]" : "opacity-0 invisible")} style={{background: "rgba(0, 0, 0, 0.5)", transition: popupOpen ? "" : "opacity 0.2s 0.1s, visibility 0.4s"}}>
                <div id="background" className={"w-full h-full "+(popupOpen ? "transition-all duration-[0.4s] scale-100" : "transition-all duration-[0.3s] scale-[0.7]")}>
                    <div className="justify-between flex flex-col w-4/5 h-3/5 fixed overflow-hidden -translate-x-2/4 -translate-y-2/4 rounded-[30px] left-2/4 top-2/4" style={{background: "white"}}>
                        <h2 className={"mt-5"} >Set Current Performer</h2>

                        <div ref={scrollArea} className={"bg-slate-300 rounded-xl w-3/5 m-auto h-3/5 text-slate-900 overflow-y-scroll shadow-inner"}>
                            {([] as any[]).concat(...performers.map((p, i) => [
                                <div key={p.name+i+"p"} className={"py-2.5"+(i === selectedPerformer ? " bg-blue-500 text-blue-200" : "")}
                                    onClick={() => setSelectedPerformer(i)} >{p.name}</div>,
                                <div key={p.name+i+"s"} className={"bg-neutral-400 w-full h-px"} />
                                ])).slice(0,-1)}
                        </div>

                        <div className={"w-2/3 mb-5 mx-auto flex justify-between"}>
                            <button onClick={() => setPopupOpen(false)} className={"inline-block w-16 bg-red-400 text-red-200 rounded-xl p-1.5"}>Cancel</button>
                            <button onClick={() => {
                                if (selectedPerformer !== performer) setPerformer(selectedPerformer);
                                setPopupOpen(false);
                            }} className={`inline-block w-16 bg-blue-400 text-blue-200 rounded-xl p-1.5`}>Select</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Button */}
            <div className={"bg-red-100 shadow-sm w-3/5 text-red-300 text-xl rounded-xl flex text-center mx-auto mt-5"}>
                <button className={"py-3 mx-auto"} onClick={() => {
                    if (performer+1 < performers.length) setPerformer(performer+1);
                }}>Next Performer</button>
                <div className={"w-px bg-red-200"} />
                <button onClick={() => setPopupOpen(true)}><FaEllipsisVertical /></button>
            </div>
        </div>
    )
}