const mongoose = require("mongoose");

let appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, 'La fecha es obligatoria']
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: true
    },
    diagnosis: {
        type: String,
        required: [true, 'El diagnostico es obligatorio'],
        minlength: [10, 'El diagnostico es demasiado corto'],
        maxlength: [500, 'El diagnostico es demasiado largo']
    },
    treatment: {
        type: String,
        required: [true, 'El tratamiento es obligatorio'],
    },
    observations: {
        type: String,
        maxlength: [500, 'Las obervaciones son demasiado largas']
    },
});

let recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: true,
        unique: true
    },
    medicalRecord: {
        type: String,
        maxlength: [1000, 'El expediente médico es demasiado largo']
    },
    appointments: [appointmentSchema]
});

let Record = mongoose.model('records', recordSchema);
module.exports = Record;
