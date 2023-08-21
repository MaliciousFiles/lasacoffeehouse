import {readFileSync} from "fs";

export default function PerformerData() {
    return JSON.parse(readFileSync("../data/performers.json", {encoding: "ascii"}));
}