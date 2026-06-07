const express = require("express");

const router = express.Router();

const mapaController =
    require("../controllers/mapa.controller");

router.get(
    "/mapa/alertas",
    mapaController.listarAlertas
);

router.get(
    "/mapa/heatmap",
    mapaController.heatmap
);

module.exports = router;