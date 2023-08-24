import ViewPerformers from "@/app/performers/ClientComponent";
import {get, getDatabase, ref} from "@firebase/database";
import firebase from "@/firebase/init";

export default async function ServerComponent() {
    return (
        <ViewPerformers initialData={(await get(ref(getDatabase(firebase)))).val()} />
    )
}