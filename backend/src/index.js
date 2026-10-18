const express = require("express")
const cors = require("cors")
const { sequelize } = require("./config/db")
const userRoute = require("./routes/Auth.routes.js");
const socialRoute = require("./routes/Social.routes.js");
require("./models/index.js");
const server = express()

server.use(cors())
server.use(express.json())

server.use('/users', userRoute)
server.use('/social', socialRoute)

server.listen(3000, async()=>{
    await sequelize.authenticate()
    await sequelize.sync({alter: true})
    console.log("El server esta ON");
    
})