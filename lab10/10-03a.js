const http = require('http');
const ws = require("ws");
const fs = require("fs");
const { getSystemErrorMap } = require('util');

const socket = new ws("ws://localhost:4000/broadcast");


socket.on("open", () => {
    socket.on("message", (message) => {
        console.log(message.toString());
    });
});

socket.on("error", (error) => {
    console.error(error);
});

let name = process.argv[2];

process.stdin.on("data", (data) => {
    socket.send(`${name}: ${data.toString()}`);
});