import passport from "passport";
import express from "express";
import Users from "./Users.json" assert {type: "json"};
import { DigestStrategy } from "passport-http";
import session from "express-session";

function getCredential(user) {
    return Users.find((e) => e.user === user);
}

const app = express();

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: '123'
}));
app.use(passport.initialize());

passport.use(new DigestStrategy((user, done) => {
    let creds = getCredential(user);
    if (!creds) {
        return done(null, false);
    }
    return done(null, creds.user, creds.password);
}, (params, done) => {
    done(null,true);
}));

app.use((req, res, next) => {
    if (req.session.logout) {
        if (req.path === "/login")
            req.session.logout = false;
        delete req.headers["authorization"];
    }
    next();
});


app.get("/login",
    passport.authenticate("digest", { session: false, failureMessage: true }),
    (req, res) => {
        res.send("Logged in.");
    });

app.get("/logout",
    (req, res,) => {
        req.session.logout = true;
        res.send("Logged out.")
    });

app.get("/resource",
    passport.authenticate("digest", { session: false, failureRedirect: "/login", failureMessage: true }),
    (req, res) => {
        res.send("Resource");
    });

app.get("/*", (req, res) => {
    res.status(404).send("Page not found");
})



app.listen(3000, () => {
    console.log("Started listening: http://localhost:3000/");
});
