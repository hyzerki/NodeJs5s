const net = require("net");
const HOST = "127.0.0.1";
const port = 2000;

let x = parseInt(process.argv[2],10);
if(isNaN(x)){
    console.log(`${process.argv[2]} is not a number`)
    process.exit(-1);
}

let timer = null;

let client = new net.Socket();
let buf = new Buffer.alloc(4);


client.connect(port,HOST, ()=>{

    timer = setInterval(()=>{
        client.write((buf.writeInt32LE(x,0),buf));
        console.log(`sent: ${x}`);
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