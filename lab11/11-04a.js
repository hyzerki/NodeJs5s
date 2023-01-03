const websocket=require('ws');

const ws=new websocket('ws://localhost:4000');

let x=typeof process.argv[2]=='undefined'?'A':process.argv[2];

ws.on('open',()=>{
    ws.on('message', data=>{
        console.log('on message: ', JSON.parse(data));
    });
    let k=0;
    setInterval(() => {
        ws.send(JSON.stringify({client: x, timestamp: new Date().toISOString()}));
    }, 3000);
})