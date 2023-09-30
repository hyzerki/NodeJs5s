const http = require("http");
const fs = require("fs");


http.createServer((req, res)=>{
    if(req.url === '/fetch'){
        fs.createReadStream('./fetch.html').pipe(res);
    }else if( req.url==='/api/name'){
        res.end("Никита Мелешко");
    }
}).listen(3000);