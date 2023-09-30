const http = require("http");
const url = require("url");
const fs = require("fs");
const qs = require('querystring');
const xmlParseString = require("xml2js").parseString;
const xmlbuilder = require("xmlbuilder");
const stat = require("./m07-01")("./static");
const mp = require("multiparty");

const server1Sockets = new Set();



const getHeaders = function (req) {
    let rs = "";
    for (key in req.headers) rs += "<h3>" + key + ": " + req.headers[key] + "</h3>";
    return rs;
}


let connectionsCount = 0;
const server = http.createServer(async (request, response) => {
    let urlPathname = url.parse(request.url).pathname;
    if (urlPathname === "/connection" && request.method === "GET") {
        if (url.parse(request.url, true).query.set != undefined) {
            let newKAT = parseInt(url.parse(request.url, true).query.set);
            if (!Number.isNaN(newKAT)) {
                response.writeHead(200);
                response.write(`KeepAliveTimeout has changed from ${server.keepAliveTimeout} to ${newKAT}`);
                server.keepAliveTimeout = newKAT;
                response.end();
            }
            else {
                response.writeHead(400);
                response.end("set is NaN");
            }
            return;
        }
        response.writeHead(200);
        response.end(`KeepAliveTimeout: ${server.keepAliveTimeout}`);

    } else if (urlPathname === "/headers" && request.method === "GET") {
        response.setHeader("Knock-knock", "my politically incorrect racial epithets");
        response.setHeader("Content-Type", "text/html");
        response.writeHead(200);
        response.write(getHeaders(request));
        response.write("<h1>Response Headers</h1>")
        for (var item in response.getHeaders()) {
            response.write("<h3>" + item + ": " + response.getHeader(item) + "</h3>");
        }
        response.end();

    } else if (urlPathname === "/parameter" && request.method === "GET") {
        if (url.parse(request.url, true).query.x != undefined && url.parse(request.url, true).query.y != undefined) {
            let x = parseInt(url.parse(request.url, true).query.x), y = parseInt(url.parse(request.url, true).query.y);
            if (!isNaN(x) && !isNaN(y)) {
                response.writeHead(200, { "Content-Type": "text/html" });
                response.write(`${x}+${y}=${(x + y)}<br>`);
                response.write(`${x}-${y}=${(x - y)}<br>`);
                response.write(`${x}*${y}=${(x * y)}<br>`);
                response.write(`${x}/${y}=${(x / y)}<br>`);
                response.end();
                return;
            }
        }
        response.writeHead(200);
        response.end("error " + request.url);
    } else if (new RegExp(/^\/parameter\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+$/).test(urlPathname) && request.method === "GET") {
        let parts = urlPathname.split("/");
        let x = parseInt(parts[2]), y = parseInt(parts[3]);
        if (!isNaN(x) && !isNaN(y)) {
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(`${x}+${y}=${(x + y)}<br>`);
            response.write(`${x}-${y}=${(x - y)}<br>`);
            response.write(`${x}*${y}=${(x * y)}<br>`);
            response.write(`${x}/${y}=${(x / y)}<br>`);
            response.end();
            return;
        }
        response.writeHead(400);
        response.end(request.url);
    } else if (urlPathname === "/close" && request.method === "GET") {
        response.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
        response.end("Сервер закроется через 10 секнуд");
        request.socket.destroy();
        setTimeout(() => {
            for (const socket of server1Sockets.values()) {
                socket.destroy();
            }
            server.close();
            setImmediate(function(){server.emit('close')});
        }, 10 * 1000);
    } else if (urlPathname === "/socket" && request.method === "GET") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
            "server adress": request.socket.localAddress,
            "server port": request.socket.localPort,
            "remote adress": request.socket.remoteAddress,
            "remote port": request.socket.remotePort
        }));
    } else if (urlPathname === "/req-data" && request.method === "GET") {
        let cnt = 0;
        for await (const chunk of request) {
            console.log(chunk.toString());
            console.log("NEW CHUNK " + (++cnt));
        }
        response.end(cnt.toString());
    } else if (urlPathname === "/resp-status" && request.method === "GET") {
        if (url.parse(request.url, true).query.code === undefined || url.parse(request.url, true).query.mess === undefined) {
            response.writeHead(400);
            response.end()
            return;
        }
        let code = parseInt(url.parse(request.url, true).query.code), message = url.parse(request.url, true).query.mess;
        if (isNaN(code)) {
            response.writeHead(400);
            response.end()
            return;
        }

        response.statusCode = code;
        response.statusMessage = message;
        response.end();
    } else if (urlPathname === "/formparameter") {
        if (request.method === "GET") {
            fs.createReadStream("formparameter.html").pipe(response);
        } else if (request.method === "POST") {
            const buffers = [];
            for await (const chunk of request) {
                buffers.push(chunk);
            }
            const requestBody = Buffer.concat(buffers).toString();
            let post = qs.parse(requestBody);
            let resstr = "";
            for (key in post) {
                resstr += `<h1>${key} : ${post[key]}<h1>`;
            }
            response.writeHead(200, { "Content-Type": "text/html" });
            response.end(resstr);
        }
    } else if (urlPathname === "/json" && request.method === "POST") {
        const buffers = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }
        const rjs = JSON.parse(Buffer.concat(buffers).toString());
        let respObj = {
            "__comment": rjs.__comment,
            "x_plus_y": rjs.x + rjs.y,
            "Concatenation_s_o": `${rjs.s}: ${rjs.o.surname}, ${rjs.o.name}`,
            "Length_m": rjs.m.length
        };
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(respObj));


    } else if (urlPathname === "/xml" && request.method === "POST") {
        const buffers = [];
        for await (const chunk of request) {
            buffers.push(chunk);
        }
        const requestBody = Buffer.concat(buffers).toString();

        let obj = null;

        xmlParseString(requestBody, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            xsum = 0;
            result.request.x.map((e, i) => {
                xsum += parseInt(e.$.value);
            });
            msum = "";
            result.request.m.map((e, i) => {
                msum += e.$.value;
            });
            obj = xmlbuilder.create("response").att("id", "33").att("request", result.request.$.id);
            obj.ele("sum").att("element", "x").att("result", xsum)
                .up().ele("concat").att("element", "m").att("result", msum);
        });
        if (obj == null) {
            response.writeHead(400);
            response.end("Error parsing xml");
        } else {
            response.writeHead(200, { "Content-Type": "text/xml" });
            response.end(obj.toString({ pretty: true }));
        }

    } else if (urlPathname === "/files" && request.method === "GET") {
        let amount = fs.readdirSync("./static").length;
        response.writeHead(200, { "X-static-files-count": amount });
        response.end();
    } else if (new RegExp(/^\/files\/[0-9a-zA-Z]+\.[0-9a-zA-Z]+$/).test(urlPathname) && request.method === "GET") {
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
    } else if (urlPathname === "/upload") {
        if (request.method === "GET") {
            fs.createReadStream("upload.html").pipe(response);
        } else if (request.method === "POST") {
            let resp = "";
            let form = new mp.Form({ uploadDir: "./static" });
            form.on("file", (name, file) => {
                fs.renameSync(file.path, `./static/${file.originalFilename}`);
            });
            form.on("error", () => {
                response.writeHead(400);
                response.end("error ocured");
            });
            form.on("close", () => {
                response.writeHead(200);
                response.end(resp + "vse ok");
            });
            form.parse(request);
        }
    } else {
        response.writeHead(404);
        response.end("Page not found");
    }
    //response.end();
    /*enctype
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
            "server adress": request.socket.localAddress,
            "server port": request.socket.localPort,
            "remote adress": request.socket.remoteAddress,
            "remote port": request.socket.remotePort
        }));*/
});

server.on("connection", (socket) => {
    console.log(`${new Date().toTimeString().substring(0, 8)}.${new Date().getMilliseconds()} New connection established for ${server.keepAliveTimeout} ms. `, ++connectionsCount);
    server1Sockets.add(socket);
    socket.on("close", () => {
        server1Sockets.delete(socket);
    });
})



server.listen(3000);