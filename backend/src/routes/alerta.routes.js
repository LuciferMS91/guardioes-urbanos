const express = require("express");
const router = express.Router();

const alertaController = require("../controllers/alerta.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const validarAlerta = require("../middlewares/validar-alerta.middleware");
const { limiteAlertas } = require("../middlewares/rate-limit.middleware");

router.post(
    "/alertas",
    authMiddleware,
    limiteAlertas,
    upload.single("foto"),
    validarAlerta,
    alertaController.criar
);

router.get("/alertas", alertaController.listar);

router.get(
    "/usuarios/me/alertas",
    authMiddleware,
    alertaController.meusAlertas
);

router.put(
    "/alertas/:id",
    authMiddleware,
    alertaController.atualizar
);

router.patch(
    "/alertas/:id/resolver",
    authMiddleware,
    alertaController.resolver
);

router.delete(
    "/alertas/:id",
    authMiddleware,
    alertaController.excluir
);

module.exports = router;
