const http = require('http');
const ws = require("ws");
const fs = require("fs");
const { getSystemErrorMap } = require('util');

const socket = new ws("ws://localhost:4000/wsserver");
let interv;
socket.on("open", () => {
    let n = 0;
    interv = setInterval(() => {
        socket.send(`10-02-client: ${++n}`);
        console.log(`10-02-client: ${n}`);
    }, 3000)
    socket.on("message", (message) => {
        console.log(message.toString());
    });
    setTimeout(()=>{socket.close()},25000)
});
socket.on("close", ()=>{
    clearInterval(interv);
})

socket.on("error", (error)=>{
    console.error(error);
});