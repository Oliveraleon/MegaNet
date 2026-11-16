/*const multer = require("multer")
const path = require("path")
const fs = require("fs")

const carpeta = path.join(__dirname, "..", "..", "uploads")

if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta)

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, carpeta),
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase()
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + extension)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true)
        else cb(new Error("Solo se permiten imágenes"))
    },
})

// Middleware para recibir la foto de perfil y el banner simultáneamente
const subirImágenesPerfil = upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "profileBanner", maxCount: 1 }
]);

const subirImagenMiddleware = (req, res, next) => {
    subirImágenesPerfil(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message })
        next()
    })
}

module.exports = { subirImagenMiddleware, carpeta }*/

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carpeta = path.join(__dirname, "..", "..", "uploads");

// La carpeta uploads esta en el .gitignore: si no existe (por ejemplo al clonar el repo) se crea sola
if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, carpeta);
    },
    filename: (req, file, cb) => {
        const nombreLimpio = file.originalname.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");
        cb(null, Date.now() + "-" + nombreLimpio);
    }
});

const upload = multer({ storage: storage });

const subirImagen = upload.fields([
    {name: "profilePicture", maxCount: 1},
    {name: "profileBanner", maxCount: 1},
    {name: "imagen", maxCount: 1},
    {name: "video", maxCount: 1}
]);

const uploadArchivo = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const tipo = file.mimetype.split("/")[0]
        if (tipo === "image" || tipo === "audio" || tipo === "video") cb(null, true)
        else cb(new Error("Solo se pueden enviar imágenes, audios o videos"))
    },
})

const subirArchivo = (req, res, next) => {
    uploadArchivo.single("archivo")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message })
        next()
    })
}

module.exports = { subirImagen, subirArchivo, carpeta }
