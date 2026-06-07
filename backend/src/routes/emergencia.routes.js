const express = require("express");

const router = express.Router();

const emergenciaController =
    require(
        "../controllers/emergencia.controller"
    );

router.get(
    "/emergencia",
    emergenciaController.listar
);

module.exports = router;