import bodyParser from "body-parser";
import express from "express";
import fs from "fs";
import path from "path";
import { createClient } from "webdav";
import { v2 as webdav, } from "webdav-server";

const app = express();
const server = new webdav.WebDAVServer({ port: 3000 })
const webDAVClient = createClient('https://webdav.yandex.ru', {username: "flexsodead", password: "uiwwiheuzbemmkxl"});


server.setFileSystem("/", new webdav.PhysicalFileSystem(path.resolve("./files")), (success) => {
    server.start(() => {
        console.log('READY');
    });
    app.listen(5000);
});

app.post('/md/[A-z,0-9,%,/,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let dirName = decodeURI(s);
    webDAVClient.exists(dirName).then((result) => {
        if (!result) {
            webDAVClient.createDirectory(dirName);
            res.end('Директория создана успешно');
        }
        else {
            res.status(408).end('Такая директория уже существует');
        }
    })
        .catch((err) => {
            console.log(err);
        });
});


app.post('/rd/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let requiredDir = decodeURI(s);
    webDAVClient.exists(requiredDir).then((result) => {
        if (result) {
            webDAVClient.deleteFile(requiredDir);
            res.end('Директория удалена успешно');
        }
        else {
            res.status(404).end('Такой директории не существует');
        }
    })
        .catch((err) => {
            console.log(err);
        });
});


app.post('/up/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let uploadFileName = decodeURI(s);
    console.log(uploadFileName)
    console.log(req.body)
    try {
        let rs = fs.createReadStream('./files/' + uploadFileName);
        let ws = webDAVClient.createWriteStream(uploadFileName);
        rs.pipe(ws).on("finish", () => {
            res.end('Файл успешно выгружен');
        });
    }
    catch (err) {
        console.log(err);
        res.status(408).end('Ошибка записи');
    }
});


app.post('/down/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let downloadFileName = decodeURI(s);
    webDAVClient.exists(downloadFileName).then((result) => {
        if (result) {
            webDAVClient.createReadStream(downloadFileName).pipe(fs.createWriteStream(`./files/d/${downloadFileName}`));
            res.end('Файл успешно скачан');
        } else {
            res.status(404).end('Такого файла не существует');
        }
    })
        .catch((err) => {
            console.log(err);
        })
});


app.post('/del/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let deleteFileName = decodeURI(s);
    webDAVClient.exists(deleteFileName).then((result) => {
        if (result) {
            webDAVClient.deleteFile(deleteFileName);
            res.end('файл удален');
        }
        else {
            res.status(404).end('Такого файла не существует');
        }
    })
        .catch((err) => {
            console.log(err);
        })
});


app.post('/copy/[A-z,0-9,%,.]+/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let d = '/' + req.url.split('/')[3];
    let fileName = decodeURI(s);
    let destination = decodeURI(d);
    webDAVClient.exists(fileName).then((result) => {
        if (result) {
            webDAVClient.copyFile(fileName, destination);
            res.end('Файл скопирован успешно');
        }
        else {
            res.status(404).end('Такого файла не существует');
        }
    })
        .catch((err) => {
            console.log(err);
        })
});


app.post('/move/[A-z,0-9,%,.]+/[A-z,0-9,%,.]+', function (req, res) {
    let s = '/' + req.url.split('/')[2];
    let d = '/' + req.url.split('/')[3];
    let source = decodeURI(s);
    let destination = decodeURI(d);
    webDAVClient.exists(source).then((result) => {
        if (result) {
            webDAVClient.moveFile(source, destination);
            res.end('Файл перемещен успешно');
        }
        else {
            res.status(404).end('Такого файла не существует');
        }
    })
        .catch((err) => {
            console.log(err);
        })
});