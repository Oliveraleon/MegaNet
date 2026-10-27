const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Carpeta donde se guardan las fotos: backend/uploads
// (sube dos niveles desde src/middelwares hasta backend)
const carpeta = path.join(__dirname, "..", "..", "uploads")

// Si la carpeta no existe, la crea
if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta)

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, carpeta),
    // Nombre único para que dos fotos nunca se pisen
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase()
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + extension)
    },
})

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) cb(null, true)
        else cb(new Error("Solo se permiten imágenes"))
    },
})

// Si algo sale mal, responde con el mismo formato de mensajes que el resto de la API
const subirImagen = (req, res, next) => {
    upload.single("imagen")(req, res, (err) => {
        if (err) return res.status(400).json({ message: err.message })
        next()
    })
}

module.exports = { subirImagen, carpeta }