"use client";

import React, {useEffect, useState} from "react";

export default function SizeCheck(props: {children: React.ReactNode | React.ReactNode[]}) {
    const [dimensions, setDimensions] = useState<{h: number, w: number}>({h:0,w:0});
    const [ios, setIOS] = useState(false);

    useEffect(() => {
        setIOS(/iPad|iPhone|iPod/.test(navigator.platform));

        const onResize = () => setDimensions({h: window.innerHeight, w: window.innerWidth});
        onResize();

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <>
            <div className={"w-full h-full"} hidden={dimensions.w > 600}>
                {props.children}
            </div>
            <p>{dimensions.w <= 600 ? "" : dimensions.h > 600 ?
                "This website was developed for mobile. For the proper viewing experience, open on a mobile phone." :
                "This website was developed for landscape mode. For the proper viewing experience, rotate your device."}</p>
        </>
    );
}