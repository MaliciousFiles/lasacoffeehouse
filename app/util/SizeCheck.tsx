"use client";

import React, {useEffect, useState} from "react";
import dynamic from "next/dynamic";

export default function SizeCheck(props: {children: React.ReactNode | React.ReactNode[]}) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        onResize();

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return width <= 600 ? props.children
        : <p>This website was developed for mobile. For a proper viewing experience, open on a phone.</p>;
}