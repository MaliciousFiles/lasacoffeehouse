import {TbTriangleFilled} from "react-icons/tb";
import {BiSolidSquareRounded} from "react-icons/bi";
import React from "react";

export default function StageSelector(props: {stages: string[], selected: number, setSelected: (i: number) => void, className?: string}) {
    const {stages, selected, setSelected, className} = props;

    return (
        <div
            className={`flex justify-evenly bg-gray-50 w-full ${className}`}>
            {stages.map((s, i) =>
                <div key={"stage" + i + s} onClick={() => setSelected(i)}
                     className={`flex-grow flex ${i == selected ? "bg-gray-200" : ""}`}>
                    <div className={"my-auto w-1/3"}>
                        {i == 0 ?
                            <TbTriangleFilled className={`mx-auto ${i == selected ? "text-pink-600" : "text-pink-300"}`}/>
                            : <BiSolidSquareRounded
                                className={`mx-auto ${i == selected ? "text-emerald-500" : "text-emerald-200"}`}/>
                        }
                    </div>
                    <p className={`my-auto flex-grow text-xs text-left font-heavy ${i == selected ? "text-gray-700" : "text-gray-300"}`}>{s}</p>
                </div>
            )}
        </div>
    )
}