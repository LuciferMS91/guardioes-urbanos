const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");

class AuthController {

    async cadastrar(req, res) {

        try {

            console.log("CADASTRO RECEBIDO:");
            console.log(req.body);

            const {
                nome,
                email,
                telefone,
                senha
            } = req.body;

            const usuarioExiste = await db.query(
                "SELECT * FROM usuarios WHERE email = $1",
                [email]
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
                    email,
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

        console.log("LOGIN RECEBIDO:");
        console.log(req.body);

        try {

            const { email, senha } = req.body;

            console.log("ETAPA 1");

            const usuario = await db.query(
                "SELECT * FROM usuarios WHERE email = $1",
                [email]
            );

            console.log("ETAPA 2");

            if (usuario.rows.length === 0) {
                return res.status(401).json({
                    erro: "Usuário não encontrado"
                });
            }

            console.log("ETAPA 3");

            console.log("Senha enviada:", senha);
            console.log("Hash armazenado:", usuario.rows[0].senha);

            const senhaValida = await bcrypt.compare(
                senha,
                usuario.rows[0].senha
            );

            console.log("ETAPA 4");
            console.log("SENHA VÁLIDA:", senhaValida);

            if (!senhaValida) {
                return res.status(401).json({
                    erro: "Senha inválida"
                });
            }

            console.log("ETAPA 5");
            console.log("CRIANDO TOKEN...");

            const token = jwt.sign(
                {
                    id: usuario.rows[0].id
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

            console.log("TOKEN CRIADO COM SUCESSO");
            console.log("ETAPA 6");

            return res.status(200).json({
                sucesso: true,
                token
            });

        } catch (erro) {

            console.error("ERRO NO LOGIN:");
            console.error(erro);

            return res.status(500).json({
                erro: erro.message
            });
        }
    }
}

module.exports = new AuthController();