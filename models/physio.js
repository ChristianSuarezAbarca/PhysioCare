const mongoose = require('mongoose');

let physioSchema = new mongoose.Schema({
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
    specialty: {
        type: String,
        required: [true, 'La especialidad es obligatoria'],
        enum: ['Sports', 'Neurological', 'Pediatric', 'Geriatric', 'Oncological']
    },
    licenseNumber: {
        type: String,
        required: [true, 'El número de licencia es obligatorio'],
        match: [/^[a-zA-Z0-9]{8}$/, 'Debe tener 8 digitos'],
        unique: true
    },
    imagen: {
        type: String
    }
});

let Physio = mongoose.model('physios', physioSchema);
module.exports = Physio;