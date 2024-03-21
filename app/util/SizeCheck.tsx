"use client";

import React, {useEffect, useState} from "react";

export default function SizeCheck(props: {children: React.ReactNode | React.ReactNode[]}) {
    const [width, setWidth] = useState(0);

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return width <= 600 ? props.children
        : <p>This website was developed for mobile. For the correct viewing experience, open on a phone.</p>;
}