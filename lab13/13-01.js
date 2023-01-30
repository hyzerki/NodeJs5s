//TCP-server
//строковое сообщение, возвращать клиенту текст с eсho
const net=require('net');

let host='0.0.0.0';
let port=2000;

net.createServer((sock)=>{
    console.log('server connected: '+sock.remoteAddress+': '+sock.remotePort);
    sock.on('data',(data)=>{
        console.log('server data: ', sock.remoteAddress+': '+data.toString());
        sock.write('echo: '+ data);
    });
    sock.on('close',()=>{
        console.log('server closed: ',sock.remoteAddress+''+sock.remotePort);
    });

}).listen(port,host);


console.log('TCP-server '+host+': '+port);