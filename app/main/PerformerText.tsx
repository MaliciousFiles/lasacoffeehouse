import {Performer} from "@/app/util/firebase/init";
import React, {useEffect, useRef} from "react";
import {setCurrentPerformer} from "@/app/manage/FCMManager";
import {getSongsDisplay} from "@/app/util/util";

export default function PerformerText(props: {performer: Performer, expanded: boolean}) {
    const {performer, expanded} = props;

    return (
        <div className={`pl-4 pr-1 flex-grow my-auto overflow-hidden text-left`}>
            <p className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-ellipsis`}>{performer.name}</p>
            {performer.artists &&
                <p className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-xs text-gray-500 text-ellipsis`}>{performer.artists.join(", ")}</p>}
            {performer.songs &&
                <p className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-xs text-gray-500 text-ellipsis`}>
                    {getSongsDisplay(performer)}
                </p>}
        </div>
    )
}