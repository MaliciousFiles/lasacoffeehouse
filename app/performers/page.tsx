"use client";

import React, {useState} from "react";
import PerformerPopup from "@/app/performers/PerformerPopup";
import {AiOutlineUnorderedList} from "react-icons/ai";

const STAGES = ["Main Stage", "Small Stage"];

const PERFORMERS: {[index: string]: string[]} = {
    "Main Stage": ["Performer 1", "Performer 2", "Performer 3", "Performer 4", "Performer 5", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X"],
    "Small Stage": ["Performer 1", "Performer 2", "Performer 3", "Performer 4", "Performer 5", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X", "Performer X"]
};
const CURRENT_PERFORMER: {[index: string]: number} = {
    "Main Stage": 2,
    "Small Stage": 5
};

export default function ViewPerformers() {
    const [selectedStage, setStage] = useState(0);
    const [showPerformers, setShowPerformers] = useState(false);

    const stage = STAGES[selectedStage];
    const performers = PERFORMERS[stage];
    const currentPerformer = CURRENT_PERFORMER[stage];

    return (
        <div>
            <div className="mt-12 w-full">
                <p className="text-2xl text-center text-[#0A2240] mb-2.5">LASA Coffeehouse</p>
                <div className="w-[95%] h-0.5 m-auto" style={{background: "linear-gradient(to right, #00000000 10%, #5e6b7c, #00000000 90%)"}}></div>
            </div>

            <div className="inline-block mt-[2.2rem] text-center">
                <div className="Names whitespace-nowrap w-screen overflow-x-hidden scroll-smooth relative">
                    {STAGES.map(stage =>
                        <div key={stage} className="inline-block text-center -translate-x-2/4 translate-y-0 ml-[50vw] mr-[50vw]">
                            <p className="text-[#0A2240] text-2xl" style={{fontFamily: "Arial Rounded MT Bold"}}>{performers[CURRENT_PERFORMER[stage]]}</p>
                            <p className="text-[#5e6b7c] text-xl mt-[35px]" style={{fontFamily: "Arial Rounded MT Bold"}}>{performers[CURRENT_PERFORMER[stage]+1]}</p>
                            <p className="text-[#5e6b7c] text-xl mt-[35px]" style={{fontFamily: "Arial Rounded MT Bold"}}>{performers[CURRENT_PERFORMER[stage]+2]}</p>
                        </div>
                    )}
                </div>
                <div align="center" className="text-[#5e6b7c] mt-[1.2rem] rounded-[30px] cursor-pointer inline-block" onClick={()=>setShowPerformers(true)}>
                    <AiOutlineUnorderedList className="inline-block" />
                    <p className="inline-block ml-2.5 mr-0 my-2.5">View All</p>
                </div>
            </div>
            <div className="bg-[#e7e7e7] text-[#0A2240] fixed -translate-x-2/4 whitespace-nowrap px-[35px] py-0 rounded-[40px] left-2/4 bottom-12" style={{filter: "drop-shadow(0px 3px 5px #a6a6a6)"}}>
                {([] as any[]).concat(...STAGES.map((s, i) => [
                    <div key={`div${i}`} className={"inline-block mr-[-17px] ml-[-17px] my-2.5 px-[17px] py-1.5"+(i === selectedStage ? " rounded-[30px]" : "")} style={i === selectedStage ? {background: "white", filter: "drop-shadow(0px 3px 5px #a9a9a9)"} : {}}>
                        <p className="m-0 cursor-pointer" onClick={() => {
                            setStage(i);

                            let namesDiv = document.querySelector(".Names");
                            namesDiv!.scrollTo((namesDiv!.children[i] as HTMLElement).offsetLeft-visualViewport!.width/2, 0);
                        }}>{s}</p>
                    </div>, <span key={`span${i}`} className="mx-[15px] my-0"></span>]))
                .slice(0, -1)}</div>
            <PerformerPopup show={showPerformers} performers={performers} currentPerformer={currentPerformer} currentStage={STAGES[selectedStage]} close={()=>setShowPerformers(false)}></PerformerPopup>
        </div>
    )
}