const MNSDB = require("./MNSDB");
const http = require("http");
const url = require("url");
const fs = require("fs");
const User = require("./User");



//получение элементов
MNSDB.on("get", function (request, response) {
    let content = MNSDB.readFile();
    if (typeof url.parse(request.url, true).query.id != 'undefined') {
        let id = parseInt(url.parse(request.url, true).query.id);
        if (Number.isInteger(id)) {
            let res = content.findIndex(elem => elem.id == id);
            if (res >= 0) {
                response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
                response.end(JSON.stringify(content[res]));
            } else {
                response.writeHead(400);
                response.end("User with id " + id + " does not exist");
            }
        } else {
            response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
            response.end(JSON.stringify(content));
        }
    } else {
        response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
        response.end(JSON.stringify(content));
    }

});

//добавление элементов
MNSDB.on("post", async function (request, response) {
    const buffers = []; // буфер для получаемых данных

    for await (const chunk of request) {
        buffers.push(chunk);        // добавляем в буфер все полученные данные
    }

    const reqObj = JSON.parse(Buffer.concat(buffers).toString());
    console.log
    let item = new User(reqObj.name, reqObj.bday);
    let date = new Date(item.bday);
    if (item.bday === "" || item.name === "") {
        response.writeHead(400);
        response.end("Wrong chto-to");
        return;
    }
    if (date > new Date()) {
        response.writeHead(400);
        response.end("Wrong Date");
        return;
    }



    let content = MNSDB.readFile();
    if (content.length > 0)
        item.id = content[content.length - 1].id + 1;
    else
        item.id = 0;
    content.push(item);
    MNSDB.writeFile(content);
    response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
    response.end(JSON.stringify(item));
});

//обновление элементов по id
MNSDB.on("put", async function (request, response) {

    const buffers = []; // буфер для получаемых данных

    for await (const chunk of request) {
        buffers.push(chunk);        // добавляем в буфер все полученные данные
    }

    const item = Object.assign(new User(), JSON.parse(Buffer.concat(buffers).toString()));

    if (item instanceof User) {
        let content = MNSDB.readFile();
        let date = new Date(item.bday);

        if (item.bday === "" || item.name === "") {
            response.writeHead(400);
            response.end("Wrong chto-to");
            return;
        }
        if (date > new Date()) {
            response.writeHead(400);
            response.end("Wrong Date");
            return;
        }
        let indexToChange = content.findIndex(elem => elem.id == item.id);
        if (indexToChange < 0) {
            response.writeHead(400);
            response.end("Index not found " + indexToChange);
            return;
        }
        content[indexToChange].name = item.name;
        content[indexToChange].bday = item.bday;
        MNSDB.writeFile(content);
        response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
        response.end(JSON.stringify(content[indexToChange]));
    } else {
        response.writeHead(400);
        response.end("Not instance of user");
    }


});

MNSDB.on("delete", function (request, response) {
    if (typeof url.parse(request.url, true).query.id != 'undefined') {
        let id = parseInt(url.parse(request.url, true).query.id);
        if (Number.isInteger(id)) {
            let content = MNSDB.readFile();
            let indexToDelete = content.findIndex(elem => elem.id == id);
            if (indexToDelete == -1) {
                response.writeHead(400);
                response.end("user not found");
                return;
            }
            let deleted = content.splice(indexToDelete, 1);
            MNSDB.writeFile(content);
            response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
            response.end(JSON.stringify(deleted));
        } else {
            response.writeHead(400);
            response.end("id query param is not integer");
        }
    } else {
        response.writeHead(400);
        response.end("id query param is undefined");
    }

});

http.createServer(
    function (request, response) {
        if (url.parse(request.url, true).pathname === "/db") {
            switch (request.method) {
                case "GET":
                    MNSDB.select(request, response);
                    break;
                case "POST":
                    MNSDB.insert(request, response);
                    break;
                case "PUT":
                    MNSDB.update(request, response);
                    break;
                case "DELETE":
                    MNSDB.delete(request, response);
                    break;
            }
        } else if (url.parse(request.url, true).pathname === "/") {
            fs.createReadStream("index.html").pipe(response);
        } else {
            response.writeHead(404);
            response.end();
        }
    }
).listen(3000);
