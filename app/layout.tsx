import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import firebase from '@/app/util/firebase/init'
import {getDatabase, ref, get} from "@firebase/database";
import FirebaseComponent from "@/app/util/firebase/FirebaseComponent";

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
        <FirebaseComponent initialData={(await get(ref(getDatabase(firebase), "/data"))).val()}>
            <body className={"w-full h-full overflow-hidden " + inter.className}>{children}</body>
        </FirebaseComponent>
        </html>
    )
}
