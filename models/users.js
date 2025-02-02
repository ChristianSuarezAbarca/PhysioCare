const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    login: {
        type: String,
        required: [true, 'El usuario es obligatorio'],
        unique: true,
        minlength: [4, 'El usuario es demasiado corto'],
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [7, 'La contraseña es demasiado corta'],
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'physio', 'patient']
    }
});

let User = mongoose.model('users', userSchema);
module.exports = User;