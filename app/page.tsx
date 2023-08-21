"use client";

export default function Home() {
  return (
    <div onClick={() => console.log("clicked")} className="w-full h-full">

      <button className={"py-2 px-4 bg-blue-500"} onClick={() => { console.log("i am a loser")}}>
        Hello world
      </button>
    </div>
  )
}
