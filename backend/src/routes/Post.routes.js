const { Router } = require("express");
const { getUserPosts } = require("../controllers/Post.controller");
const auth = require("../middelwares/auth.middelwares.js"); 

const route = Router();

route.get('/getUserPosts', auth, getUserPosts);

module.exports = route;