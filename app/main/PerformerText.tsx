import {Performer} from "@/app/util/firebase/init";
import React, {useEffect, useRef} from "react";
import {setCurrentPerformer} from "@/app/manage/FCMManager";

export default function PerformerText(props: {performer: Performer, first: boolean, expanded: boolean}) {
    const {performer, first, expanded} = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const byRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (containerRef.current && byRef.current) {
            const containerSize = containerRef.current.getBoundingClientRect();
            const byPos = byRef.current.getBoundingClientRect().y;
            const lowestPos = containerRef.current.lastElementChild!.getBoundingClientRect().y;

            byRef.current.textContent = !expanded && byPos < containerSize.y + containerSize.height/2 ? "  by" : "by";

            first && containerRef.current.parentElement?.parentElement?.classList.toggle("pt-2", lowestPos >= containerSize?.y + containerSize?.height/2);
        }
    }, [expanded, first, performer, containerRef, byRef]);

    return (
        <div ref={containerRef} className={"pl-4 pr-1 h-full text-left flex-wrap flex overflow-hidden whitespace-nowrap my-auto flex-grow"}>
            <p className={`${!expanded ? "h-5" : "whitespace-normal break-words"} leading-5 overflow-hidden my-auto text-ellipsis`}>{performer.name}</p>

            {expanded && <div className={"basis-full"}></div>}
            {performer.artists &&
                <p ref={byRef} className={`my-auto h-5 leading-5 text-center overflow-hidden whitespace-nowrap text-ellipsis text-xs text-gray-500`}>by</p>}
            {performer.artists && ([] as any[]).concat(...performer.artists.map((a, i) => [
                <p key={"artist" + i}
                   className={"my-auto h-5 leading-5 text-center overflow-hidden inline whitespace-nowrap text-ellipsis text-xs text-gray-500 font-semiheavy"}>&nbsp;{a}</p>,
                <p key={"c" + i}
                   className={"my-auto h-5 leading-5 text-center overflow-hidden inline whitespace-nowrap text-ellipsis text-xs text-gray-500 font-light"}>,</p>
            ])).slice(0, -1)}
        </div>
    )
}