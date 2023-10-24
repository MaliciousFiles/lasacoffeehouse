"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full">
        <Link href={"/performers"}>Main</Link>
        <br/>
        <Link href={"/manage"}>Admin</Link>
    </div>
  )
}
