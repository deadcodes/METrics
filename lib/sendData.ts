import eventEmitter from "./eventEmitter";

export function sendDataToClients(data: any) {
    // console.log('sending data to clients', data)
    eventEmitter.emit("newData", data);
}
