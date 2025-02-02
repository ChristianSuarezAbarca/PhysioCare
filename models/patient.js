const mongoose = require('mongoose');

let patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        minlength: [2, 'El nombre es demasiado corto'],
        maxlength: [50, 'El nombre es demasiado largo']
    },
    surname: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        minlength: [2, 'El apellido es demasiado corto'],
        maxlength: [50, 'El apellido es demasiado largo']
    },
    birthDate: {
        type: Date,
        required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    address: {
        type: String,
        maxlength: [100, 'La dirección es demasiado larga']
    },
    insuranceNumber: {
        type: String,
        required: [true, 'El número del seguro es obligatorio'],
        match: [/^[a-zA-Z0-9]{9}$/, 'Debe tener 9 digitos'],
        unique: true
    },
    imagen: {
        type: String
    }
});

let Patient = mongoose.model('patients', patientSchema);
module.exports = Patient;