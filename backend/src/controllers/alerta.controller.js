const db = require("../database/db");

class AlertaController {
    async criar(req, res) {
        try {
            const {
                tipo,
                descricao,
                latitude,
                longitude,
                anonimo
            } = req.body;

            const usuarioId = req.usuarioId;

            const fotoUrl = req.file
                ? `/uploads/alertas/${req.file.filename}`
                : null;

            const alerta = await db.query(
                `
                INSERT INTO alertas
                (
                    usuario_id,
                    tipo,
                    descricao,
                    latitude,
                    longitude,
                    anonimo,
                    foto_url
                )
                VALUES
                (
                    $1,$2,$3,$4,$5,$6,$7
                )
                RETURNING *
                `,
                [
                    usuarioId,
                    tipo,
                    descricao,
                    latitude,
                    longitude,
                    anonimo === "true" || anonimo === true,
                    fotoUrl
                ]
            );

            return res.status(201).json({
                sucesso: true,
                alerta: alerta.rows[0]
            });

        } catch (erro) {
            console.error("ERRO AO CRIAR ALERTA:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao criar alerta"
            });
        }
    }

    async listar(req, res) {
        try {
            const { tipo } = req.query;

            let consulta = `
                SELECT *
                FROM alertas
                ORDER BY criado_em DESC
            `;

            let parametros = [];

            if (tipo) {
                consulta = `
                    SELECT *
                    FROM alertas
                    WHERE tipo = $1
                    ORDER BY criado_em DESC
                `;

                parametros = [tipo];
            }

            const alertas = await db.query(
                consulta,
                parametros
            );

            return res.status(200).json(alertas.rows);

        } catch (erro) {
            console.error("ERRO AO LISTAR ALERTAS:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao listar alertas"
            });
        }
    }

    async meusAlertas(req, res) {
        try {
            const resultado = await db.query(
                `
                SELECT *
                FROM alertas
                WHERE usuario_id = $1
                ORDER BY criado_em DESC
                `,
                [req.usuarioId]
            );

            return res.status(200).json(resultado.rows);

        } catch (erro) {
            console.error("ERRO AO BUSCAR MEUS ALERTAS:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao buscar seus alertas"
            });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;

            const {
                tipo,
                descricao,
                anonimo
            } = req.body;

            const resultado = await db.query(
                `
                UPDATE alertas
                SET
                    tipo = $1,
                    descricao = $2,
                    anonimo = $3,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = $4 AND usuario_id = $5
                RETURNING *
                `,
                [
                    tipo,
                    descricao,
                    anonimo === "true" || anonimo === true,
                    id,
                    req.usuarioId
                ]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    erro: "Alerta não encontrado ou sem permissão"
                });
            }

            return res.status(200).json({
                sucesso: true,
                alerta: resultado.rows[0]
            });

        } catch (erro) {
            console.error("ERRO AO ATUALIZAR ALERTA:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao atualizar alerta"
            });
        }
    }

    async resolver(req, res) {
        try {
            const { id } = req.params;

            const resultado = await db.query(
                `
                UPDATE alertas
                SET
                    status = 'resolvido',
                    resolvido = TRUE,
                    atualizado_em = CURRENT_TIMESTAMP
                WHERE id = $1 AND usuario_id = $2
                RETURNING *
                `,
                [
                    id,
                    req.usuarioId
                ]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    erro: "Alerta não encontrado ou sem permissão"
                });
            }

            return res.status(200).json({
                sucesso: true,
                alerta: resultado.rows[0]
            });

        } catch (erro) {
            console.error("ERRO AO RESOLVER ALERTA:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao resolver alerta"
            });
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;

            const resultado = await db.query(
                `
                DELETE FROM alertas
                WHERE id = $1 AND usuario_id = $2
                RETURNING id
                `,
                [
                    id,
                    req.usuarioId
                ]
            );

            if (resultado.rows.length === 0) {
                return res.status(404).json({
                    erro: "Alerta não encontrado ou sem permissão"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Alerta excluído com sucesso"
            });

        } catch (erro) {
            console.error("ERRO AO EXCLUIR ALERTA:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao excluir alerta"
            });
        }
    }
}

module.exports = new AlertaController();