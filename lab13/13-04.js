const net = require("net");
const HOST = "127.0.0.1";
const port = 2000;

let timer = null;

let client = new net.Socket();
let buf = new Buffer.alloc(4);
client.connect(port,HOST, ()=>{
    let k = 0;
    timer = setInterval(()=>{
        client.write((buf.writeInt32LE(k++,0),buf));
        console.log(`sent: ${k}`);
    },1000);
});

client.on('data', data=>{
   console.log(`server: ${data.readInt32LE()}`);
});

client.on('close',()=>{
    console.log('client close');
});
client.on('error',(e)=>{
    console.log('client error'+e);
});

setTimeout(()=>{
    clearInterval(timer);
    client.end();
},20000);