const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

class AuthController {

    async cadastrar(req, res) {

        try {

            const {
                nome,
                email,
                telefone,
                senha
            } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({
                    erro: "Nome, e-mail e senha são obrigatórios"
                });
            }

            if (String(senha).length < 6) {
                return res.status(400).json({
                    erro: "Senha deve possuir pelo menos 6 caracteres"
                });
            }

            const emailNormalizado = String(email).trim().toLowerCase();

            const usuarioExiste = await db.query(
                "SELECT id FROM usuarios WHERE email = $1",
                [emailNormalizado]
            );

            if (usuarioExiste.rows.length > 0) {
                return res.status(400).json({
                    erro: "E-mail já cadastrado"
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const novoUsuario = await db.query(
                `
                INSERT INTO usuarios
                (nome,email,telefone,senha)
                VALUES ($1,$2,$3,$4)
                RETURNING id,nome,email
                `,
                [
                    nome,
                    emailNormalizado,
                    telefone,
                    senhaHash
                ]
            );

            return res.status(201).json({
                sucesso: true,
                usuario: novoUsuario.rows[0]
            });

        } catch (erro) {

            console.error("ERRO NO CADASTRO:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao cadastrar usuário"
            });
        }
    }

    async login(req, res) {

        try {

            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({
                    erro: "E-mail e senha são obrigatórios"
                });
            }

            const emailNormalizado = String(email).trim().toLowerCase();

            const usuario = await db.query(
                `
                SELECT id, senha
                FROM usuarios
                WHERE email = $1 AND ativo = TRUE
                `,
                [emailNormalizado]
            );

            if (usuario.rows.length === 0) {
                return res.status(401).json({
                    erro: "Credenciais inválidas"
                });
            }

            const senhaValida = await bcrypt.compare(
                senha,
                usuario.rows[0].senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    erro: "Credenciais inválidas"
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.rows[0].id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

            return res.status(200).json({
                sucesso: true,
                token
            });

        } catch (erro) {

            console.error("ERRO NO LOGIN:");
            console.error(erro);

            return res.status(500).json({
                erro: "Erro ao fazer login"
            });
        }
    }
}

module.exports = new AuthController();
