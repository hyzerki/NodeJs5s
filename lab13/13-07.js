const net = require('net');
const host = '0.0.0.0';
const ports = [40000,50000];

handle = function(socket){
    console.log(`new connection: ${socket.localPort}`);
    socket.on('data', (data)=>{
        socket.write(`echo: ${data.readInt32LE()}`);
    });

    socket.on('close', ()=>{
        console.log(`client closed`)
    })
}

net.createServer(handle).listen(ports[0], host);
net.createServer(handle).listen(ports[1], host);