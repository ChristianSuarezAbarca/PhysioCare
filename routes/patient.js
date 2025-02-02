const express = require('express');
const mongoose = require('mongoose');
const Patient = require('../models/patient');
const User = require('../models/users');
const upload = require('../multerConfig');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await Patient.find();

        if (result.length === 0) {
            return res.render('error', {error: 'No se encontraron pacientes'});
        }

        return res.render('patients_list', {patients: result});
    } catch (error) {
        return res.render('error', {error: 'Error listando pacientes'});
    }
});

router.get('/find', async (req, res) => {
    try {
        const surname = req.query.search;

        const result = await Patient.find({
            surname: { $regex: surname, $options: 'i' }
        });

        if (!surname || result.length === 0) {
            return res.render('error', {error: "No se encontraron pacientes asociados al apellido ingresado."});
        }

        return res.render('patients_list', {patients: result});
    } catch (error) {
        return res.render('error', {error: 'Hubo un problema al procesar la búsqueda. Inténtelo más tarde.'});
    }
});

router.get("/new", (req, res) => {
    try {
        return res.render('patient_add');
    } catch (error) {
        return res.render('error', {error: 'Error accediendo al registro de pacientes'});
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
    try{
        //const userId = req.user.id; a lo mejor lo necesitas para las sesiones
        //const patientId = req.params.id;

        const result = await Patient.findById(req.params.id);

        if(result)
            return res.render('patient_detail', {patient: result});
        else
            return res.render('error', {error: 'No se encontro al paciente'});
    } catch (error) {
        return res.render('error', {error: 'Error accediendo a los detalles del paciente'});
    }
});

router.post('/', upload.single('imagen'), async (req, res) => {
    try{
        let nuevoUser = new User({
            login: req.body.usuario,
            password: req.body.contrasena,
            rol: "patient"
        })
        let nuevoPatient = new Patient({
            name: req.body.nombre,
            surname: req.body.apellido,
            birthDate: req.body.fecha,
            address: req.body.direccion,
            insuranceNumber: req.body.seguro,
            imagen: req.file ? req.file.path : undefined
        });
        
        await nuevoUser.save()
        await nuevoPatient.save()
        return res.redirect(req.baseUrl);
    } catch(error) {
        if (error.name === "ValidationError") {
            let errores = { general: 'Error añadiendo los datos del paciente' };

            for (const field in error.errors) {
                errores[field] = error.errors[field].message;
            }

            return res.render('patient_add', { errores });
        }

        return res.render('error', {error: 'Error añadiendo los datos del paciente'});
    }
});

router.post('/:id', upload.single('imagen'), async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.render('error', { error: 'Error actualizando los datos del paciente' });
    }

    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.render('error', { error: 'Paciente no encontrado' });
        }

        const result = await Patient.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.nombre,
                surname: req.body.apellido,
                birthDate: req.body.fecha,
                address: req.body.direccion,
                insuranceNumber: req.body.seguro,
                imagen: req.file ? req.file.path : undefined
            }
        }, { 
            new: true,
            runValidators: true
        });

        if (!result) {
            return res.render('error', { error: 'Error actualizando los datos del paciente' });
        }

        return res.render('patient_detail', { patient: result });

    } catch (error) {
        if (error.name === "ValidationError") {
            let errores = { general: 'Error actualizando los datos del paciente' };

            for (const field in error.errors) {
                errores[field] = error.errors[field].message;
            }

            const patient = await Patient.findById(req.params.id);
            return res.render('patient_edit', { errores, birthDate: req.body.fecha, patient });
        }

        return res.render('error', { error: 'Error interno del servidor: ' });
    }
});


router.delete('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.render('error', {error: 'El paciente a eliminar no existe'});
    }

    try {
        const result = await Patient.findByIdAndDelete(req.params.id);
        //de momento no puedes borrar users ya que no puedes acceder a su id con req.user.id pq necesitas las sesiones
        const user = await User.deleteOne({ _id: req.params.id });

        if (!result || !user) {
            return res.render('error', {error: 'El paciente a eliminar no existe'});
        }

        return res.redirect(req.baseUrl);
    } catch (error) {
        return res.render('error', {error: 'Error eliminando paciente'});
    }
});

module.exports = router;