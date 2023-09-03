import { ServerSign } from "./sign.mjs";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(bodyParser.json());

app.get('/file', ((req, res) => {
    try {
        res.sendFile(path.resolve("./serverData/student.txt"));
    } catch (e) {
        res.status(409).json({message: '409 ERROR'});
    }
}))

app.get('/signature', ((req, res) => {
    try {
        const rs = fs.createReadStream(path.resolve("./serverData/student.txt"));
        let ss = new ServerSign();
        ss.getSignContext(rs, (signContext) => {
            console.log('signContext: ', signContext);
            res.json(signContext);
        });
    } catch (e) {
        res.status(409).json({message: '409 ERROR'});
    }
}))

app.listen(3000);