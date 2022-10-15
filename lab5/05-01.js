const MNSDB = require("./MNSDB");
const http = require("http");
const url = require("url");
const fs = require("fs");
const User = require("./User");





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
        } else if (url.parse(request.url, true).pathname === "/ss") {
            response.writeHead(200, { 'Content-Type': "application/json, charset=utf-8" });
            response.end(JSON.stringify(MNSDB.statistics));
        } else {
            response.writeHead(404);
            response.end();
        }
    }
).listen(3000);

process.stdin.on('data', (data) => {
    data = data.toString().trim().toLowerCase();
    //console.log("input: " + data)
    //if (data == 'exit') process.exit(0);
    let dataParams = data.split(' ');
    if (dataParams[0] !== undefined) {
        //console.log("Command " + dataParams[0]);
        //console.log("Param " + dataParams[1]);
        switch (dataParams[0]) {
            case "sd":
                if (dataParams[1] != undefined) {
                    dataParams[1] = Number(dataParams[1]);
                    if (!Number.isNaN(dataParams[1]) && global.sdCd == undefined) {
                        global.sdCd = setTimeout(() => {
                            if (global.ssCd != undefined)
                                global.ssCd.unref();
                            if (global.scCd != undefined)
                                global.scCd.unref();
                            process.exit(0);
                        }, dataParams[1] * 1000);
                        console.log("Shutdown after " + dataParams[1] + " sec");
                    }
                } else {
                    if (global.sdCd != undefined){
                        clearTimeout(global.sdCd);
                        global.sdCd = undefined;
                    }
                }
                break;

            case "sc":
                //console.log("sc called");
                if (dataParams[1] != undefined) {
                    dataParams[1] = Number(dataParams[1]);
                    if (!Number.isNaN(dataParams[1])&& global.scCd == undefined) {
                        if (global.scCd != undefined)
                            global.scCd.unref();
                        global.scCd = setInterval(() => {
                            MNSDB.commit();
                        }, dataParams[1] * 1000);
                        console.log("Commit every " + dataParams[1] + " sec");
                    }
                } else {
                    if (global.scCd != undefined){
                        clearInterval(global.scCd);
                        global.scCd = undefined;
                    }
                        //global.scCd.unref();
                }
                break;

            case "ss":
                //console.log("ss called");
                if (dataParams[1] != undefined) {
                    dataParams[1] = Number(dataParams[1]);
                    if (!Number.isNaN(dataParams[1])&& global.ssCd == undefined) {
                        if (!MNSDB.collectStatistics) {
                            MNSDB.startStatGathering();
                            global.ssCd = setTimeout(() => {
                                MNSDB.endStatGathering();
                            }, dataParams[1] * 1000);
                            console.log("Gathering statistics for " + dataParams[1] + " sec");
                        }
                    }
                } else {
                    if (MNSDB.collectStatistics) {
                        MNSDB.endStatGathering();
                        if (global.ssCd != undefined){
                            clearTimeout(global.ssCd);
                            global.ssCd = undefined;
                            MNSDB.endStatGathering();
                        }
                    }
                }
                break;
        }
    }
    //sc коммиты через время
    //ss сбор статистики
})