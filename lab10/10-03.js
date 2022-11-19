const ws = require("ws")

const wsserver = new ws.Server({ port: 4000, host: 'localhost', path: '/broadcast' });
wsserver.on("connection", (websocket) => {
    websocket.on("message", (message) => {
        console.log(message.toString());
        wsserver.clients.forEach(client => {
            if(client.readyState === ws.OPEN)
            {
                client.send(message);
            }
        });
    });
    websocket.on("close", () => {

        console.log("one of those connections was closed");
    })
});

wsserver.on("error", (error)=>{
    console.error(error);
});