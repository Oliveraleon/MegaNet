const express = require("express");
const cors = require("cors");
const multer = require('multer');
require("dotenv").config();
const path = require("path");
const { sequelize } = require("./config/db");
const authRoute = require("./routes/Auth.routes.js");
const profileRoute = require("./routes/user.routes.js");
const postRoutes = require("./routes/Post.routes.js");
const chatRoutes = require("./routes/chat.routes.js");
const adminRoutes = require("./routes/Admin.routes.js");
const { carpeta } = require("./middelwares/upload.js");
require("./models/index.js");

const server = express();

server.use(cors());

server.use(express.json({ limit: "50mb" }));
server.use(express.urlencoded({ limit: "50mb", extended: true }));

server.use("/uploads", express.static(carpeta));
server.use("/auth", authRoute);
server.use("/user", profileRoute);
server.use("/posts", postRoutes);
server.use("/chat", chatRoutes);
server.use("/admin", adminRoutes);

server.listen(3000, async () => {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("El server esta ON");
});