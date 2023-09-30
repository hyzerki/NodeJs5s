const http = require("http");
const fs = require("fs");

const getHeaders = function (req) {
    let rs = "";
    for (key in req.headers) rs += "<h3>" + key + ": " + req.headers[key] + "</h3>";
    return rs;
}


let server = http.createServer((request, response) => {
    let body = "";
    request.on("data", chunk => {
        body += chunk;
    });
    request.on("end", () => {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

        fs.readFile("resp.html", "utf8", function (error, data) {


            data = data.replace("{headers}", getHeaders(request))
                .replace("{method}", request.method)
                .replace("{uri}", request.url)
                .replace("{version}", request.httpVersion)
                .replace("{body}", body);
            response.end(data);
        })
    });



});

server.listen(3000);