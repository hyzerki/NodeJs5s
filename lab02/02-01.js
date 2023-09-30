const fs = require("fs");
const http = require("http");

let server = http.createServer(function (request, response) {
    if (request.url == "/html" && request.method == "GET") {
        response.setHeader("Content-Type", "text/html; charset=utf-8;");
        response.writeHead(200);
        fs.createReadStream("02-01.html").pipe(response);
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(3000);