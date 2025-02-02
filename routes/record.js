const express = require('express');
const mongoose = require('mongoose');
const Record = require('../models/record');
const Physio = require('../models/physio');
const Patient = require('../models/patient');
const upload = require('../multerConfig');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await Record.find().populate('patient').populate('appointments.physio');

        if (result.length === 0) {
            return res.render('error', {error: 'No se encontraron expedientes médicos'});
        }

        return res.render('records_list', {records: result});
    } catch (error) {
        return res.render('error', {error: 'Error listando expedientes médicos'});
    }
});

router.get('/find', async (req, res) => {
    try {
        const surname = req.query.surname;

        const records = await Record.find()
            .populate({
                path: 'patient',
                match: { surname: { $regex: surname, $options: 'i' } }
            }).populate('appointments.physio');
        
        const result = records.filter(record => record.patient !== null);

        if (!surname || !records || result.length === 0) {
            return res.render('error', {error: 'No se encontraron expedientes asociados al apellido ingresado.'});
        }

        return res.render('records_list', {records: result});
    } catch (error) {
        return res.render('error', {error: 'Hubo un problema al procesar la búsqueda. Inténtelo más tarde.'});
    }
});

router.get("/new", (req, res) => {
    try {
        return res.render('record_new');
    } catch (error) {
        return res.render('error', {error: 'Error accediendo al registro de expedientes'});
    }
});

router.get("/:id/edit", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        const formattedDate = patient.birthDate.toISOString().split('T')[0];
        return res.render('patient_edit', {patient: patient, birthDate: formattedDate});
    } catch (error) {
        return res.render('error', {error: 'Error accediendo a la edición del paciente'});
    }
});

router.get('/:id', async (req, res) => {
    try {
        //const userId = req.user.id;
        //const patientId = req.params.id;
        const result = await Record.findOne({ patient: req.params.id }).populate('patient').populate('appointments.physio');

        if (!result) {
            return res.render('error', {error: 'No se encontro el expediente médico'});
        }

        return res.render('record_detail', {record: result});
    } catch (error) {
        return res.render('error', {error: error.message});
    }
});

router.post('/', async (req, res) => {
    try{
        const id = req.body.id;
        const patient = await Patient.findById(id);
        const nuevoRecord = new Record({
            patient: patient,
            medicalRecord: req.body.expediente
        });
    
        await nuevoRecord.save();
        return res.redirect(req.baseUrl);
    } catch(error) {
        if (error.name === "ValidationError") {
            let errores = { general: 'Error añadiendo los datos del expediente' };

            for (const field in error.errors) {
                errores[field] = error.errors[field].message;
            }

            return res.render('record_add', { errores });
        }

        return res.render('error', {error: 'Error añadiendo los datos del expediente'});
    }
});

router.post('/:id/appointments', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
    try {
        const result = await Record.findOneAndDelete({ patient: req.params.id });

        if (!result) {
            return res.render('error', {error: 'El expediente a eliminar no existe'});
        }

        return res.redirect(req.baseUrl);
    } catch (error) {
        return res.render('error', {error: 'Error eliminando expediente'});
    }
});

module.exports = router;