const EventEmmiter = require("events");
const fs = require("fs");

class MNSDB extends EventEmmiter {
    select(request, response) {
        this.emit("get", request, response);
    }
    insert(request, response) {
        this.emit("post", request, response);
    }
    update(request, response) {
        this.emit("put", request, response);
    }
    delete(request, response) {
        this.emit("delete", request, response);
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

module.exports = db;