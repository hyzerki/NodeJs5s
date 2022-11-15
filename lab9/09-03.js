const http = require("http");
const query = require("querystring");

let params = query.stringify({
    x: 5,
    y: 2,
    s: "hello",
});

let options = {
    method: "POST",
    port: 3000,
    host: "localhost",
    path: `/formparameter`
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

request.write(params);

request.end();