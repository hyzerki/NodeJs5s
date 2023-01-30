const net = require("net");
const HOST = "127.0.0.1";

let port = parseInt(process.argv[2],10);
if(isNaN(port)){
    console.log(`${process.argv[2]} is not a number`)
    process.exit(-1);
}

let timer = null;

let client = new net.Socket();
let buf = new Buffer.alloc(4);


client.connect(port,HOST, ()=>{
    timer = setInterval(()=>{
        client.write((buf.writeInt32LE(port,0),buf));
        console.log(`sent: ${port}`);
    },1000);
});

client.on('data', data=>{
    console.log(`${data}`);
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