import { Data } from "./interface";

export function verifyData(data: any): data is Data {
    return true;
}

