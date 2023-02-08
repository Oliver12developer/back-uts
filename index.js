const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
require('dotenv').config()

const app = express()

//Capturar el body
app.use(bodyparser.urlencoded({
    extend: false
}))
app.use(bodyparser.json())

//conexion a base de datos 
const url = `mongodb+srv://${process.env.USUARIO}:${process.env.PASSWORD}@cluster0.9mgkrby.mongodb.net/${process.env.DBNAME}`
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a la base de datos'))
.catch((error) => console.log('Error: ' + error))

//Creacion e importacion de rutas 
const authRoutes = require('./routes/auth')

//ruta del middleware
app.use('/api/user', authRoutes)

//Ruta de raiz 
app.get('/', (req, res) =>{
    res.json({
        estado: true,
        mensaje: 'Si funciona...vamos a comer!!'
    })
})

//Arrancamos el servidor 
const PORT = process.env.PORT || 9000
app.listen(PORT, () => {
    console.log(`Escuchando el puerto: ${PORT}`)
})