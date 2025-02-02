const express = require('express');
const mongoose = require('mongoose');
const Physio = require('../models/physio');
const User = require('../models/users');
const upload = require('../multerConfig');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await Physio.find();

        if (result.length === 0) {
            return res.render('error', {error: 'No se encontraron físios'});
        }

        return res.render('physios_list', {physios: result});
    } catch (error) {
        return res.render('error', {error: 'Error listando físios'});
    }
});

router.get('/find', async (req, res) => {
    try {
        const specialty = req.query.especialidad;

        const result = await Physio.find({
            specialty: { $regex: specialty, $options: 'i' }
        });

        if (!specialty || result.length === 0) {
            return res.render('error', {error: "No se encontraron físios asociados a la especialidad ingresada."});
        }

        return res.render('physios_list', {physios: result});
    } catch (error) {
        return res.render('error', {error: 'Hubo un problema al procesar la búsqueda. Inténtelo más tarde.'});
    }
});

router.get("/new", (req, res) => {
    try {
        return res.render('physio_add');
    } catch (error) {
        return res.render('error', {error: 'Error accediendo al registro de físios'});
    }
});

router.get("/:id/edit", async (req, res) => {
    try {
        const physio = await Physio.findById(req.params.id);
        return res.render('physio_edit', {physio: physio});
    } catch (error) {
        return res.render('error', {error: 'Error accediendo a la edición del físio'});
    }
});

router.get('/:id', async (req, res) => {
    try{
        const result = await Physio.findById(req.params.id)

        if(result)
            return res.render('physio_detail', {physio: result});
        else
        return res.render('error', {error: 'No se encontro al físio'});
    } catch (error) {
        return res.render('error', {error: 'Error accediendo a los detalles del físio'});
    }
});

router.post('/', upload.single('imagen'), async (req, res) => {
    try{
        let nuevoUser = new User({
            login: req.body.usuario,
            password: req.body.contrasena,
            rol: "physio"
        })
        let nuevoPhysio = new Physio({
            name: req.body.nombre,
            surname: req.body.apellido,
            specialty: req.body.especialidad,
            licenseNumber: req.body.licencia,
            imagen: req.file ? req.file.path : undefined
        });
        
        await nuevoUser.save()
        await nuevoPhysio.save()
        return res.redirect(req.baseUrl);
    } catch(error) {
        if (error.name === "ValidationError") {
            let errores = { general: 'Error añadiendo los datos del físio' };

            for (const field in error.errors) {
                errores[field] = error.errors[field].message;
            }

            return res.render('physio_add', { errores });
        }

        return res.render('error', {error: 'Error añadiendo los datos del físio' + error.message});
    }
});

router.post('/:id', upload.single('imagen'), async (req, res) => {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.render('error', {error: 'Error actualizando los datos del físio'});
    }

    try{
        const result = await Physio.findByIdAndUpdate(req.params.id, {
            $set: {
                name: req.body.nombre,
                surname: req.body.apellido,
                specialty: req.body.especialidad,
                licenseNumber: req.body.licencia,
                imagen: req.file ? req.file.path : undefined
            }
        }, { 
            new: true,
            runValidators: true
        });

        if (!result) {
            return res.render('error', {error: 'Error actualizando los datos del físio'});
        }

        return res.render('physio_detail', {physio: result});
    } catch(error) {
        if (error.name === "ValidationError") {
            let errores = { general: 'Error actualizando los datos del físio' };

            for (const field in error.errors) {
                errores[field] = error.errors[field].message;
            }

            const physio = await Physio.findById(req.params.id);
            return res.render('physio_edit', { errores, physio });
        }

        return res.render('error', {error: 'Error interno del servidor' + error.message});
    }
});

router.delete('/:id', async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.render('error', {error: 'El físio a eliminar no existe'});
    }

    try {
        const result = await Physio.findByIdAndDelete(req.params.id);
        const user = await User.deleteOne({ _id: req.params.id });

        if (!result || !user) {
            return res.render('error', {error: 'El físio a eliminar no existe'});
        }

        return res.redirect(req.baseUrl);
    } catch (error) {
        return res.render('error', {error: 'Error eliminando físio'});
    }
});

module.exports = router;