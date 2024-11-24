const mongoose = require('mongoose');
const express = require('express');

const patients = require(__dirname + '/routes/patient');
const physios = require(__dirname + '/routes/physio');
const records = require(__dirname + '/routes/record');
const users = require(__dirname + '/routes/auth');

mongoose.connect('mongodb://localhost:27017/physiocare');

let app = express();
app.use(express.json());
app.use('/patients', patients);
app.use('/physios', physios);
app.use('/records', records);
app.use('/auth', users);

app.listen(8080);