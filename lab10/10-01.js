const http = require('http');
const ws = require("ws");
const fs = require("fs");

const server = http.createServer((request, response) => {
    if (request.method == "GET" && request.url == "/start") {
        fs.createReadStream("./index.html").pipe(response);
    }
    else {
        response.writeHead(400);
        response.end();
    }
});

server.listen(3000);

const wsserver = new ws.Server({ port: 4000, host: 'localhost', path: '/wsserver' });
wsserver.on("connection", (websocket) => {
    let n = -1, k = 0;
    websocket.on("message", (message) => {
        console.log(message.toString());
        n = parseInt(message.toString().substring("10-01-client: ".length));
    });
    let interv = setInterval(() => {
        websocket.send(`10-01-server: ${n}->${++k}`);
        console.log(`message sent ${n}->${k}`)
    }, 5000);
    websocket.on("close", () => {
        //clearInterval(interv);
        console.log("one of those connections was closed");
    })
});

wsserver.on("error", (error)=>{
    console.error(error);
});