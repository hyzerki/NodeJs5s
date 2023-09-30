const http = require("http");
const query = require("querystring");

let json = JSON.stringify({
    "__comment":"Запрос. Лаб 9-3",
    "x":5,
    "y":2,
    "s":"hello",
    "m": ["a","b"],
    "o":{"surname":"Meleshko", "name":"Nikita"}
});

let options = {
    method: "POST",
    port: 3000,
    host: "localhost",
    path: `/json`
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

request.end(json);