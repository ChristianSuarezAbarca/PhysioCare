const express = require('express');
const mongoose = require('mongoose');
const Record = require('../models/record');
const Physio = require('../models/physio');
const Patient = require('../models/patient');
const auth = require(__dirname + '/../auth/auth.js');

const router = express.Router();

router.get("/", auth.protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const result = await Record.find();

        if (result.length === 0) {
            return res.status(404).send({ error: "No se encontraron expedientes" });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.get('/find', auth.protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const surname = req.query.surname;

        if (!surname) {
            return res.status(404).send({ error: "No se encontraron expedientes con esos criterios." });
        }

        const records = await Record.find()
            .populate({
                path: 'patient',
                match: { surname: { $regex: surname, $options: 'i' } }
            });

        const result = records.filter(record => record.patient !== null);

        if (result.length === 0) {
            return res.status(404).send({ error: "No se encontraron expedientes con esos criterios." });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.get('/:id', auth.protegerRuta(["admin", "physio", "patient"]), async (req, res) => {
    try {
        const userId = req.user.id;
        const patientId = req.params.id;

        if (req.user.rol === 'patient' && userId !== patientId) {
            return res.status(403).send({ error: "Acceso no autorizado" });
        }

        const record = await Record.findOne({ patient: req.params.id });

        if (!record) {
            return res.status(404).send({ error: "No se encontró el expediente del paciente" });
        }

        res.status(200).send({ result: record });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.post('/', auth.protegerRuta(["admin", "physio"]), async (req, res) => {
    try{
        const patient = req.body.patient;
        const medicalRecord = req.body.medicalRecord;
  
        const nuevoRecord = new Record({
            patient: patient,
            medicalRecord: medicalRecord
        });
    
        const result = await nuevoRecord.save();
        res.status(201).send({ result: result });
    } catch(error) {
        res.status(400).send({ error: error.message });
    }
});

router.post('/:id/appointments', auth.protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { date, physio, diagnosis, treatment, observations } = req.body;

        const patientExiste = await Patient.findById(id);
        const physioExiste = await Physio.findById(physio);

        if (!patientExiste || !physioExiste) {
            return res.status(404).send({ error: "No se encontraron expedientes con esos criterios." });
        }

        const nuevoAppointment = {
            date,
            physio,
            diagnosis,
            treatment,
            observations
        };

        const record = await Record.findOne({ patient: id });

        if (!record) {
            return res.status(404).send({ error: "No se encontraron expedientes con esos criterios." });
        }

        record.appointments.push(nuevoAppointment);
        
        const result = await record.save();

        res.status(201).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

router.delete('/:id', auth.protegerRuta(["admin", "physio"]), async (req, res) => {
    try {
        const result = await Record.findOneAndDelete({ patient: req.params.id });

        if (!result) {
            return res.status(404).send({ error: "No se encontraron expedientes con esos criterios." });
        }

        res.status(200).send({ result: result });
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor" });
    }
});

module.exports = router;