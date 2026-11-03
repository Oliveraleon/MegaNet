const {Publicaciones} = require("../models");
const { agregarDatos } = require("../controllers/Auth.controller.js");

    const getUserPosts = async (req, res) => {
        try {
            const usuarioId = req.usuario.id;
            const publicaciones = await Publicaciones.findAll({
                where: { userId: usuarioId },
                order: [["creationDate", "DESC"]]
            });
            const postsConDatos = await agregarDatos(publicaciones, req.usuario.id);
            res.status(200).json(postsConDatos);
        } catch (error) {
            console.error("Error al obtener publicaciones:", error);
            return res.status(500).json({
                message: "Error al obtener las publicaciones",
                error: error.message
            });
        }
    };

    const getPostByUser = async (req,res) =>{
        try{
            const { id } = req.params
            const publicaciones = await Publicaciones.findAll({
                where: { userId: id},
                order: [["creationDate", "DESC"]]
            });
            const postsConDatos = await agregarDatos(publicaciones, req.usuario.id);
            res.status(200).json(postsConDatos);
        }catch(error){
            console.error("Error al obtener publicaciones:", error);
            return res.status(500).json({
                message: "Error al obtener las publicaciones",
                error: error.message
            });
        }
    };

    const crearPublicacion = async (req, res) => {
        try{
            const usuarioId = req.usuario.id;
            const {content} = req.body;
            let multimedia = null;
            if(req.files && req.files.imagen && req.files.imagen[0]){
                multimedia = `uploads/${req.files.imagen[0].filename}`;
            }else if(req.files && req.files.video && req.files.video[0]){
                multimedia = `uploads/${req.files.video[0].filename}`;
            }
            const nuevaPublicacion = await Publicaciones.create({
                content: content || "",
                multimedia: multimedia,
                userId: usuarioId,
                creationDate: new Date()
            });
            res.status(201).json({message:"Publicacion creada con exito", publicacion: nuevaPublicacion});
        }catch(error){
            console.error("Error al crear la publicacion:", error);
            res.status(500).json({message: "Error al crear la publicacion", error: error.message});
        }
    };

    module.exports = {
        getUserPosts,
        getPostByUser,
        crearPublicacion
    };