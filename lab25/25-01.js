import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import reposRouter from "./routes/reposRouter.js";
import userRouter from "./routes/userRouter.js";
import { PureAbility, AbilityBuilder, Ability, ForbiddenError } from '@casl/ability';
import { createPrismaAbility } from "@casl/prisma";


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

const prisma = new PrismaClient();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function authenticate(req, res, next) {
    let token;
    if (req.get("Authorization")) {
        token = req.get("Authorization").split(" ")[1];
    } else if (req.cookies.access_token) {
        // res.status(401).send("Auth cookie not provided");

        token = req.cookies.access_token;
    } else {
        console.log("No auth");
        next();
        return;
    }
    let payload;
    try {
        payload = jwt.verify(token, ACCESS_TOKEN_KEY);
    } catch {
        res.status(401).send("Auth header not valid");
        console.log("wrong AT")
        // res.redirect(`/refresh?redirect=${req.originalUrl}`);
        return;
    }
    console.log("payload: ", payload);
    req.user = payload.user;
    next();
}

function setAbility(req, res, next) {
    const { can, cannot, build } = new AbilityBuilder(Ability);
    const role = req.user?.role;
    console.log("role: "+role);
    //Гость
    if (!!!role) {
        can("read", "ability");
        can("read", "repos");
        can("read", "commits");
    }

    if (role === "user") {
        can("read", "ability");
        can("read", "users", { id: req.user.id });
        can("read", "repos");
        can("read", "commits");

        can("create", "repos", { authorid: req.user.id });
        can("create", "commits", { "repos.authorid": req.user.id });

        can("update", "repos", { authorid: req.user.id });
        can("update", "commits", { "repos.authorid": req.user.id });
    }

    if (role === "admin") {
        can("read", "ability");
        can("read", "users");
        can("manage", "repos");
        can("manage", "commits");
    }

    req.ability = build();

    next();
}

//#region Register, login
app.get("/register", (req, res) => {
    res.sendFile(path.resolve("./register.html"));
});

app.post("/register", async (req, res) => {
    if (!!!req.body.username && !!!req.body.password && !!!req.body.email) {
        // res.status(400).send("Missing required fields: name or password.")
        res.redirect("/register");
        return;
    }
    try {
        req.body.role = "user";
        let user = await prisma.users.create({ data: req.body });
        let keyPair = await generateTokenPair(user);
        res.set(keyPair).cookie("access_token", keyPair.access_token)
            .cookie("refresh_token", keyPair.refresh_token)
            .send("success");
    } catch (e) {
        res.status(400).send(e);
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.resolve("./login.html"));
});

app.post("/login", async (req, res) => {
    if (!!!req.body.username && !!!req.body.password) {
        // res.status(400).send("Missing required fields: name or password.")
        res.redirect("/login");
        return;
    }
    let user = await prisma.users.findFirst({ where: { username: req.body.username } });
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
    res.set(keyPair).cookie("access_token", keyPair.access_token)
        .cookie("refresh_token", keyPair.refresh_token)
        .send("success");
});

app.get("/refresh", async (req, res) => {
    let token;
    if (req.get("Authorization")) {
        token = req.get("Authorization").split(" ")[1];
    } else if (req.cookies.refresh_token) {
        // res.status(401).send("Auth cookie not provided");

        token = req.cookies.refresh_token;
    } else {
        console.log("No auth");
        next();
        return;
    }
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
    res.set(keyPair).cookie("access_token", keyPair.access_token, { httpOnly: true, sameSite: "strict" })
        .cookie("refresh_token", keyPair.refresh_token, { path: "/" })
        .send("success");;
});

app.get("/logout", (req, res) => {
    if (!!req.cookies.refresh_token) {
        redis.del(req.cookies.refresh_token);
    }
    res.clearCookie("access_token")
        .clearCookie("refresh_token")
        .redirect('/login');
});
//#endregion




app.use(authenticate);
app.use(setAbility);

app.use("/api/ability", (req, res) => {
    res.send(req.ability.rules);
})

app.use("/api/repos", reposRouter);
app.use("/api/user", userRouter);





app.use((err, req, res, next) => {
    if (err instanceof ForbiddenError) {
        res.status(403).json({ message: `Access denied: ${err.message}.` });
        return;
    }
    res.status(500).send(err.message);
    console.error(err.message)
});



app.listen(3000, () => {
    console.log("Server started");
});