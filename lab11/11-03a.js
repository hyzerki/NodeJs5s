const fs = require('fs');
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');
ws.on('open', ()=>{
    console.log("open");
});

ws.on('ping',()=>{
    console.log('ping');
})

ws.on('message', (message)=>{
    console.log(message.toString());
})