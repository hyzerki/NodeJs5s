const http = require("http");

let server = http.createServer((request,response)=>{
    response.writeHead(200,{'Content-Type':'text/html'});
    response.end('<h1>Hello World!</h1>');
});

server.listen(3000);