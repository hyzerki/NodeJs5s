const udp = require('dgram');
const client = udp.createSocket('udp4');
const port= 3000;

client.on('message', (msg, info)=>{
    console.log(msg.toString());
    client.close();
});

client.send(Buffer.from('13-10.js message'),port,'localhost', (err)=>{
   if(err)
       client.close();
});

