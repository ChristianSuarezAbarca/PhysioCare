const express = require('express');
const mongoose = require('mongoose');
const Physio = require('../models/physio');
const auth = require(__dirname + '/../auth/auth.js');

const router = express.Router();

router.get("/", auth.protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const result = await Physio.find();

        if (result.length === 0) {
            return res.status(404).send({ error: "No se encontraron fisios" });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.get('/find', auth.protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const specialty = req.query.specialty;

        if (!specialty) {
            return res.status(404).send({ error: "No se encontraron fisios con esos criterios." });
        }

        const result = await Physio.find({
            specialty: { $regex: specialty, $options: 'i' }
        });

        if (result.length === 0) {
            return res.status(404).send({ error: "No se ha encontrado ningun fisio con esos criterios" });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.get('/:id', auth.protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try{
        const result = await Physio.findById(req.params.id)

        if(result)
            res.status(200).send({ result: result });
        else
            res.status(404).send({ error: "No se encontraron fisios" });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.post('/', auth.protegerRuta(["admin"]), async (req, res) => {
    try{
        let nuevoPhysio = new Physio({
            name: req.body.name,
            surname: req.body.surname,
            specialty: req.body.specialty,
            licenseNumber: req.body.licenseNumber
        });
    
        const result = await nuevoPhysio.save()
        res.status(201).send({ result: result });
    } catch(error) {
        res.status(400).send({ error: error.message });
    }
});

router.put('/:id', auth.protegerRuta(["admin"]), async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send({ error: "Error actualizando los datos del fisio" });
    }

    try{
        const result = await Physio.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.name,
                surname: req.body.surname,
                specialty: req.body.specialty,
                licenseNumber: req.body.licenseNumber
            }
        }, { 
            new: true,
            runValidators: true
        });

        if (!result) {
            return res.status(400).send({ error: "Error actualizando los datos del fisio" });
        }

        res.status(200).send({ result: result });
    } catch(error) {
        if (error.name === "ValidationError") {
            return res.status(400).send({ error: "Error actualizando los datos del fisio" });
        }
        res.status(500).send({ error:"Error interno del servidor" });
    }
});

router.delete('/:id', auth.protegerRuta(["admin"]), async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send({ error: "El fisio a eliminar no existe" });
    }

    try {
        const result = await Physio.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).send({ error: "El fisio a eliminar no existe" });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

module.exports = router;