import {stream} from "@/app/data/route";
import {readFileSync} from "fs";
import {debug} from "util";

export async function GET() {
    let writer = stream.getWriter();
    await writer.write(new TextDecoder().decode(readFileSync("data/performers.json")));
    writer.releaseLock();

    return new Response('Sent!');
}