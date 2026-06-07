const db = require("../database/db");

class EmergenciaController {

    async listar(req, res) {

        try {

            const resultado = await db.query(
                `
                SELECT *
                FROM contatos_emergencia
                ORDER BY nome
                `
            );

            return res.status(200).json(
                resultado.rows
            );

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                erro:
                    "Erro ao listar contatos de emergência"
            });
        }
    }

}

module.exports =
    new EmergenciaController();