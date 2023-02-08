const router = require('express').Router()
const User = require('../models/User')
const Joi = require('@hapi/joi')
const bcrypt = require('bcrypt')
const Jwt = require('jsonwebtoken')

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    lastname: Joi.string().max(255).required(),
    email: Joi.string().max(1024).required(),
    password: Joi.string().min(6).required()
})

const schemaLogin = Joi.object({
    email: Joi.string().max(1024).required(),
    password: Joi.string().min(6).required()
})

const schemaUpdateuser = Joi.object({
    id: Joi.string().max(1024).required(),
    name: Joi.string().min(6).max(255).required(),
    lastname: Joi.string().max(255).required(),
    email: Joi.string().max(1024).required(),
    password: Joi.string().min(6).required()
})

router.post('/register',async(req, res) => {
    //Validación de usuario
    const {error} = schemaRegister.validate(req.body)
    if (error){
        return res.status(400).json({
            error: error.details(0).message
        })
    }

    const isEmailUnique = await User.findOne({ email: req.body.email})
    if (isEmailUnique) {
        return res.status(400).json({
            error: "El correo ya existe"
        })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordEncriptado = await bcrypt.hash(req.body.password, salt)

    const usuario = new User({
        name: req.body.name,
        lastname: req.body.lastname,
        email: req.body.email,
        password: passwordEncriptado,
    })

    try {
        const guardado = await usuario.save()
        res.json({
            message: 'Success',
            data: guardado
        })
    }catch (error){
        res.status(400).json({
            message: 'Error al guardar',
            error
        })
    }
})

router.post('/login',async(req, res) => {
    //Validación de usuario
    const {error} = schemaLogin.validate(req.body)
    if (error){
        return res.status(400).json({
            error: error.details(0).message
        })
    }

    const isEmailUnique = await User.findOne({ email: req.body.email})
    if (!isEmailUnique) {
        return res.status(400).json({
            error: "El correo no existe"
        })
    }

    const validPassword = await bcrypt.compare(req.body.password, isEmailUnique.password)
    
    if(!validPassword) {
        return res.status(400).json({
            error: "Password incorrecto"
        })
    }

    const token = Jwt.sign({
        name: isEmailUnique.name,
        id: isEmailUnique._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token }
    })
})

router.get('/getallusers', async (req,res) => {
    const users = await User.find()

    if (users) {
        res.json({
            error: null,
            data: users
        })
    }else {
        return res.status(400).json({
            error: "No hay usuarios"
        })
    }
})

router.post('/eraseuser', async (req, res) => {
    const id = req.body.id

    const erased = await User.findByIdAndDelete(id)

    if (erased) {
        res.json({
            error: null,
            message: "Borrado satisfactoriamente"
        })
    }else {
        return res.status(400).json({
            error: "No se pudo borrar el usuario"
        })
    }
})

router.post('/updateuser',async(req, res) => {
    //Validación de usuario
    const {error} = schemaUpdateuser.validate(req.body)
    if (error){
        return res.status(400).json({
            error: error.details(0).message
        })
    }

    const isEmailUnique = await User.findOne({ email: req.body.email})
    if (isEmailUnique) {
        return res.status(400).json({
            error: "El correo ya existe, no podemos actualizar el usuario"
        })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordEncriptado = await bcrypt.hash(req.body.password, salt)

    const usuario = {
        name: req.body.name,
        lastname: req.body.lastname,
        email: req.body.email,
        password: passwordEncriptado,
    }

    try {
        const actualizado = await User.findByIdAndUpdate(
            req.body.id, 
            usuario,
            {new:true}
            )
        res.json({
            message: 'Success Update',
            data: actualizado
        })
    }catch (error){
        res.status(400).json({
            message: 'Error al actualizar',
            error
        })
    }
})

module.exports = router