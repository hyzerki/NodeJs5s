const sql = require('mssql');
const pool = new sql.ConnectionPool({
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
});

let connectionPool;

class Db {
    constructor() {
        connectionPool = pool.connect();
    }

    query(query) {
        return connectionPool
            .then(pool => pool.query(query))
            .then(response => response.recordset);
    }

    getAll(tableName) {
        return connectionPool
            .then(pool => pool.query(`SELECT * FROM ${tableName}`))
            .then(response => response.recordset);
    }

    getOne(tableName, fields) {
        return connectionPool.then(pool => {
            const request = pool.request();
            let command = `SELECT TOP(1) * FROM ${tableName} WHERE`;
            Object.keys(fields).forEach(field => {
                let fieldType = Number.isInteger(fields[field]) ? sql.Int : sql.NVarChar;

                request.input(field, fieldType, fields[field]);

                command += ` ${field} = @${field} AND`;
            });
            command = command.slice(0, -3);
            return request.query(command);
        }).then(response => response.recordset);
    }

    insertOne(tableName, fields) {
        return connectionPool.then(pool => {
            console.log('insert')
            console.log(fields);
            const request = pool.request();
            let command = `INSERT INTO ${tableName} values (`;
            Object.keys(fields).forEach(field => {
                let fieldType = Number.isInteger(fields[field]) ? sql.Int : sql.NVarChar;
                console.log(fieldType)
                request.input(field, fieldType, fields[field]);
                command += `@${field},`;
            });
            command = command.replace(/.$/, ")");
            console.log(command);

            return request.query(command);
        });
    }

    updateOne(tableName, fields) {
        return connectionPool.then(pool => {
            const idField = tableName;
            /*   if (!fields[idField] || !Number.isInteger(fields[idField])) {
                   throw 'There are no Id value has been provided. Example: {TableName}_Id';
               }*/
            const request = pool.request();
            let command = `UPDATE ${tableName} SET `;
            Object.keys(fields).forEach(field => {
                let fieldType = Number.isInteger(fields[field]) ? sql.Int : sql.NVarChar;
                request.input(field, fieldType, fields[field]);
                if (!field.endsWith('Id')) {

                    command += `${field} = @${field},`;
                }
            });
            command = command.slice(0, -1);
            command += ` WHERE ${idField} = @${idField}`;
            console.log(command);
            return request.query(command);
        });
    }

    deleteOne(tableName, id) {
        return connectionPool.then(pool => {
            let command = `DELETE FROM ${tableName} WHERE ${tableName} = '${id}'`;
            console.log(command);
            return pool.query(command);
        });
    }

}

module.exports = Db;