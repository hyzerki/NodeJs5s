let http = require("http");

let options = {
    method: "GET",
    port: 3000,
    host: "localhost",
    path: "/"
}

let request = http.request(options, (response) => {
    console.log("status" + response.statusCode);
    console.log("status message" + response.statusMessage);
    console.log("ip address" + response.socket.remoteAddress);
    console.log("port" + response.socket.remotePort);

    let data = "";
    response.on("data", (chunk) => {
        data += chunk.toString("utf8")
    });

    response.on("end", () => {
        console.log("body" + data);
    });

});

request.on("error", (e) => {
    console.log("error" + e.message);
});

request.end();