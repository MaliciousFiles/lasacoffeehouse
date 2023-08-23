import {readFileSync, writeFileSync} from "fs";

let callbacks: ((data: string) => void)[] = [];

export async function POST(req: Request) {
    let data: any;
    try {
        data = JSON.stringify(await req.json());
    } catch (e) {
        return new Response('Invalid JSON\n');
    }

    writeFileSync("data/performers.json", data);
    [...callbacks].forEach(f=>f(data));

    return new Response('Success\n');
}

export async function GET() {
    let callback: (data: string) => void;

    return new Response(new ReadableStream({
        async pull(controller) {
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
