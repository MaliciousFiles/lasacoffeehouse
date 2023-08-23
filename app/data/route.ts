import {readFileSync, writeFileSync} from "fs";
import {Response} from "next/dist/compiled/@edge-runtime/primitives";

let callbacks: ((data: string) => void)[] = [];

export async function POST(req: Request) {
    let data: any;
    try {
        data = JSON.stringify(await req.json());
    } catch (e) {
        return new Response('invalid JSON');
    }

    writeFileSync("data/performers.json", data);
    [...callbacks].forEach(f=>f(data));

    return new Response('success');
}

export async function GET() {
    let callback: (data: string) => void;
    let sentFirstData = false;

    return new Response(new ReadableStream({
        async pull(controller) {
            if (!sentFirstData) {
                controller.enqueue(readFileSync("data/performers.json"));
                sentFirstData = true;
                return;
            }

            await new Promise<void>((resolve) => {
                callback = (data: string) => {
                    controller.enqueue(data);
                    callbacks.splice(callbacks.indexOf(callback), 1);
                    resolve();
                }
                callbacks.push(callback);
            });
        },

        async cancel(reason) {
            callbacks.splice(callbacks.indexOf(callback), 1);
        }
    }))
}
