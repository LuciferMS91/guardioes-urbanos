const express = require("express");
const router = express.Router();

const comentarioController = require("../controllers/comentario.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/alertas/:id/comentarios", comentarioController.listar);
router.post("/alertas/:id/comentarios", authMiddleware, comentarioController.criar);

router.post("/alertas/:id/confirmar", authMiddleware, comentarioController.confirmar);
router.post("/alertas/:id/discordar", authMiddleware, comentarioController.discordar);

module.exports = router;