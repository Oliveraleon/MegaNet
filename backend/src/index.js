const express = require("express")
const cors = require("cors")
const { sequelize } = require("./config/db")
const User = require("./models/Usuarios.models.js");
const Profile = require("./models/Perfiles.models.js");
const userRoute = require("./routes/Auth.routes.js");
const { carpeta } = require("./middelwares/upload.js")
const publicacionesRoute = require("./routes/Publicaciones.routes.js");   // NUEVA
require("./models/index.js");
const server = express()

server.use(cors())
server.use(express.json())

server.use("/imagenes", express.static(carpeta))   // NUEVA
server.use('/users', userRoute)
server.use("/publicaciones", publicacionesRoute);

server.listen(3000, async()=>{
    await sequelize.authenticate()
    await sequelize.sync({force: false})
    console.log("El server esta ON");
    
})