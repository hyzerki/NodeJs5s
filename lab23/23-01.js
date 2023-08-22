import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import bodyParser from "body-parser";
import path from "path";
import Users from "./Users.json" assert{"type": "json"};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '123',
    saveUninitialized: false,
    resave: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user))

passport.use(
    new Strategy((username, password, done) => {
        let user = Users.find((e) => e.user === username);
        if (!!!user) {
            return done(null, false, { message: "incorrect username" });
        }
        if (user.password !== password) {
            return done(null, false, { message: "incorrect password" });
        }
        return done(null, user);
    })
);

app.get("/login", (req, res) => {
    res.sendFile(path.resolve("./23-01.html"));
});

app.post("/login", passport.authenticate("local", { successRedirect: "/resource", failureRedirect: "/login" }));

app.get("/resource", (req, res, next) => {
    if (!!req.user) next();
    else res.redirect("/login");
}, (req, res) => {
    res.send("RESOURCE: " + JSON.stringify(req.user));
});

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        res.redirect('/login');
    });
});

app.listen(3000);