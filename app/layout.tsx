import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import firebase from '@/app/util/firebase/init'
import {getDatabase, ref, get} from "@firebase/database";
import BaseFirebaseComponent from "@/app/util/firebase/BaseFirebaseComponent";

export const metadata: Metadata = {
    title: 'LASA Coffeehouse',
    description: 'Performer viewer for the Coffeehouse event',
}

const inter = Inter({ subsets: ['latin'] })

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en" className={"w-full h-full"}>
        <BaseFirebaseComponent initialData={await (async () => {
            const data = (await get(ref(getDatabase(firebase), "/data"))).val()
            return Object.keys(data).reduce((obj, stage) => {
                if (!('performers' in obj[stage])) obj[stage]['performers'] = [];
                return obj;
            }, data);
        })()}>
            <body className={"w-full h-full overflow-hidden " + inter.className}>{children}</body>
        </BaseFirebaseComponent>
        </html>
    )
}
