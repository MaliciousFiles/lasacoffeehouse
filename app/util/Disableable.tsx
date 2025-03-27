import {CSSProperties, ReactNode} from "react";

export default function Disableable(props: {disabled: boolean, className?: string, children: ReactNode}) {
    return (
        <div style={{opacity: props.disabled ? 0.4 : 1}} className={`transition-opacity ${props.className}`}>
            {props.children}
        </div>
    )
}