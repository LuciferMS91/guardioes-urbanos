const db = require("../database/db");

class ComentarioController {
    async criar(req, res) {
        try {
            const alertaId = req.params.id;
            const usuarioId = req.usuarioId;
            const { comentario } = req.body;

            if (!comentario || comentario.trim().length < 2) {
                return res.status(400).json({ erro: "Comentário inválido" });
            }

            const resultado = await db.query(
                `
                INSERT INTO comentarios_alerta
                (alerta_id, usuario_id, comentario)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
                [alertaId, usuarioId, comentario]
            );

            return res.status(201).json({
                sucesso: true,
                comentario: resultado.rows[0]
            });
        } catch (erro) {
            console.error("ERRO AO COMENTAR:", erro);
            return res.status(500).json({ erro: "Erro ao criar comentário" });
        }
    }

    async listar(req, res) {
        try {
            const alertaId = req.params.id;

            const resultado = await db.query(
                `
                SELECT
                    c.id,
                    c.comentario,
                    c.criado_em,
                    u.nome
                FROM comentarios_alerta c
                LEFT JOIN usuarios u ON u.id = c.usuario_id
                WHERE c.alerta_id = $1
                ORDER BY c.criado_em DESC
                `,
                [alertaId]
            );

            return res.status(200).json(resultado.rows);
        } catch (erro) {
            console.error("ERRO AO LISTAR COMENTÁRIOS:", erro);
            return res.status(500).json({ erro: "Erro ao listar comentários" });
        }
    }

    async confirmar(req, res) {
        try {
            const alertaId = req.params.id;
            const usuarioId = req.usuarioId;

            await db.query(
                `
                INSERT INTO confirmacoes_alerta
                (alerta_id, usuario_id, tipo)
                VALUES ($1, $2, 'CONFIRMA')
                ON CONFLICT (alerta_id, usuario_id)
                DO UPDATE SET tipo = 'CONFIRMA'
                `,
                [alertaId, usuarioId]
            );

            const atualizado = await db.query(
                `
                UPDATE alertas
                SET
                    confirmacoes = (
                        SELECT COUNT(*)
                        FROM confirmacoes_alerta
                        WHERE alerta_id = $1 AND tipo = 'CONFIRMA'
                    ),
                    discordancias = (
                        SELECT COUNT(*)
                        FROM confirmacoes_alerta
                        WHERE alerta_id = $1 AND tipo = 'DISCORDA'
                    )
                WHERE id = $1
                RETURNING *
                `,
                [alertaId]
            );

            return res.status(200).json({
                sucesso: true,
                alerta: atualizado.rows[0]
            });
        } catch (erro) {
            console.error("ERRO AO CONFIRMAR:", erro);
            return res.status(500).json({ erro: "Erro ao confirmar alerta" });
        }
    }

    async discordar(req, res) {
        try {
            const alertaId = req.params.id;
            const usuarioId = req.usuarioId;

            await db.query(
                `
                INSERT INTO confirmacoes_alerta
                (alerta_id, usuario_id, tipo)
                VALUES ($1, $2, 'DISCORDA')
                ON CONFLICT (alerta_id, usuario_id)
                DO UPDATE SET tipo = 'DISCORDA'
                `,
                [alertaId, usuarioId]
            );

            const atualizado = await db.query(
                `
                UPDATE alertas
                SET
                    confirmacoes = (
                        SELECT COUNT(*)
                        FROM confirmacoes_alerta
                        WHERE alerta_id = $1 AND tipo = 'CONFIRMA'
                    ),
                    discordancias = (
                        SELECT COUNT(*)
                        FROM confirmacoes_alerta
                        WHERE alerta_id = $1 AND tipo = 'DISCORDA'
                    )
                WHERE id = $1
                RETURNING *
                `,
                [alertaId]
            );

            return res.status(200).json({
                sucesso: true,
                alerta: atualizado.rows[0]
            });
        } catch (erro) {
            console.error("ERRO AO DISCORDAR:", erro);
            return res.status(500).json({ erro: "Erro ao discordar do alerta" });
        }
    }
}

module.exports = new ComentarioController();