const express = require('express');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const auth = require('../auth/auth');

const router = express.Router();
const saltRounds = 10;

router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        const existeUsuario = await User.findOne({ login: login });

        if (!existeUsuario) {
            return res.status(401).send({ error: "login incorrecto" });
        }

        const passwordCorrecta = await bcrypt.compare(password, existeUsuario.password);

        if (!passwordCorrecta) {
            return res.status(401).send({ error: "login incorrecto" });
        }

        const token = auth.generarToken(existeUsuario.login, existeUsuario.rol, existeUsuario._id);

        res.status(200).send({ result: token });
    } catch (error) {
        res.status(401).send({ error: "login incorrecto" });
    }
});

router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const nuevoUser = new User({
            login: req.body.login,
            password: hashedPassword,
            rol: req.body.rol
        });

        const result = await nuevoUser.save();
        res.status(201).send({ result: result });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;