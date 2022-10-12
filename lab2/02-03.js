const fs = require("fs");
const http = require("http");



let server = http.createServer(function (request, response) {
    if (request.url == "/api/name" && request.method == "GET") {
        response.setHeader("Content-Type", "text/plain; charset=utf-8;");
        response.writeHead(200);
        response.end("Мелешко Никита Сергеевич");
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(3000);