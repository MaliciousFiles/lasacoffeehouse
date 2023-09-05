import {createContext} from "react";
import {Stage} from "@/firebase/init";

const FirebaseContext = createContext<{[index: string]: Stage}>({});
export default FirebaseContext;