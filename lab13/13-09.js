const udp = require('dgram');
const port = 3000;

let server = udp.createSocket('udp4');
server.on('error', (err)=>{
    console.log(err);
    server.close();
});

server.on("message",(msg, info) =>{
    console.log('<- ' + msg.toString());
    server.send(Buffer.from("echo: "+msg.toString()), info.port, info.address, (err)=>{
        if(err){
            server.close();
        }else{
            console.log('-> ' + msg.toString());
        }
    })
})

server.on('listening', ()=>{
    console.log('started listening');
});

server.bind(port);