import crypto from "crypto";
import axios from "axios";
import fs from "fs";

function ClientDH(serverContext) {
    const ctx = {
        p_hex: serverContext.p_hex ? serverContext.p_hex : "1111",
        g_hex: serverContext.g_hex ? serverContext.g_hex : "1",
    };
    const p = Buffer.from(ctx.p_hex, "hex");
    const g = Buffer.from(ctx.g_hex, "hex");
    const dh = crypto.createDiffieHellman(p, g);
    const k = dh.generateKeys();
    this.Context = () => {
        return {
            p_hex: p.toString("hex"),
            g_hex: g.toString("hex"),
            key_hex: k.toString("hex")
        };
    }
    this.getSecret = (serverContext) => {
        const k = Buffer.from(serverContext.key_hex, "hex");
        return dh.computeSecret(k);
    }
}

const client = axios.create({ baseURL: "http://localhost:3000" });

let res = await client.get("/");
const serverContext = res.data;
const clientId = res.headers["x-clientid"];

const clientDh = new ClientDH(serverContext);

await client.post("/computeKey", clientDh.Context(), { headers: { "x-clientid": clientId } });

res = await client.get("/resource", { headers: { "x-clientid": clientId } });

const clientSecret = clientDh.getSecret(serverContext);
let key = clientSecret.toString('hex');
key = crypto.createHash('sha256').update(String(key)).digest('base64').substr(0, 32);

console.log('key: ', key);
const piv = Buffer.alloc(16, 0);
const text = res.data;
const dch = crypto.createDecipheriv("aes-256-cbc", key, piv);
const decrypted = dch.update(text, 'hex', 'utf8') + dch.final('utf8');
fs.writeFileSync('./clientData/file.txt', decrypted);


