const db = require("../database/db");

class MapaController {
    async listarAlertas(req, res) {
        try {
            const resultado = await db.query(
                `
                SELECT *
                FROM alertas
                WHERE status = 'ativo'
                ORDER BY criado_em DESC
                `
            );

            return res.status(200).json(resultado.rows);
        } catch (erro) {
            console.error("ERRO AO LISTAR ALERTAS DO MAPA:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao carregar mapa"
            });
        }
    }

    async heatmap(req, res) {
        try {
            const resultado = await db.query(
                `
                SELECT
                    ROUND(latitude::numeric, 3) AS latitude,
                    ROUND(longitude::numeric, 3) AS longitude,
                    COUNT(*) AS total_alertas,
                    CASE
                        WHEN COUNT(*) >= 10 THEN 'CRITICO'
                        WHEN COUNT(*) >= 6 THEN 'ALTO'
                        WHEN COUNT(*) >= 3 THEN 'MEDIO'
                        ELSE 'BAIXO'
                    END AS nivel
                FROM alertas
                WHERE
                    status = 'ativo'
                    AND criado_em >= NOW() - INTERVAL '30 days'
                GROUP BY
                    ROUND(latitude::numeric, 3),
                    ROUND(longitude::numeric, 3)
                ORDER BY total_alertas DESC
                `
            );

            return res.status(200).json(resultado.rows);
        } catch (erro) {
            console.error("ERRO AO GERAR HEATMAP:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao carregar heatmap"
            });
        }
    }
}

module.exports = new MapaController();