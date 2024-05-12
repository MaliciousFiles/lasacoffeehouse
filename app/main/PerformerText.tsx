import {Performer} from "@/app/util/firebase/init";
import React, {useEffect, useRef} from "react";
import {setCurrentPerformer} from "@/app/manage/FCMManager";

export default function PerformerText(props: {performer: Performer, expanded: boolean}) {
    const {performer, expanded} = props;

    return (
        <div className={`pl-4 pr-1 flex-grow my-auto overflow-hidden text-left`}>
            <p className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-ellipsis`}>{performer.name}</p>
            {performer.artists &&
                <p className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-xs text-gray-500 text-ellipsis`}>{performer.artists.join(", ")}</p>}
            {performer.songs &&
                <div className={`${!expanded ? "h-5 whitespace-nowrap" : ""} leading-5 overflow-hidden my-auto text-xs text-gray-500 text-ellipsis`}>{([] as any[]).concat(...performer.songs.map(s=> [
                    <p key={s.name+"p3"} className={"inline"}>&quot;</p>,
                    <p key={s.name+"b1"} className={"inline"}>{s.name}</p>,
                    <p key={s.name+"p4"} className={"inline"}>&quot;</p>,
                    !s.original && s.artist && <p key={s.name+"p1"} className={"inline"}>&nbsp;by</p>,
                    (s.original || s.artist) && <p key={s.name+"b2"} className={"inline"}>&nbsp;{s.original ? "(original)" : s.artist}</p>,
                    <p key={s.name+"p2"} className={"inline"}>,&nbsp;</p>
                ])).filter(o=>o).slice(0, -1)}</div>}
        </div>
    )
}