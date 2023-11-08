"use client";

import firebase, {genUID} from "@/app/util/firebase/init";
import {getAuth} from "@firebase/auth";
import React, {useContext, useEffect, useRef, useState} from "react";
import SignInPage from "@/app/manage/SignInPage";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";
import Dropdown from "@/app/util/Dropdown";
import {RiDraggable} from "react-icons/ri";
import {FiCheck, FiEdit2, FiPlus, FiTrash2, FiX} from "react-icons/fi";
import {
    removePerformer,
    renamePerformer,
    setCurrentPerformer,
    updateClients,
    updatePerformers
} from "@/app/manage/FCMManager";
import AddPerformerPopup from "@/app/manage/AddPerformerPopup";
import SetCurrentPerformer from "@/app/manage/SetCurrentPerformer";
import scrollIntoView from "scroll-into-view-if-needed";
import Loading from "@/app/util/Loading";

export default function ManagePerformers() {
    const data = useContext(FirebaseContext);

    const [firebaseLoading, setFirebaseLoading] = useState(false);

    useEffect(() => {
        // the user did something, therefore update clients with new data
        if (firebaseLoading) {
            let current = data[stage].currentPerformer;
            let performers = data[stage].performers;

            updateFirebase(jwt => updateClients(jwt, stage, performers[current], performers[current+1]), false);
        }

        setFirebaseLoading(false);
    }, [data]);

    const updateFirebase = (func: (jwt: string)=>Promise<void>, fromUser: boolean = true) => {
        if(fromUser) setFirebaseLoading(true);

        getAuth(firebase).currentUser?.getIdToken().then(func);
    }

    const [loggedIn, setLoggedIn] = useState(getAuth(firebase).currentUser !== null);
    const [stage, setStage] = useState(Object.keys(data)[0]);

    const [editingName, setEditingName] = useState(-1);
    const [origName, setOrigName] = useState("");
    useEffect(() => {
        const name = document.getElementById("name"+editingName);
        if (!name) return;

        setOrigName(name.textContent ?? "");

        const range = document.createRange();
        range.setStart(name, 0);

        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }, [editingName]);

    const [removingPerformer, setRemovingPerformer] = useState(-1);

    const confirm = (value: boolean) => {
        if (editingName !== -1) {
            const name = document.getElementById("name"+editingName);

            if (name) {
                if (value) {
                    updateFirebase(jwt => renamePerformer(jwt, stage, editingName, name.textContent!));
                } else {
                    name.textContent = origName;
                }
            }

            setEditingName(-1);
        } else if (removingPerformer !== -1) {
            if (value) {
                updateFirebase(jwt => removePerformer(jwt, stage, data[stage].performers, removingPerformer));
            }

            setRemovingPerformer(-1);
        }
    };

    const [addingPerformer, setAddingPerformer] = useState(-1);

    const [dragging, setDragging] = useState(-1);
    const performersContainer = useRef<HTMLDivElement>(null);
    const svgOffset = useRef({x: 0, y: 0});
    const performerPositions = useRef<number[]>([]);

    const scrollBy = useRef(0);

    const movePerformer = (parent: HTMLElement, idx: number, direction: 1 | -1) => {
        let pos = performerPositions.current[idx]
        let idx2 = performerPositions.current.indexOf(pos + direction);

        const marker = document.createElement("div");
        const child1 = parent.childNodes[pos * 2];
        const child2 = parent.childNodes[(pos + direction) * 2];

        parent.insertBefore(marker, child1);
        parent.insertBefore(child1, child2);
        parent.insertBefore(child2, marker);
        parent.removeChild(marker);

        performerPositions.current[idx] += direction;
        performerPositions.current[idx2] -= direction;
    }

    const startDrag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        navigator.vibrate && navigator.vibrate(100);

        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        let pos = touchEvt ? touchEvt.touches[0] : mouseEvt!;

        performerPositions.current = data[stage].performers.map((_, i)=>i);
        svgOffset.current = {x: pos.clientX - row.offsetLeft, y: pos.clientY - row.offsetTop + performersContainer.current!.scrollTop};
        row.style.width = row.offsetWidth+'px';
    }

    const checkRowMove = (row: HTMLElement, idx: number) => {
        const currentIdx = performerPositions.current[idx];
        const scroll = performersContainer.current!.scrollTop;

        if (currentIdx > 0 && row.offsetTop + row.offsetHeight + scroll < row.parentElement!.offsetTop) {
            movePerformer(performersContainer.current!, idx, -1);
        } else if (currentIdx < data[stage].performers.length && row.offsetTop + scroll > row.parentElement!.offsetTop + row.parentElement!.offsetHeight) {
            movePerformer(performersContainer.current!, idx, 1);
        }
    }
    const drag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        if (dragging === -1) setDragging(idx);

        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        let mousePosContainer = touchEvt ? touchEvt.touches[0] : mouseEvt!;

        let containerTop = performersContainer.current!.offsetTop;
        let containerBottom = containerTop + performersContainer.current!.offsetHeight;

        const setScroll = (scroll: number) => {
            if (scrollBy.current === scroll) return;
            scrollBy.current = scroll;

            if (scroll != 0) {
                (async () => {
                    const container = performersContainer.current!;
                    while (scrollBy.current != 0) {
                        container.scrollBy({top:scrollBy.current, behavior: "instant"});
                        checkRowMove(row, idx);

                        await new Promise(r => setTimeout(r, 1));
                    }
                })();
            }
        }

        let top = Math.max(containerTop, Math.min(containerBottom - row.offsetHeight, mousePosContainer.clientY - svgOffset.current.y));
        row.style.top = top+'px';

        let bottom = top + row.offsetHeight;
        if (containerBottom-bottom < 10) {
            setScroll(1);
        } else if (top-containerTop < 10) {
            setScroll(-1);
        } else {
            setScroll(0);
        }

        checkRowMove(row, idx);
    }
    const stopDrag = (evt: React.UIEvent) => {

        let row = (evt.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        if (performerPositions.current.length) {
            const performers = performerPositions.current
                .reduce((arr, performer, idx) => {arr[performer] = idx; return arr;}, [] as number[]) // invert
                .map(i => data[stage].performers[i]);
            updateFirebase(jwt => updatePerformers(jwt, stage, performers));
            setDragging(-1);
        }

        scrollBy.current = 0;
        row.style.left = row.style.top = row.style.width = '';
        performerPositions.current = [];
        svgOffset.current = {x: 0, y: 0};
    }

    const scroll = (ifNeeded: boolean) => {
        let child;
        if (!(child=performersContainer.current?.childNodes[data[stage].currentPerformer*2])) return;

        scrollIntoView(child as Element, {
            behavior: 'smooth',
            scrollMode: ifNeeded ? 'if-needed' : 'always'
        })
    }

    // scroll to current performer if necessary when data changes
    useEffect(() => scroll(true), [data]);
    useEffect(() => scroll(false), [stage]);
    useEffect(() => scroll(false), []);

    const genDivider = (i: number) => {
        return <div className={"w-full flex" + (i == -1 ? " mt-2" : "")} key={"s"+i}>
            <div className={"bg-neutral-400 inline-block w-1/3 h-px m-auto"} />
            <button className={"bg-blue-300 inline-block text-blue-100 rounded-lg p-1"}
                    onClick={() => setAddingPerformer(i+1)}><FiPlus /></button>
            <div className={"bg-neutral-400 inline-block w-1/3 h-px m-auto"} />
        </div>
    }

    return !loggedIn ? <SignInPage logIn={()=>setLoggedIn(true)} /> : (
        <div className="h-full w-full">
            <Loading enabled={firebaseLoading} />

            <p className="text-center text-2xl m-0 py-2">Manager Dashboard</p>

            <Dropdown options={Object.keys(data)} onValueChanged={stage => setStage(stage)} />
            <SetCurrentPerformer performers={data[stage].performers} performer={data[stage].currentPerformer} setPerformer={(p: number) => {
                updateFirebase(jwt => setCurrentPerformer(jwt, stage, p));
            }} />

            <AddPerformerPopup addingPerformer={addingPerformer} cancel={()=>setAddingPerformer(-1)} add={(name: string, artists: string[]) => {
                updateFirebase(jwt => updatePerformers(jwt, stage, [
                        ...data[stage].performers.slice(0, addingPerformer),
                        {uid: genUID(), name, artists},
                        ...data[stage].performers.slice(addingPerformer)
                    ]));
            }}/>
            <div ref={performersContainer} className={"shadow-inner mt-5 text-left bg-gray-200 h-3/5 overflow-y-auto w-4/5 m-auto rounded-2xl" + (dragging === -1 ? "" : " touch-none")}>
                {genDivider(-1)}
                {([] as any[]).concat(...data[stage].performers.map((p, i) =>
                    [
                        <div key={p.name+i} >
                            { i === dragging && <div className={"table"}><p className={"p-3"}>&nbsp;</p></div>}
                            <div className={"table select-none" + (i === dragging ? " fixed bg-gray-200 rounded-s shadow-2xl z-10" : "")}>
                                <div className="table-cell whitespace-nowrap">
                                    <div
                                        onTouchMove={(evt) => drag(i, evt)}
                                        onMouseMove={(evt) => drag(i, undefined, evt)}
                                        onTouchStart={(evt) => startDrag(i, evt)}
                                        onMouseDown={(evt) => startDrag(i, undefined, evt)}
                                        onTouchEnd={stopDrag}
                                        onMouseUp={stopDrag}
                                        className={"ml-2 inline-block translate-y-0.5 touch-none"}><RiDraggable /></div>
                                    <p
                                        id={"name"+i}
                                        className={"my-2 outline-0 inline-block p-3" + (editingName === i ? " bg-gray-300 rounded-xl" : "") + (data[stage].currentPerformer === i ? " font-semibold" : "")}
                                        contentEditable={editingName === i}
                                        onBlur={editingName === i ? () => {new Promise(async () => {
                                            await new Promise((r) => setTimeout(r, 1));

                                            // only reset if one of the buttons wasn't pressed (this was overriding their onClick)
                                            if (document.activeElement?.parentElement?.parentElement?.id !== 'buttons') {
                                                confirm(false);
                                            }
                                        }).then()} : undefined}
                                        onKeyDown={(evt) => {if (evt.key === 'Enter') {evt.preventDefault(); confirm(true);}}}
                                        >{p.name}</p>
                                </div>
                                <div id="buttons" className={"table-cell w-full text-right translate-y-0.5"}>
                                    {editingName === i || removingPerformer === i ?
                                        <div>
                                            <button className={"mr-2 bg-green-400 text-green-200 rounded-lg p-2"}
                                                    onClick={() => confirm(true)}><FiCheck /></button>
                                            <button className={"mr-3 bg-red-400 text-red-200 rounded-lg p-2"}
                                                    onClick={() => confirm(false)}><FiX /></button>
                                        </div> :
                                        <div>
                                            <button className={"mr-2 bg-blue-400 text-blue-200 rounded-lg p-2"}
                                                    onClick={() => setEditingName(i)}><FiEdit2 /></button>
                                            <button className={"mr-3 bg-red-400 text-red-200 rounded-lg p-2"}
                                                    onClick={() => setRemovingPerformer(i)}><FiTrash2 /></button>
                                        </div>}
                                </div>
                            </div>
                        </div>,
                        genDivider(i)
                    ]))/*.slice(0, -1)*/}
            </div>
        </div>
    )
}