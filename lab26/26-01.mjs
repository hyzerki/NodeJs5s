import express from "express";
import fs from "fs";
import https from "https";

const app = express();

const options = {
    key: fs.readFileSync('./server.key', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
};


app.get('/', (request, response) => {
    response.end('<h1>Hello world</h1>')
});

https.createServer(options, app).listen(3000,()=>{
    console.log("https://lab26-mns:3000/");
    console.log("https://mns:3000/");
});