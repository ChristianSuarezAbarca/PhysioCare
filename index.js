const mongoose = require("mongoose");
const express = require("express");
const nunjucks = require("nunjucks");
const methodOverride = require("method-override");

const patients = require(__dirname + "/routes/patient");
const physios = require(__dirname + "/routes/physio");
const records = require(__dirname + "/routes/record");

let app = express();

nunjucks.configure("views", {
    autoescape: true,
    express: app,
});

app.set("view engine", "njk");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    methodOverride(function (req, res) {
        if (req.body && typeof req.body === "object" && "_method" in req.body) {
            let method = req.body._method;
            delete req.body._method;
            return method;
        }
    })
);

mongoose.connect("mongodb://mymongodb:27017/physiocare");

app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use("/patients", patients);
app.use("/physios", physios);
app.use("/records", records);

app.get("/", (req, res) => {
    res.redirect("/public/index.html");
});

app.listen(8080);
