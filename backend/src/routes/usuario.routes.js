const express = require("express");
const router = express.Router();

const usuarioController = require("../controllers/usuario.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get(
    "/usuarios/me",
    authMiddleware,
    usuarioController.meuPerfil
);

router.put(
    "/usuarios/me",
    authMiddleware,
    usuarioController.atualizarPerfil
);

module.exports = router;