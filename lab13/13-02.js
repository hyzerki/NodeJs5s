//TCP-client
let net=require('net');

let host='127.0.0.1';
let port=2000;

let client=new net.Socket();


client.connect(port, host,()=>{
    console.log('client connected: '+client.remoteAddress+' '+client.remotePort);
    client.write('hello');
});
client.on('data',(data)=>{
    console.log('client data: '+data.toString());
    client.destroy();
});
client.on('close',()=>{
    console.log('client close');
});
client.on('error',(e)=>{
    console.log('client error'+e);
});