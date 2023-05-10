const express = require("express");
const personRouter = require("./routes/personRouter");
const companyRouter = require("./routes/companyRouter");
const vacancyRouter = require("./routes/vacancyRouter");
const applicationRouter = require("./routes/applicationRouter");
const preferredSkillRouter = require("./routes/preferredSkillRouter");
const bodyParser = require("body-parser");

const app = express();

BigInt.prototype.toJSON = function () { return this.toString() }

const urlencodedParser = express.urlencoded({ extended: false });

app.set("view engine", "hbs")
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.json({ type: '*/*' }));

app.use("/person", personRouter);
app.use("/company", companyRouter);
app.use("/vacancy", vacancyRouter);
app.use("/application", applicationRouter);
app.use("/skill", preferredSkillRouter);

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send(err);
});


app.use("/zxc", (req, res, next) => { console.log(req.body); });

app.listen(3000);