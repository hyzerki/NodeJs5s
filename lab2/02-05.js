const fs = require("fs");
const http = require("http");

const res = function (request, response) {
    response.setHeader("Content-Type", "text/plain; charset=utf-8;");
    response.writeHead(200);
    response.end("Мелешко Никита Сергеевич");
}

let server = http.createServer(function (request, response) {
    if (request.url == "/jquery" && request.method == "GET") {
        response.setHeader("Content-Type", "text/html; charset=utf-8;");
        response.writeHead(200);
        fs.createReadStream("jquery.html").pipe(response);
    } else if (request.url == "/api/name" && request.method == "GET") {
        setTimeout((request, response) => {
            res(request, response);
        }, 3000, request, response);
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(3000);