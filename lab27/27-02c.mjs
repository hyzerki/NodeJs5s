import { ClientVerify } from "./sign.mjs";
import axios from "axios";
import fs from "fs";
import path from "path";

const client = axios.create({ baseURL: "http://localhost:3000" });

// let res = await client.get("/file", {responseType: "stream"});
//res.data.pipe(fs.createWriteStream("./clientData/fio.txt"));

let res = await client.get("/signature");

let cv = new ClientVerify(res.data);
cv.verify(fs.createReadStream("./clientData/fio.txt"), (result) => {
    console.log(result);
});
