"use client";

import firebase from "@/app/util/firebase/init";
import {getAuth} from "@firebase/auth";
import React, {useContext, useEffect, useRef, useState} from "react";
import SignInPopup from "@/app/manage/SignInPopup";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";
import Dropdown from "@/app/util/Dropdown";
import {RiDraggable} from "react-icons/ri";
import {RxDragHandleDots1, RxDragHandleDots2, RxDragHandleVertical} from "react-icons/rx";
import {FiCheck, FiEdit, FiEdit2, FiTrash2, FiX} from "react-icons/fi";
import {GrEdit} from "react-icons/gr";
import {getDatabase, ref, remove, set} from "@firebase/database";
import {removePerformer, renamePerformer, reorderPerformers} from "@/app/manage/FCMManager";

export default function ManagePerformers() {
    const data = useContext(FirebaseContext);

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
                    getAuth(firebase).currentUser?.getIdToken()
                        .then(jwt => renamePerformer(jwt, stage, editingName, name.textContent!));
                } else {
                    name.textContent = origName;
                }
            }

            setEditingName(-1);
        } else if (removingPerformer !== -1) {
            if (value) {
                getAuth(firebase).currentUser?.getIdToken()
                    .then(jwt => removePerformer(jwt, stage, data[stage].performers, removingPerformer));
            }

            setRemovingPerformer(-1);
        }
    };

    const [dragging, setDragging] = useState(-1);
    const performersContainer = useRef<HTMLDivElement>(null);
    const svgOffset = useRef({x: 0, y: 0});
    const newPerformers = useRef([] as number[]);

    const swapPerformers = (parent: HTMLElement, idx1: number, idx2: number) => {
        if (idx2 == -1) return;

        const marker = document.createElement("div");
        const child1 = parent.childNodes[newPerformers.current[idx1] * 2];
        const child2 = parent.childNodes[newPerformers.current[idx2] * 2];

        parent.insertBefore(marker, child1);
        parent.insertBefore(child1, child2);
        parent.insertBefore(child2, marker);
        parent.removeChild(marker);

        const temp = newPerformers.current[idx1];
        newPerformers.current[idx1] = newPerformers.current[idx2];
        newPerformers.current[idx2] = temp;
    }

    const startDrag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        let pos = touchEvt ? touchEvt.touches[0] : mouseEvt!;

        newPerformers.current = data[stage].performers.map((_, i)=>i);
        svgOffset.current = {x: pos.clientX - row.offsetLeft, y: pos.clientY - row.offsetTop};
        row.style.width = row.offsetWidth+'px';
    }
    const drag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        const currentIdx = newPerformers.current[idx];

        if (dragging === -1) setDragging(currentIdx);

        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        let pos = touchEvt ? touchEvt.touches[0] : mouseEvt!;

        const top = (pos.clientY - (svgOffset.current.y));
        row.style.left = (pos.clientX - (svgOffset.current.x))+'px';
        row.style.top = top+'px';

        if (currentIdx > 0 && top + row.offsetHeight < row.parentElement!.offsetTop) {
            swapPerformers(performersContainer.current!, idx, newPerformers.current.indexOf(currentIdx-1));
        } else if (currentIdx < data[stage].performers.length && top > row.parentElement!.offsetTop + row.parentElement!.offsetHeight) {
            swapPerformers(performersContainer.current!, idx, newPerformers.current.indexOf(currentIdx+1));
        }
    }
    const stopDrag = (evt: React.UIEvent) => {
        let row = (evt.target as HTMLElement);
        while (!row.classList.contains('table')) row = row.parentElement!;

        const performers = newPerformers.current.map(i => data[stage].performers[i]);
        getAuth(firebase).currentUser?.getIdToken()
            .then(jwt => reorderPerformers(jwt, stage, performers));
        setDragging(-1);

        row.style.left = row.style.top = row.style.width = '';
        newPerformers.current = [];
        svgOffset.current = {x: 0, y: 0};
    }

    return !loggedIn ? <SignInPopup logIn={()=>setLoggedIn(true)} /> : (
        <div className="h-full w-full">
            <p className="text-center text-2xl">Manager Dashboard</p>

            <Dropdown options={Object.keys(data)} onValueChanged={val => setStage(val)} />

            <div ref={performersContainer} className="mt-10 text-left bg-gray-200 h-3/5 overflow-y-auto w-4/5 m-auto rounded-2xl">
                {([] as any[]).concat(...data[stage].performers.map((p, i) =>
                    [
                        <div key={p+i}>
                            {i === dragging && <div><p className={"p-3"}>&nbsp;</p></div>}
                            <div className={"table" + (i === dragging ? " absolute bg-gray-200 rounded-2xl drop-shadow-lg z-10" : "")}>
                                <div className="table-cell whitespace-nowrap">
                                    <div
                                        onTouchMove={(evt) => drag(i, evt)}
                                        onMouseMove={(evt) => drag(i, undefined, evt)}
                                        onTouchStart={(evt)=>startDrag(i, evt)}
                                        onMouseDown={(evt)=>startDrag(i, undefined, evt)}
                                        onTouchEnd={stopDrag}
                                        onMouseUp={stopDrag}
                                        className={"ml-2 inline-block translate-y-0.5"}><RiDraggable /></div>
                                    <p
                                        id={"name"+i}
                                        className={"ml-3 outline-0 inline-block p-3" + (editingName === i ? " bg-gray-300 rounded-xl" : "")}
                                        contentEditable={editingName === i}
                                        onBlur={editingName === i ? () => {new Promise(async () => {
                                            await new Promise((r) => setTimeout(r, 1));

                                            // only reset if one of the buttons wasn't pressed (this was overriding their onClick)
                                            if (document.activeElement?.parentElement?.parentElement?.id !== 'buttons') {
                                                confirm(false);
                                            }
                                        }).then()} : undefined}
                                        onKeyDown={(evt) => {if (evt.key === 'Enter') {evt.preventDefault(); confirm(true);}}}
                                    >{p}</p>
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
                        <div className={"bg-neutral-400 w-full h-px m-auto"} key={"s"+i}/>
                    ])).slice(0, -1)}
            </div>
        </div>
    )
}