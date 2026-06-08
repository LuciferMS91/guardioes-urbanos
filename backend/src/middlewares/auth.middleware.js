const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            erro: "Token não informado"
        });
    }

    const [tipo, token] = authHeader.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({
            erro: "Token inválido"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuarioId = decoded.id;

        return next();

    } catch (erro) {

        return res.status(401).json({
            erro: "Token inválido"
        });
    }
}

module.exports = authMiddleware;
