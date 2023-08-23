import ViewPerformers from "@/app/performers/ClientComponent";
import {readFileSync} from "fs";

export default async function ServerComponent() {
    return (
        <ViewPerformers initialData={
            JSON.parse(new TextDecoder().decode(readFileSync("data/performers.json")))}
        />
    )
}