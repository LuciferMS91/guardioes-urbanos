const db = require("../database/db");

class UsuarioController {

    async meuPerfil(req, res) {

        try {

            const usuario = await db.query(
                `
                SELECT
                    id,
                    nome,
                    email,
                    telefone,
                    foto_perfil,
                    ativo,
                    criado_em
                FROM usuarios
                WHERE id = $1
                `,
                [req.usuarioId]
            );

            if (usuario.rows.length === 0) {
                return res.status(404).json({
                    erro: "Usuário não encontrado"
                });
            }

            return res.json(usuario.rows[0]);

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao buscar perfil"
            });
        }
    }

    async atualizarPerfil(req, res) {

        try {

            const {
                nome,
                telefone,
                foto_perfil
            } = req.body;

            const resultado = await db.query(
                `
                UPDATE usuarios
                SET
                    nome = $1,
                    telefone = $2,
                    foto_perfil = $3
                WHERE id = $4
                RETURNING *
                `,
                [
                    nome,
                    telefone,
                    foto_perfil,
                    req.usuarioId
                ]
            );

            return res.json({
                sucesso: true,
                usuario: resultado.rows[0]
            });

        } catch (erro) {

            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao atualizar perfil"
            });
        }
    }
}

module.exports = new UsuarioController();