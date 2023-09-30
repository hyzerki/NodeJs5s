const readline = require("readline");
const http = require("http");

global.appState = "norm";

let server = http.createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end(appState);
});


server.listen(3000);


let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


rl.on('line', (input) => {
    input = input.toLowerCase();
    if (input === "exit")
        process.exit(0);
    switch (input) {
        case "norm":
        case "idle":
        case "test":
        case "stop":
            console.log(appState + " > " + input);
            appState = input;
            break;
        default:
            console.log(appState + " x " + input);
            break;
    }
    rl.pause();
    rl.resume();
    rl.prompt();
});

rl.prompt();