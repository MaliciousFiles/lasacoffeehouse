import {readFileSync, writeFileSync} from "fs";

export let callbacks: ((data: string) => void)[] = [];
export let stream = new WritableStream<string>({
    async write(chunk, controller) {
        writeFileSync("data/performers.json", chunk)
        console.log(`writing ${callbacks.length}`);
        callbacks.forEach(f=>f(chunk));
    }
})

// export async function POST(req: Request) {
//         let writer = stream.getWriter();
//         await writer.write(new TextDecoder().decode(readFileSync("data/performers.json")));
//         writer.releaseLock();
//
//         return new Response('success');
// }

export async function GET() {
    let callback: (data: string) => void;
    let sentFirstData = false;

    return new Response(new ReadableStream({
        async pull(controller) {
            if (!sentFirstData) {
                console.log("first data");
                controller.enqueue(readFileSync("data/performers.json"));
                sentFirstData = true;
                return;
            }

            console.log("pull");
            await new Promise<void>((resolve) => {
                callback = (data: string) => {
                    console.log("sending");
                    controller.enqueue(data);
                    callbacks.splice(callbacks.indexOf(callback), 1);
                    resolve();
                }
                console.log("callback created")
                callbacks.push(callback);
                console.log(`callback added (${callbacks.length})`)
            });
            console.log("enqueued");
        },

        async cancel(reason) {
            console.log("cancelled: "+reason +" ("+callbacks.length+")");
            callbacks.splice(callbacks.indexOf(callback), 1);
        }
    }))
}
