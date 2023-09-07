import {useRef, useState} from "react";
import {RxTriangleRight} from "react-icons/rx";

export default function Dropdown(props: {options: string[], onValueChanged?: (val: string)=>void}) {
    const {options, onValueChanged} = props;

    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(0);

    const content = useRef<HTMLDivElement>(null);

    // I know it's not great to use style={...}, but Tailwind won't compile with arbitrary values unless they're hard-coded
    return (
        <div className={"relative m-auto w-3/4"}>
            <button className={"relative bg-slate-200 text-gray-800 text-[1.1875rem] py-2 w-full rounded-xl drop-shadow-md"} onClick={()=>setOpen(!open)}>
                <div className={`${open ? 'rotate-90' : ''} transition-all duration-200 left-2 absolute text-2xl translate-y-0.5 text-gray-800`}><RxTriangleRight /></div>
                {options[selected]}
            </button>
            <div className={"absolute z-10 bg-slate-100 w-full rounded-lg mt-3 drop-shadow-lg transition-all duration-200 overflow-hidden" + (!open ? " max-h-0" : "")} style={{maxHeight: open ? `${content.current!.scrollHeight}px` : undefined}} ref={content}>
                {([] as any[]).concat(...options.map((o,i) => [
                    <p className={`${selected === i ? 'text-gray-400' : 'text-gray-800'} b-0.5`} key={o+i} onClick={()=>{setSelected(i); onValueChanged?.call(null, options[i]); setOpen(false);}}>{o}</p>,
                    <div key={"spacer"+i} className={"bg-slate-300 w-[90%] h-px m-auto"} />
                ])).slice(0, -1)}
            </div>
        </div>
    )
}