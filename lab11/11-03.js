const WebSocket = require('ws');

let messNum = 0;


const wss = new WebSocket.Server({port:3000, host: 'localhost'});
wss.on('connection', (ws)=>{

});

function sendMessages()
{
    wss.clients.forEach(client => {
            client.send(`11-03-server: ${messNum}`);
    });
}

function checkClients()
{
    wss.clients.forEach(client => {
        client.ping(``);
    });
    console.log(`Clients check: ${wss.clients.size}`)
}

setInterval(() => {
    messNum++;
    sendMessages();
}, 15000);

setInterval(() => {
    checkClients();
}, 5000);

