'use server'

import {readFileSync} from "fs";

export default async function readData() {
    return JSON.parse(new TextDecoder().decode(readFileSync("data/performers.json")))
}