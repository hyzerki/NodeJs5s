const http = require("http");
const query = require("querystring");

let params = query.stringify({ x: 5, y: 6 });


let options = {
    method: "GET",
    port: 3000,
    host: "localhost",
    path: `/parameter?${params}`
}

let request = http.request(options, (response) => {
    console.log(" " + response.statusCode);

    let data = "";
    response.on("data", (chunk) => {
        data += chunk.toString("utf8")
    });

    response.on("end", () => {
        console.log("body " + data);
    });

});

request.on("error", (e) => {
    console.log("error" + e.message);
});

request.end();