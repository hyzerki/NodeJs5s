const http = require("http");
const stat = require("./m07-01.js")();


http.createServer((request, response) => {
    if (stat.isStatic("html", request.url))
        stat.sendFile(request, response, { "Content-Type": "text/html; charset=utf-8" });
    else if (stat.isStatic("css", request.url))
        stat.sendFile(request, response, { "Content-Type": "text/css; charset=utf-8" });
    else if (stat.isStatic("js", request.url))
        stat.sendFile(request, response, { "Content-Type": "text/javascript; charset=utf-8" });
    else if (stat.isStatic("docx", request.url))
        stat.sendFile(request, response, { "Content-Type": "application/msword" });
    else if (stat.isStatic("mp4", request.url))
        stat.sendFile(request, response, { "Content-Type": "video/mp4" });
    else if (stat.isStatic("json", request.url))
        stat.sendFile(request, response, { "Content-Type": "application/json; charset=utf-8" });
    else if (stat.isStatic("xml", request.url))
        stat.sendFile(request, response, { "Content-Type": " text/xml; charset=utf-8" });
    else if (stat.isStatic("png", request.url))
        stat.sendFile(request, response, { "Content-Type": " image/png" });
    else
        stat.writeHTTP404(response);
}).listen(3000);