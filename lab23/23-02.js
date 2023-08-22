import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { exit } from "process";
import { createClient } from "redis";
import Sequelize, { where } from "sequelize";

const ACCESS_TOKEN_KEY = "C671E92B7564F53C3DB699737626D";
const REFRESH_TOKEN_KEY = "E4B777DC22BE6A7C7C7BC8852C89A";
const REFRESH_EXPIRY_TIME_MIN = 1440;

async function generateTokenPair(user) {
    let access_token = jwt.sign({ user }, ACCESS_TOKEN_KEY, { expiresIn: "10m" });
    let refresh_token = jwt.sign({ user }, REFRESH_TOKEN_KEY, { expiresIn: REFRESH_EXPIRY_TIME_MIN + "m" });
    await redis.set(refresh_token, "", { EX: REFRESH_EXPIRY_TIME_MIN * 60 });
    return { access_token, refresh_token };
}

const redis = createClient();
await redis.connect();

const sequelize = new Sequelize("lab23", "postgres", "postgres", {
    dialect: "postgres"
});

const User = sequelize.define("user", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

try {
    await sequelize.sync({ force: true });
} catch (e) {
    console.log(e);
    exit(-1);
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function authorize(req, res, next) {
    if (!!!req.cookies.access_token) {
        res.status(401).send("Auth header not provided");
        return;
    }
    let token = req.cookies.access_token;
    let payload;
    try {
        payload = jwt.verify(token, ACCESS_TOKEN_KEY);
    } catch {
        // res.status(401).send("Auth header not valid");
        console.log("wrong AT")
        res.redirect(`/refresh?redirect=${req.originalUrl}`);
        return;
    }
    req.user = payload.user;
    next();
}

app.get("/register", (req, res) => {
    res.sendFile(path.resolve("./register.html"));
});

app.post("/register", async (req, res) => {
    if (!!!req.body.name && !!!req.body.password && !!!req.body.age) {
        // res.status(400).send("Missing required fields: name or password.")
        res.redirect("/register");
        return;
    }
    try {
        let user = await User.create(req.body);
        let keyPair = await generateTokenPair(user);
        res.cookie("access_token", keyPair.access_token)
            .cookie("refresh_token", keyPair.refresh_token)
            .redirect("/resource");
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.resolve("./login.html"));
});

app.post("/login", async (req, res) => {
    if (!!!req.body.name && !!!req.body.password) {
        // res.status(400).send("Missing required fields: name or password.")
        res.redirect("/login");
        return;
    }
    let user = await User.findOne({ where: { name: req.body.name } });
    if (!!!user) {
        // res.status(400).send("Cant find user with this username.")
        res.redirect("/login");
        return;
    }
    if (req.body.password !== user.password) {
        res.redirect("/login");
        return;
    }
    let keyPair = await generateTokenPair(user);
    res.cookie("access_token", keyPair.access_token)
        .cookie("refresh_token", keyPair.refresh_token)
        .redirect("/resource");
});

app.get("/refresh", async (req, res) => {
    let token = req.cookies.refresh_token
    if (!!!token) {
        res.status(401).send("\"refresh_token\" cookie not provided");
        return;
    }
    let payload;
    try {
        payload = jwt.verify(token, REFRESH_TOKEN_KEY);
    } catch {
        res.status(401).send("Refresh token is not valid");
        return;
    }
    if (! await redis.del(token)) {
        res.status(401).send("Refresh token used or expired");
        return;
    }
    let keyPair = await generateTokenPair(payload.user)
    res.cookie("access_token", keyPair.access_token, {httpOnly: true,sameSite: "strict"})
        .cookie("refresh_token", keyPair.refresh_token, {path: "/" })
        .redirect(req.query.redirect);
});

app.get("/resource", authorize, (req, res) => {
    res.send("RESOURCE: " + JSON.stringify(req.user));
});

app.get("/check", authorize, (req, res) => {
    res.send("Check")
});

app.get("/logout", (req, res) => {
    if (!!req.cookies.refresh_token) {
        redis.del(req.cookies.refresh_token);
    }
    res.clearCookie("access_token")
        .clearCookie("refresh_token")
        .redirect('/login');
});

app.listen(3000);