const fs = require("fs");
const http = require("http");
const url = require("url");

let fib = (n) => { return (n < 2 ? n : fib(n - 1) + fib(n - 2)); }

function Fib(n, cb) {
    this.fn = n;
    this.ffib = fib;
    this.fcb = cb;
    this.calc = () => { process.nextTick(() => { this.fcb(null, this.ffib(this.fn)); }); }
}

let server = http.createServer((request, response) => {
    if (url.parse(request.url).pathname === "/fib") {
        if (typeof url.parse(request.url, true).query.k != 'undefined') {
            let k = parseInt(url.parse(request.url, true).query.k);
            if (Number.isInteger(k)) {
                response.writeHead(200, { 'Content-Type': 'application/json, charset=utf-8' });
                new Fib(k, (err, result) => { response.end(JSON.stringify({ k: k, fib: result })) }).calc();
            }
        }
    } else if (url.parse(request.url).pathname === "/") {
        fs.createReadStream("03-03.html").pipe(response);
    }
    else {
        response.writeHead(404);
        response.end();
    }
});


server.listen(3000);