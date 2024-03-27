import './globals.css'
import type {Metadata} from 'next'
import {Inter} from 'next/font/google'
import firebase from '@/app/util/firebase/init'
import {get, getDatabase, ref} from "@firebase/database";
import BaseFirebaseComponent from "@/app/util/firebase/BaseFirebaseComponent";
import React from "react";
import SizeCheck from "@/app/util/SizeCheck";

export const metadata: Metadata = {
    title: 'LASA Coffeehouse',
    description: 'Performer viewer for Coffeehouse',
    manifest: '/manifest.webmanifest',
}

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en" className={"w-full h-full"}>
            <body className={"w-full h-full " + inter.className}>
                <SizeCheck>
                    <BaseFirebaseComponent initialData={await (async () => {
                        const data = (await get(ref(getDatabase(firebase), "/data"))).val()
                        return Object.keys(data).reduce((obj, stage) => {
                            if (!('performers' in obj[stage])) obj[stage]['performers'] = [];
                            return obj;
                        }, data);
                    })()}>
                        {children}
                    </BaseFirebaseComponent>
                </SizeCheck>
            </body>
        </html>
    )
}
