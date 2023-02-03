const net = require("net");

const PORT = 2000, IP="0.0.0.0";

let sum = 0;

let server = net.createServer((socket)=>{
    console.log("new connection");
    socket.on("data", (data) => {
        sum += data.readInt32LE();
        console.log(`sum: ${sum}`);
    });

    let buf = new Buffer.alloc(4);
    let interval = setInterval(() => {
        buf.writeInt32LE(sum, 0);
        socket.write(buf);
        console.log(`write: ${sum}`);
    }, 5000)

    socket.on('close', data => {
        console.log('Client closed');
        clearInterval(interval);
    });


    socket.on("error", error =>{
        console.log(error);
    });

    socket.on("")
});
/*
server.on("connection", (socket)=> {
    console.log("new connection");
    socket.on("data", (data) => {
        sum += data.readInt32LE();
        console.log(`sum: ${sum}`);
    });

    let buf = new Buffer.alloc(4);
    let interval = setInterval(() => {
        buf.writeInt32LE(sum, 0);
        socket.write(buf);
        console.log(`write: ${sum}`);
    }, 5000)

    socket.on('close', data => {
        console.log('Client closed');
        clearInterval(interval);
    });


    socket.on("error", error =>{
        console.log(error);
    });
});*/

server.on("error", error =>{
   console.log(error);
});

server.listen(PORT, IP);

