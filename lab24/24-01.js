import express from "express";
import passport from "passport";
import path from "path";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";
import session from "express-session";

passport.use(new GoogleStrategy({
    clientID: "730277991322-3iuj88jee6vmj7dfme112ocjbmqc3la6.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:3000/auth/google/callback",
},
    (token, refreshToken, profile, done) => { done(null, { profile, token }); }
));

const app = express();

passport.serializeUser((user, done) => {
    console.log("ser: ", user.profile.displayName);
    done(null, user);
});

passport.deserializeUser((user, done) => {
    console.log("des: ", user.profile.displayName);
    done(null, user);
});

app.use(session({ resave: false, saveUninitialized: false, secret: "123" }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
    res.sendFile(path.resolve("./login.html"));
})

app.get("/auth/google/", passport.authenticate("google", { scope: ["profile"] }));

app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/nok" }),
    (req, res) => { res.redirect("/resource"); }
);

app.get("/logout", (req, res) => {
    delete req.session.passport;
    req.session.save(()=>{
        res.send("Logged out.")
    });
});

app.get("/resource", (req, res, next) => {
    if (req.user) res.status(200).send(JSON.stringify(req.user));
    else res.redirect("/nok");
});

app.get("/nok", (req, res, next) => {
    res.status(401).send("Google auth failed");
});

app.listen(3000);



