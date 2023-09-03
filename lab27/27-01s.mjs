import crypto from "crypto";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
const app = express();
app.use(bodyParser.json());
app.use(cookieParser());


const contextsMap = new Map();

function ServerDH(len_a, g) {
    const dh = crypto.createDiffieHellman(len_a, g);
    const p = dh.getPrime();
    const gb = dh.getGenerator();
    const k = dh.generateKeys();
    this.getContext = () => {
        return {
            p_hex: p.toString("hex"),
            g_hex: gb.toString("hex"),
            key_hex: k.toString("hex")
        };
    }
    this.getSecret = (clientContext) => {
        const k = Buffer.from(clientContext.key_hex, "hex");
        return dh.computeSecret(k);
    }
}

const serverDh = new ServerDH(1024, 3);
const serverContext = serverDh.getContext();

app.get("/", (req, res) => {
    console.log("1");
    res.set("X-clientID", crypto.randomUUID()).json(serverContext);
});

app.post("/computeKey", (req, res) => {
    console.log("2");
    if (!req.get("X-clientID")) {
        res.status(409).send("Missed first step!");
    }
    if (!req.body?.key_hex) {
        res.status(409).send("Missing property key_hex!");
    }
    contextsMap.set(req.get("X-clientID"), req.body);
    res.status(200).end();
});

app.get("/resource", (req, res) => {
    console.log("3");
    if (!req.get("X-clientID")) {
        res.status(409).send("Missed first step!");
    }
    let secret = serverDh.getSecret(contextsMap.get(req.get("X-ClientID")));
    let key = secret.toString('hex');

    key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);
    console.log('key: ', key);

    const piv = Buffer.alloc(16, 0);
    const ch = crypto.createCipheriv("aes-256-cbc", key, piv);
    const text = fs.readFileSync("./serverData/file.txt", { encoding: 'utf8' });
    const encryptedText = ch.update(text, 'utf8', 'hex') + ch.final('hex');
    fs.writeFileSync("./serverData/tempEncFile.txt", encryptedText);
    res.sendFile(path.resolve("./serverData/tempEncFile.txt"));
    // fs.unlinkSync("./serverData/tempEncFile.txt");
})

app.listen(3000);
