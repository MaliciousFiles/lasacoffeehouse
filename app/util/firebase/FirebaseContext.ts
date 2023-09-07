import {createContext} from "react";
import {Stage} from "@/app/util/firebase/init";

const FirebaseContext = createContext<{[index: string]: Stage}>({});
export default FirebaseContext;