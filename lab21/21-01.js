import express, { json } from "express";
import expressHbs from "express-handlebars";
import hbs from "hbs";
import fs from "fs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

const app = express();


app.engine("hbs", expressHbs.engine({
    layoutsDir: __dirname + "/views/layouts",
    defaultLayout: "layout",
    extname: "hbs",
    helpers: {
        decline: function(){
            return new hbs.SafeString("<input type=\"button\" style=\"border: 1px solid black; padding: 10px; width: 100%;\" onclick=\"location.href='/';\" value=\"Отказаться\" />");
        }
    }
}));
hbs.registerPartials(__dirname + "/views/partials");



app.set("view engine", "hbs");


const urlencodedParser = express.urlencoded({ extended: false });
function getPhonesFromFile() {
    return JSON.parse(fs.readFileSync("./phones.json"));
}

function writePhones(phones) {
    fs.writeFileSync("./phones.json", JSON.stringify(phones));
}


//Мидлвари
app.use("/static", express.static(__dirname + "/public"));

app.use(urlencodedParser);

app.use((req, res, next) => {
    if (req.method === "GET") {
        app.locals.phones = getPhonesFromFile();
    }
    next();
})



app.get("/", (req, res) => {
    res.render("index.hbs");
});

app.get("/add", (req, res) => {
    res.render("add.hbs");
});

app.get("/update", (req, res) => {
    let phones = getPhonesFromFile();

    res.render("update.hbs", { query: req.query, phone: phones[parseInt(req.query.id)] });
});

app.post("/add", (req, res) => {
    let phones = getPhonesFromFile();
    phones.push(req.body);
    writePhones(phones);
    res.redirect("/");
})

app.post("/update", (req, res) => {
    let phones = getPhonesFromFile();
    phones[parseInt(req.query.id)] = req.body;
    writePhones(phones);
    res.redirect("/");
})

app.post("/delete", (req, res) => {
    let phones = getPhonesFromFile();
    phones.splice(req.query.id, 1);
    writePhones(phones);
    res.redirect("/");
})

app.listen(PORT);

console.log("Server running on port " + PORT);
console.log(`http://localhost:${PORT}/`);