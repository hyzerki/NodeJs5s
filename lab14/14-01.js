const sql = require('mssql');
const http = require('http');
const fs = require('fs');

const sqlConfig = {
    database: 'node_14',
    user: 'node_14',
    password: 'node14enjoyer',
    server: 'localhost',
    pool: {
        max: 10,
        min: 4,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false, // for azure
        trustServerCertificate: true // change to true for local dev / self-signed certs

    }
}

const tableMap = new Map([
    ["faculties","FACULTY"],
    ["pulpits","PULPIT"],
    ["subjects","SUBJECT"],
    ["auditoriumstypes","AUDITORIUM_TYPE"],
    ["auditoriums","AUDITORIUM"]
]);


const pool = new sql.ConnectionPool(sqlConfig, err => {
    if(err)
        console.log(err);
});

const server = http.createServer(async (request, response)=>{
    let dUri = decodeURI(request.url);

    const buffers = []; // буфер для получаемых данных
    for await (const chunk of request) {
        buffers.push(chunk);        // добавляем в буфер все полученные данные
    }
    const bodyString = Buffer.concat(buffers).toString()


    if(request.method === 'GET'){

        if(dUri ==='/'){
            response.writeHead(200);
            fs.createReadStream('index.html').pipe(response);
        } else if( new RegExp('^\/api\/[a-zA-z]+$').test(dUri)&& Array.from(tableMap.keys()).includes(dUri.split('/')[2])) {
            let table = tableMap.get(dUri.split('/')[2]);
            pool.connect()
                .then(connection => {
                    return connection.query(`select * from ${table}`);
                })
                .then(result => {
                    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(JSON.stringify(result.recordset));
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(()=>{
                    pool.close();
                })
        }else if(new RegExp('^\/api\/faculty\/\\S+\/pulpits$').test(dUri)){
            pool.connect()
                .then(connection => {
                    return connection.query(`select * from PULPIT where PULPIT.FACULTY = '${dUri.split('/')[3]}'`);
                })
                .then(result => {
                    response.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(JSON.stringify(result.recordset));
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(()=>{
                    pool.close();
                })
        }else if(new RegExp('^\/api\/auditoriumtypes\/\\S+\/auditoriums$').test(dUri)){
            pool.connect()
                .then(connection => {
                    return connection.query(`select * from AUDITORIUM as a 
                                             inner join AUDITORIUM_TYPE as at on a.AUDITORIUM_TYPE = at.AUDITORIUM_TYPE 
                                             where at.AUDITORIUM_TYPE = '${dUri.split('/')[3]}'`);
                })
                .then(result => {
                    response.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(JSON.stringify(result.recordset));
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(()=>{
                    pool.close();
                })
        }else{
            response.writeHead(404);
            response.end();
        }
    }else if(request.method === 'POST'){
        if( new RegExp('^\/api\/[a-zA-z]+$').test(dUri)&& Array.from(tableMap.keys()).includes(dUri.split('/')[2])) {
            let bodyObject =  JSON.parse(bodyString);
            let keys = "";
            let values = "";
            let objKeysArr = Object.keys(bodyObject);
            for (let i = 0; i < objKeysArr.length; ++i) {
                let key = objKeysArr[i];
                if (i != 0) {
                    keys += ` , ${key} `;
                    values += ` , '${bodyObject[key]}' `;
                } else {
                    keys += ` ${key} `;
                    values += ` '${bodyObject[key]}' `;
                }
            }
            let table = tableMap.get(dUri.split('/')[2]);
            pool.connect()
                .then(connection => {
                    return connection.query(
                        `insert into ${table} (${keys}) values (${values})`
                    );
                })
                .then(result => {
                    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(JSON.stringify(bodyObject));
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(() => {
                    pool.close();
                })
        }else{
            response.writeHead(404);
            response.end();
        }
    }else if(request.method === 'PUT'){
        if( new RegExp('^\/api\/[a-zA-z]+$').test(dUri)&& Array.from(tableMap.keys()).includes(dUri.split('/')[2])) {
            let bodyObject = JSON.parse(bodyString);
            let updateStr = "";
            let objKeysArr = Object.keys(bodyObject);
            for (let i = 0; i < objKeysArr.length; ++i) {
                let key = objKeysArr[i];
                if (i != 0) {
                    updateStr += `,${key}='${bodyObject[key]}'`;
                } else {
                    updateStr += `${key}='${bodyObject[key]}'`;
                }
            }
            let table = tableMap.get(dUri.split('/')[2]);
            pool.connect()
                .then(connection => {
                    return connection.query(
                        `update ${table} set ${updateStr} where ${objKeysArr[0]}='${bodyObject[objKeysArr[0]]}'`
                    );
                })
                .then(result => {
                    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(JSON.stringify(bodyObject));
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(() => {
                    pool.close();
                })
        }else{
            response.writeHead(404);
            response.end();
        }
    }else if(request.method === 'DELETE'){
        if( new RegExp('^\/api\/[a-zA-z]+\/\\S+$').test(dUri)&& Array.from(tableMap.keys()).includes(dUri.split('/')[2])) {
            let table = tableMap.get(dUri.split('/')[2]);
            let code = dUri.split('/')[3];
            pool.connect()
                .then(connection => {
                    return connection.query(
                        `delete from ${table} where ${table} = '${code}'`
                    );
                })
                .then(result => {
                    response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                    response.end(result.rowsAffected[0].toString());
                })
                .catch(err => {
                    console.log(err);
                    response.writeHead(400);
                    response.end(JSON.stringify({
                        code: err.code,
                        message: err.originalError.info.message,
                    }));
                })
                .finally(() => {
                    pool.close();
                })
        }else{
            response.writeHead(404);
            response.end();
        }
    }
});

server.listen(3000);