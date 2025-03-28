"use client";

import firebase, {genUID, Performer, Song, Stage} from "@/app/util/firebase/init";
import {getAuth} from "@firebase/auth";
import React, {ReactElement, useContext, useEffect, useRef, useState} from "react";
import FirebaseContext from "@/app/util/firebase/FirebaseContext";
import {RiDraggable} from "react-icons/ri";
import {FiEdit, FiTrash} from "react-icons/fi";
import {
    clearFCM,
    getNumFCM,
    removePerformer, sendMessageBatch,
    sendNotification, setAllData,
    setCurrentPerformer,
    updateClients,
    updatePerformer,
    updatePerformers
} from "@/app/manage/FCMManager";
import scrollIntoView from "scroll-into-view-if-needed";
import Popup, {InputList} from "@/app/util/Popup";
import {getColorScheme, parseArtists} from "@/app/util/util";
import StageSelector from "@/app/util/StageSelector";
import {TokenMessage} from "firebase-admin/messaging";
import {MoonLoader, PulseLoader, ScaleLoader, SyncLoader} from "react-spinners";
import {IoLockClosedOutline, IoLockOpenOutline} from "react-icons/io5";
import Disableable from "../util/Disableable";

export default function ManagePage() {
    const data = useContext(FirebaseContext);

    const [firebaseLoading, setFirebaseLoading] = useState(false);

    useEffect(() => {
        const activePerformers = data[stage].performers.slice(currentIdx, currentIdx+2);

        // the user did something, therefore update clients with new data
        if (JSON.stringify(oldActivePerformers) != JSON.stringify(activePerformers.map(p => p.uid))) {
            updateFirebase(jwt => updateClients(jwt, stage, activePerformers[0], activePerformers[1]), false);
        } else {
            // since they didn't update it, visual scroll
            scroll(true);
        }

        setOldActivePerformers(activePerformers.map(p => p.uid));
    }, [data]);

    const updateFirebase = (func: (jwt: string)=>(Promise<void>|Promise<TokenMessage[][]>), fromUser: boolean = true) => {
        if(fromUser) setFirebaseLoading(true);

        getAuth(firebase).currentUser?.getIdToken().then(jwt=>func(jwt).then(messages =>
            messages && messages.forEach(b=>sendMessageBatch(jwt, b))
        )).finally(() => setFirebaseLoading(false));
    }

    const [selectedStage, setStage] = useState(0);
    const stage = Object.keys(data)[selectedStage];

    let currentIdx = data[stage].currentPerformer;

    const [oldActivePerformers, setOldActivePerformers] = useState(data[stage].performers.slice(currentIdx, currentIdx+2).map(p => p.uid));

    const [dragging, setDragging] = useState(-1);
    const performersContainer = useRef<HTMLDivElement>(null);
    const svgOffset = useRef({x: 0, y: 0});
    const performerPositions = useRef<number[]>([]);
    const currentChips = useRef<(HTMLElement|null)[]>([]);

    const scrollBy = useRef(0);

    const movePerformer = (parent: HTMLElement, idx: number, direction: 1 | -1) => {
        let pos = performerPositions.current[idx]
        let idx2 = performerPositions.current.indexOf(pos + direction);

        if (pos == currentIdx) currentIdx += direction;
        else if (pos + direction == currentIdx) currentIdx -= direction;

        const marker = document.createElement("div");
        const child1 = parent.childNodes[pos * 2];
        const child2 = parent.childNodes[(pos + direction) * 2];

        parent.insertBefore(marker, child1);
        parent.insertBefore(child1, child2);
        parent.insertBefore(child2, marker);
        parent.removeChild(marker);

        performerPositions.current[idx] += direction;
        performerPositions.current[idx2] -= direction;

        // for (let i = 0; i < currentChips.current.length; i++) {
        //     currentChips.current[i]?.classList.toggle("hidden", performerPositions.current[i] != currentIdx);
        // }
    }

    const startDrag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        navigator.vibrate && navigator.vibrate(100);

        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('row')) row = row.parentElement!;

        let pos = touchEvt ? touchEvt.touches[0] : mouseEvt!;

        performerPositions.current = data[stage].performers.map((_, i)=>i);
        svgOffset.current = {x: pos.clientX - row.offsetLeft, y: pos.clientY - row.offsetTop + performersContainer.current!.scrollTop};
    }

    const checkRowMove = (row: HTMLElement, idx: number) => {
        const currentIdx = performerPositions.current[idx];
        const scroll = performersContainer.current!.scrollTop;

        if (currentIdx > 0 && row.offsetTop + row.offsetHeight + scroll < row.parentElement!.offsetTop) {
            movePerformer(performersContainer.current!, idx, -1);
        } else if (currentIdx < data[stage].performers.length-1 && row.offsetTop + scroll > row.parentElement!.offsetTop + row.parentElement!.offsetHeight) {
            movePerformer(performersContainer.current!, idx, 1);
        }
    }
    const drag = (idx: number, touchEvt?: React.TouchEvent<HTMLDivElement>, mouseEvt?: React.MouseEvent<HTMLDivElement>) => {
        if (dragging === -1) setDragging(idx);

        let row = ((touchEvt || mouseEvt)!.target as HTMLElement);
        while (!row.classList.contains('row')) row = row.parentElement!;

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
        while (!row.classList.contains('row')) row = row.parentElement!;

        if (performerPositions.current.length) {
            const performers = performerPositions.current
                .reduce((arr, performer, idx) => {arr[performer] = idx; return arr;}, [] as number[]) // invert
                .map(i => data[stage].performers[i]);

            updateFirebase(async (jwt) => {
                await updatePerformers(jwt, stage, performers);
                await setCurrentPerformer(jwt, stage, currentIdx);
            });
            setDragging(-1);
        }

        scrollBy.current = 0;
        row.style.left = row.style.top = row.style.width = '';
        performerPositions.current = [];
        svgOffset.current = {x: 0, y: 0};
    }

    const scroll = (ifNeeded: boolean) => {
        let child;
        if (!(child=performersContainer.current?.childNodes[currentIdx*2])) return;

        scrollIntoView(child as Element, {
            behavior: 'smooth',
            scrollMode: ifNeeded ? 'if-needed' : 'always'
        });
    }
    useEffect(() => scroll(false), [stage]);

    const color = getColorScheme(selectedStage)

    const [notifPopup, setNotifPopup] = useState(false);
    const [notifConfirm, setNotifConfirm] = useState<{title: string, body: string}>();
    const [numFCM, setNumFCM] = useState(-1);

    const [editingPerformer, setEditingPerformer] = useState(-1);

    const currentPerformer = data[stage].performers[currentIdx];

    const [locked, setLocked] = useState(true);

    const [uploadPopup, setUploadPopup] = useState(false);
    const [linkData, setLinkData] = useState<{ [stage: string]: Performer[] }>();
    const [linkMessage, setLinkMessage] = useState<ReactElement>();
    const [oldLinkMessage, setOldLinkMessage] = useState<ReactElement>();
    useEffect(() => { if (linkMessage) setOldLinkMessage(linkMessage); }, [linkMessage]);

    const inactivityTimeout = useRef<NodeJS.Timeout>();
    useEffect(() => {
        document.addEventListener('visibilitychange', () => {
            document.visibilityState !== 'visible' && setLocked(true);
        })
        document.addEventListener('touchstart', () => {
            inactivityTimeout.current && clearTimeout(inactivityTimeout.current);
            inactivityTimeout.current = setTimeout(() => setLocked(true), 15 * 1000);
        })
    }, []);

    return (
        <div className={"bg-white flex w-full h-full flex-col"}>
            {firebaseLoading && (
                <div>
                    <div className={"absolute w-full h-full bg-black opacity-40"}>
                    </div>
                    <div className={"z-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}>
                        <ScaleLoader speedMultiplier={0.8} loading={true} height={50} width={15} radius={5}
                                     color={"#ffffff"}/>
                    </div>
                </div>
            )}

            <div className={"flex justify-between flex-shrink-0 px-3 py-2"}>
                <p className={"text-sm my-auto text-gray-800 font-semiheavy mx-0"}>Manager Hub</p>
                <div>
                    <button className={"bg-gray-100 rounded-2xl text-xs text-gray-600 px-3 py-1 mr-3"}
                            onClick={() => setUploadPopup(true)}>Upload Performers
                    </button>
                    <button className={"bg-gray-100 rounded-2xl text-xs text-gray-600 px-3 py-1"}
                            onClick={() => getAuth(firebase).updateCurrentUser(null)}>Log Out
                    </button>
                </div>
            </div>

            <Popup title={"Upload Performers"} open={uploadPopup} colorScheme={color}
                   close={async (cancelled: boolean, inputs: InputList) => {
                       setUploadPopup(false);
                       if (cancelled) return;

                       let {url} = inputs;
                       let regex = /(https:\/\/)?docs.google.com\/spreadsheets\/d\/([0-9A-Za-z_-]{44}).*/
                       if (!regex.test(url)) {
                           setLinkMessage(<p className={"mx-6 mb-5 text-sm leading-5 text-red-400"}>Invalid Google Sheets link. Go to &quot;Share&quot; and then &quot;Copy Link&quot;.</p>);
                           return;
                       }

                       let id = regex.exec(url)![2]; // first group is technically the https://

                       let mainStage, smallStage;
                       try {
                           mainStage = await (await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Main%20Stage`)).text();
                           smallStage = await (await fetch(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=Small%20Stage`)).text();
                       } catch { // assume it was a 302 from CORS
                           setLinkMessage(<p className={"mx-6 mb-5 text-sm leading-5 text-red-400"}>Could not access Google Sheet. Make sure anyone with the link can view it.</p>);
                           return;
                       }

                       if (mainStage == smallStage) {
                           setLinkMessage(<p className={"mx-6 mb-5 text-sm leading-5 text-red-400"}>Invalid Google Sheet. Ensure it has two sheets named &quot;Main Stage&quot; and &quot;Small Stage&quot;.</p>);
                           return;
                       }

                       let parseStage = (data: string) => {
                           let performers: Performer[] = [];

                           for (let l of data.split('\n').slice(1)) {
                               const line = l.slice(1, -1).split('","');
                               if (line.length < 10) continue;

                               let name = line[5];
                               if (!name) continue;

                               let artists = line[6].split(',').map(a => a.trim()).filter(a => a);

                               let songs: Song[] = [];
                               for (let i = 8; i < line.length; i += 2) {
                                   let song = line[i].replace(/^""|""$/g, "");
                                   if (!song) continue;

                                   let artist = line[i+1];
                                   let original = artist === "ORIGINAL";

                                   songs.push({name: song, artist: !artist || original ? undefined : artist, original});
                               }

                               performers.push({uid: genUID(), name, artists, songs});
                           }

                           return performers;
                       };

                       const data = {"Main Stage": parseStage(mainStage), "Small Stage": parseStage(smallStage)};
                       setLinkData(data);

                       setLinkMessage(<div>
                           <p className={"mx-6 mb-2 text-sm leading-5"}>Are you sure you want to upload <b>{data['Main Stage'].length}</b> performers for the Main Stage and <b>{data['Small Stage'].length}</b> for the Small Stage?</p>
                           <p className={"mx-6 mb-5 text-sm leading-5 text-red-400"}>! This action is irreversible, and will overwrite all existing data !</p>
                       </div>);
                   }}>
                <div className={"mx-5 mt-3 mb-6 flex flex-col"}>
                    <p className={"text-sm text-left"}>Google Sheets Link</p>
                    <input autoCorrect={'off'} alt={"url"}
                           className={"border text-xs border-gray-200 rounded-md py-2 px-3"}/>
                </div>
            </Popup>
            <Popup title={"Validate Link"} open={linkMessage != undefined} continueButton={linkData != undefined} colorScheme={color}
                   close={(cancelled: boolean) => {
                      setLinkData(undefined);
                      setLinkMessage(undefined);

                      if (!cancelled) {
                          updateFirebase(async (jwt) => {
                              await clearFCM(jwt);

                              let stages: {[stage: string]: Stage} = {}
                              for (let stage in linkData!) stages[stage] = {name: stage, performers: linkData![stage], currentPerformer: 0};
                              await setAllData(jwt, stages);
                          });
                      }
                   }}>
                {linkMessage ?? oldLinkMessage!}
            </Popup>
            <Popup title={"Send Notification"} open={notifPopup} colorScheme={color}
                   close={(cancelled: boolean, inputs: InputList) => {
                       setNotifPopup(false);
                       if (!cancelled) {
                           setNotifConfirm(inputs as { title: string, body: string });
                       }
                   }}>
                <div className={"mx-5 mt-3 flex flex-col"}>
                    <p className={"text-sm text-left"}>Notification Title</p>
                    <input autoCorrect={'on'} alt={"title"}
                           className={"border text-xs border-gray-200 rounded-md py-2 px-3"}/>
                </div>
                <div className={"mx-5 mt-3 mb-6 flex flex-col"}>
                    <p className={"text-sm text-left"}>Notification Body</p>
                    <input autoCorrect={'on'} alt={"body"}
                           className={"border text-xs border-gray-200 rounded-md py-2 px-3"}/>
                </div>
            </Popup>
            <Popup title={"Confirm Notification"} open={numFCM != -1 && notifConfirm != undefined} colorScheme={color}
                   close={(cancelled: boolean) => {
                       !cancelled && updateFirebase(jwt =>
                           sendNotification(jwt, notifConfirm!.title, notifConfirm!.body));
                       setNotifConfirm(undefined);
                   }}>

                <p className={"mx-6 mb-5"}>Are you sure you want to notify <b>{numFCM}</b> people?</p>
                <div className={"mx-5 h-16 mb-6 rounded-xl border border-gray-400 flex"}>
                    <img src={'/images/logo.svg'} alt={'Logo'}
                         className={"p-2 flex-shrink-0 h-full w-auto rounded-lg"}/>
                    <div className={"mt-1.5 text-left overflow-hidden"}>
                        <p className={"font-semiheavy text-sm line-clamp-1 text-ellipsis"}>{notifConfirm?.title}</p>
                        <p className={"text-xs line-clamp-2 text-ellipsis"}>{notifConfirm?.body}</p>
                    </div>
                </div>
            </Popup>

            <div className={`${color.bgLight} flex flex-col flex-shrink-0`}>
                <button
                    className={`rounded-2xl text-xs mr-4 mt-2 px-2.5 py-1 ml-auto ${color.bgDark} ${color.textLight}`}
                    onClick={() => setLocked(!locked)}>
                    {locked ?
                        <IoLockClosedOutline className={"inline -translate-y-[10%]"} />
                        : <IoLockOpenOutline className={"inline -translate-y-[10%]"} />
                    }
                    &nbsp;{locked ? "Locked" : "Unlocked"}
                </button>
                <div className={"mx-5"}>
                    <p className={"text-xs mt-2 text-left font-semiheavy text-gray-400"}>Currently Performing</p>
                    <p className={"text-2xl mt-1 text-gray-800 line-clamp-1 font-semiheavy text-left"}>{currentPerformer.name}</p>
                    <p className={"text-xs mt-3 text-gray-400 font-semiheavy line-clamp-2 text-ellipsis text-left"}>{currentPerformer.artists ? `Performed by ${currentPerformer.artists.join(", ")}` : ' '}</p>
                </div>
                <Disableable disabled={locked}>
                    <div className={"mx-3 mt-6 mb-4 flex text-xs justify-evenly"}>
                        <button disabled={locked} className={`px-6 py-2 rounded-lg ${color.bg} ${color.textLight}`}
                                onClick={() => updateFirebase(jwt => setCurrentPerformer(jwt, stage, Math.min(data[stage].performers.length - 1, currentIdx + 1)))}>Next
                            Performer
                        </button>
                        <button disabled={locked} className={`px-4 py-2 rounded-lg ${color.border} ${color.text}`}
                                onClick={() => updateFirebase(jwt => setCurrentPerformer(jwt, stage, Math.max(0, currentIdx - 1)))}>Previous
                        </button>
                        <button disabled={locked} className={`px-6 py-2 rounded-lg ${color.border} ${color.text}`}
                                onClick={() => {
                                    updateFirebase(async jwt => setNumFCM((await getNumFCM(jwt))!), false);
                                    setNotifPopup(true);
                                }}>Notify
                        </button>
                    </div>
                </Disableable>
            </div>

            <Popup title={"Edit Performance"} open={editingPerformer != -1} colorScheme={color}
                   defaultValues={{
                       name: data[stage].performers[editingPerformer]?.name,
                       artists: data[stage].performers[editingPerformer]?.artists?.join(", ")
                   }}
                   close={(cancelled: boolean, inputs: InputList) => {
                       if (!cancelled) {
                           updateFirebase(jwt => updatePerformer(jwt, stage, editingPerformer, inputs.name, parseArtists(inputs.artists)));
                       }

                       setEditingPerformer(-1);
                   }}>
                <div className={"mx-5 mt-1.5 flex flex-col"}>
                    <p className={"text-sm text-left"}>Name</p>
                    <input alt="name" className={"border text-xs border-gray-200 rounded-md py-2 px-3"}/>
                </div>
                <div className={"mx-5 mt-3 flex flex-col"}>
                    <p className={"text-sm text-left"}>Artists</p>
                    <input alt="artists" placeholder={"Comma, Separated, Names"}
                           className={"border text-xs border-gray-200 rounded-md py-2 px-3"}/>
                </div>
                <div className={"mx-5 mt-3.5 mb-6 text-left flex"}>
                    <button className={"rounded-md bg-blue-400 text-blue-100 font-semiheavy px-1.5 py-1 text-xs"}
                            onClick={() => {
                                updateFirebase(jwt => setCurrentPerformer(jwt, stage, editingPerformer));
                                setEditingPerformer(-1);
                            }}>
                        <FiEdit className={"inline -translate-y-0.5"}/>&nbsp;Set Performing
                    </button>
                    <button className={"ml-2 rounded-md bg-red-400 text-red-100 font-semiheavy px-1.5 py-1 text-xs"}
                            onClick={() => {
                                updateFirebase(jwt => removePerformer(jwt, stage, editingPerformer));
                                setEditingPerformer(-1);
                            }}>
                        <FiTrash className={"inline -translate-y-0.5"}/>&nbsp;Delete
                    </button>
                </div>
            </Popup>

            <div ref={performersContainer}
                 className={"flex-grow select-none overflow-y-scroll" + (dragging == -1 ? "" : " touch-none")}>
                {([] as any[]).concat(...data[stage].performers.map((p, i) => [
                    <div key={"performer" + p.uid}>
                        {i == dragging && <div><p>&nbsp;</p><p className={"text-xs py-2"}>&nbsp;</p></div>}
                        <div
                            className={"row pr-7 pl-5 py-2 flex" + (i == dragging ? " fixed rounded-s shadow-2xl w-full bg-white" : "")}>
                            <div className={`flex flex-col text-left flex-grow overflow-hidden whitespace-nowrap pr-1`}>
                                <p className={"text-gray-800 font-semiheavy text-ellipsis overflow-hidden"}>{p.name}</p>
                                <p className={"text-gray-600 text-xs text-ellipsis overflow-hidden"}>{p.artists ? p.artists.join(',') : " "}</p>
                            </div>
                            <p ref={el => currentChips.current[i] = el}
                               className={`${color.bg} ${color.textLight} my-auto text-xs h-fit rounded-sm font-semiheavy ${i != currentIdx ? 'hidden' : 'px-2 py-0.5 mr-1.5'}`}>Current</p>
                            <Disableable disabled={locked} className={"my-auto"}>
                                <button disabled={locked}
                                    className={"bg-gray-100 text-gray-700 h-fit py-0.5 px-2 rounded-sm mr-3.5 font-semiheavy text-xs"}
                                    onClick={() => setEditingPerformer(i)}>Edit
                                </button>
                            </Disableable>
                            <Disableable disabled={locked} className={"my-auto"}>
                                <div
                                    className={"text-gray-400 py-0.5 touch-none rounded-xs text-sm flex-shrink-0 bg-gray-200 my-auto"}
                                    onTouchMove={(evt) => !locked && drag(i, evt)}
                                    onMouseMove={(evt) => !locked && drag(i, undefined, evt)}
                                    onTouchStart={(evt) => !locked && startDrag(i, evt)}
                                    onMouseDown={(evt) => !locked && startDrag(i, undefined, evt)}
                                    onTouchEnd={stopDrag}
                                    onMouseUp={stopDrag}>
                                    <RiDraggable/>
                                </div>
                            </Disableable>
                        </div>
                    </div>,
                    <div key={"spacer" + i} className={"w-full h-px bg-gray-200"}/>
                ])).slice(0, -1)}
            </div>
            <StageSelector stages={Object.keys(data)} selected={selectedStage} setSelected={setStage}
                           className={"flex-shrink-0 h-14 w-full"}/>
        </div>
    )
}