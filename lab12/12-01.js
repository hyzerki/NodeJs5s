let http = require('http');
const url = require('url');
const fs = require('fs');

const rpcWSS = require('rpc-websockets').Server;
const wsserver = new rpcWSS({ port: 4000, host: 'localhost' });

wsserver.event('Change file');



let isStudentList = fn => {
    let reg = new RegExp('[0-9]+_StudentList.json');
    return reg.test(fn);
};

let http_handler = (req, resp) => {
    if (req.method == 'GET') {
        if (url.parse(req.url, true).pathname == '/') {
            fs.readFile('./file/StudentList.json', (e, data) => {
                if (e) {
                    resp.writeHead(200, { 'Content-Type': 'application/json' });
                    resp.end(`{"error":1, "message":"${e}"}`);
                }
                else {
                    let result;
                    result += data.toString();
                    resp.writeHead(200, { 'Content-Type': 'application/json' });
                    resp.end(result);
                }
            });
        }
        else if (url.parse(req.url, true).pathname.match('/[0-9]+') != null) {
            fs.readFile('./file/StudentList.json', (e, data) => {
                if (e) {
                    resp.writeHead(200, { 'Content-Type': 'application/json' });
                    resp.end(`{"error":2, "message":"${e}"}`);
                }
                else {
                    let result;
                    let id = url.parse(req.url, true).pathname.split('/')[1];
                    let file = JSON.parse(data);
                    file.forEach(element => {
                        if (element.id == id)
                            result = {
                                id: element.id,
                                name: element.name,
                                bday: element.bday,
                                specility: element.specility
                            }
                    });
                    if (result == undefined) {
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end(`{"error":3, "message":"id ${id} not found"}`);
                    }
                    else {
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end(JSON.stringify(result));
                    }
                }
            });
        }
        else if (url.parse(req.url, true).pathname == '/backup') {
            let result = [];
            fs.readdirSync('./file/').map(fileName => {
                console.log(fileName);
                if (isStudentList(fileName)) {
                    console.log(fileName);
                    result.push({"filename:" : fileName});
                }
            });
            console.log(JSON.stringify(result));
            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(result));
        }
    }
    else if (req.method == 'POST') {
        if (url.parse(req.url, true).pathname == '/') {
            let body = '';
            let student = '[';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                let isIndex = true;
                let json = JSON.parse(body);
                index = json.id;
                fs.readFile('./file/Studentlist.json', (e, data) => {
                    let os = JSON.parse(data);

                    os.forEach(element => {
                        student += `{"id":${element.id}, "name":"${element.name}","bday":"${element.bday}","specility":"${element.specility}"},`;

                        if (element.id == index) {
                            isIndex = false;
                        }
                    });
                    if (isIndex) {
                        student += body + ']';
                        fs.writeFile('./file/Studentlist.json', student, e => {
                            console.log('done');
                        });
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end(body);
                    } else {
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end('{"error":7,"message":"already exist"}');
                    }
                });
            })
        }
        else if (url.parse(req.url, true).pathname == '/backup') {
            setTimeout(() => {
                let date = new Date();
                let name = '';
                name += date.getFullYear();
                name += date.getMonth() + 1;
                name += date.getDate();
                name += date.getHours();
                name += date.getMinutes();
                name += '_StudentList.json';
                console.log(name);
                fs.copyFile('./file/StudentList.json', './file/' + name, e => {
                    console.log('success');
                    wsserver.emit('Change file', 'file changed');
                    resp.writeHead(200, { 'Content-Type': 'text/plain' });
                    resp.end('file copied');
                });
            }, 2000);
        }
    }
    else if (req.method == 'PUT') {
        if (url.parse(req.url, true).pathname == '/') {
            let body = '';
            let exist = false;
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                let result = '[';
                let json = JSON.parse(body);
                let index = json.id;

                fs.readFile('./file/Studentlist.json', (e, data) => {
                    let os = JSON.parse(data);
                    os.forEach(element => {
                        if (index == element.id) {
                            result += body + ',';
                            exist = true;
                        } else
                            result += `{"id":${element.id}, "name":"${element.name}","bday":"${element.bday}","specility":"${element.specility}"},`;
                    });

                    if (exist) {
                        result = result.substring(0, result.length - 1);
                        result += ']';
                        fs.writeFile('./file/Studentlist.json', result, e => {
                            console.log('success');
                        });
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end(body);
                    } else {
                        resp.writeHead(200, { 'Content-Type': 'application/json' });
                        resp.end('{"error":8,"message":"student not found"}');
                    }
                });
            });
        }
    }
    else if (req.method == 'DELETE') {
        if (url.parse(req.url, true).pathname.match("/backup/[0-9]{4}[0-9]{2}[0-9]{2}") != null) {
            let date = url.parse(req.url).pathname.split('/')[2];
            if (date.length === 8) {
                fs.readdirSync('./file/').map(fileName => {
                    if (isStudentList(fileName)) {
                        let result = fileName.split('_')[0];
                        if (result > date) {
                            fs.unlink('./file/' + fileName, e => { });
                        }
                    }
                });
                wsserver.emit('Change file', 'file changed');
                resp.end('deleted');
            } else {
                resp.end('error, incorrect date');
                return;
            }
        }
        else if (url.parse(req.url, true).pathname.match('/[0-9]+') != null) {
            let exist = false;
            let body = '';
            let index = url.parse(req.url).pathname.split('/')[1];
            let result = '[';
            fs.readFile('./file/Studentlist.json', (e, data) => {
                let os = JSON.parse(data);
                os.forEach(element => {
                    if (index == element.id) {
                        body += `{"id":${element.id}, "name":"${element.name}","bday":"${element.bday}","specility":"${element.specility}"},`;
                        exist = true;
                    } else
                        result += `{"id":${element.id}, "name":"${element.name}","bday":"${element.bday}","specility":"${element.specility}"},`;
                });

                if (exist) {
                    result = result.substring(0, result.length - 1);
                    result += ']';
                    fs.writeFile('./file/Studentlist.json', result, e => {
                        console.log('success');
                    });
                    resp.writeHead(200, { 'Content-Type': 'application/json' });
                    wsserver.emit('Change file', 'file changed');
                    resp.end(body);
                } else {
                    let error = '{"error":9,"message":"student not found"}';
                    resp.writeHead(200, { 'Content-Type': 'application/json' });
                    resp.end(error);
                }
            });
        }
    }
}

let server = http.createServer(function (req, res) {
    http_handler(req, res);
}).listen(5000);



try{
    fs.watch('./file/Studentlist.json', (event, f)=> {
        if(f){
            wsserver.emit("Change file", "File changed");
        }
    })
}catch(e){
    console.log("catch " + e);
}