const fs = require("fs");
const http = require("http");

let server = http.createServer(function (request, response) {
    if (request.url == "/jpg" && request.method == "GET") {
        response.setHeader("Content-Type", "image/jpeg;");
        response.writeHead(200);
        fs.createReadStream("pic.jpg").pipe(response);
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(3000);