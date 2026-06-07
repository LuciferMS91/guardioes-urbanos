const express = require("express");
const router = express.Router();

const db = require("../database/db");

router.get("/teste-db", async (req, res) => {
    try {
        const resultado = await db.query("SELECT NOW()");

        res.status(200).json({
            sucesso: true,
            servidor: resultado.rows[0]
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            sucesso: false,
            erro: erro.message
        });
    }
});

module.exports = router;