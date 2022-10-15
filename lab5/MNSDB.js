const EventEmmiter = require("events");
const fs = require("fs");
const url = require("url");
const User = require("./User");

class MNSDB extends EventEmmiter {
    collectStatistics = false;
    statistics = { started: null, finished: null, commits: null, requests: null };

    select(request, response) {
        if (this.collectStatistics) {
            this.statistics.requests++;
        }
        this.emit("get", request, response);
    }
    insert(request, response) {
        if (this.collectStatistics) {
            this.statistics.requests++;
        }
        this.emit("post", request, response);
    }
    update(request, response) {
        if (this.collectStatistics) {
            this.statistics.requests++;
        }
        this.emit("put", request, response);
    }
    delete(request, response) {
        if (this.collectStatistics) {
            this.statistics.requests++;
        }
        this.emit("delete", request, response);
    }
    commit() {
        if (this.collectStatistics) {
            this.statistics.commits++;
        }
        this.emit("commit");
    }

    startStatGathering() {
        this.collectStatistics = true;
        this.statistics = { started: new Date(), finished: null, commits: 0, requests: 0 };
    }

    endStatGathering() {
        this.collectStatistics = false;
        this.statistics.finished = new Date();
        console.log("Statistics gathering finished");
    }


    readFile() {
        fs.access("dbstorage.json", fs.constants.R_OK, err => {
            if (err) {
                fs.writeFileSync("dbstorage.json", JSON.stringify([]));
            }
        });
        return JSON.parse(fs.readFileSync("dbstorage.json", "utf-8"));
    }

    writeFile(content) {
        fs.writeFileSync("dbstorage.json", JSON.stringify(content));
    }

}

let db = new MNSDB();

//получение элементов
db.on("get", function (request, response) {
    let content = db.readFile();
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
db.on("post", async function (request, response) {
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
    let content = db.readFile();
    if (content.length > 0)
        item.id = content[content.length - 1].id + 1;
    else
        item.id = 0;
    content.push(item);
    db.writeFile(content);
    response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
    response.end(JSON.stringify(item));
});

//обновление элементов по id
db.on("put", async function (request, response) {
    const buffers = []; // буфер для получаемых данных
    for await (const chunk of request) {
        buffers.push(chunk);        // добавляем в буфер все полученные данные
    }
    const item = Object.assign(new User(), JSON.parse(Buffer.concat(buffers).toString()));
    if (item instanceof User) {
        let content = db.readFile();
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
        db.writeFile(content);
        response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
        response.end(JSON.stringify(content[indexToChange]));
    } else {
        response.writeHead(400);
        response.end("Not instance of user");
    }
});

db.on("delete", function (request, response) {
    if (typeof url.parse(request.url, true).query.id != 'undefined') {
        let id = parseInt(url.parse(request.url, true).query.id);
        if (Number.isInteger(id)) {
            let content = db.readFile();
            let indexToDelete = content.findIndex(elem => elem.id == id);
            if (indexToDelete == -1) {
                response.writeHead(400);
                response.end("user not found");
                return;
            }
            let deleted = content.splice(indexToDelete, 1);
            db.writeFile(content);
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

db.on("commit", function () {
    console.log("committed");
});

module.exports = db;