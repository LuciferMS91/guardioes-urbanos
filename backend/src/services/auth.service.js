const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {

    async gerarHashSenha(senha) {

        return await bcrypt.hash(
            senha,
            10
        );
    }

    async compararSenha(
        senha,
        senhaHash
    ) {

        return await bcrypt.compare(
            senha,
            senhaHash
        );
    }

    gerarToken(usuarioId) {

        return jwt.sign(
            {
                id: usuarioId
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "7d"
            }
        );
    }

}

module.exports = new AuthService();