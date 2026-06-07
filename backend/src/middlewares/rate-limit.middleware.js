const rateLimit = require("express-rate-limit");

const limiteGeral = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        erro: "Muitas requisições. Tente novamente em alguns minutos."
    }
});

const limiteAlertas = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: {
        erro: "Limite de alertas por hora atingido."
    }
});

module.exports = {
    limiteGeral,
    limiteAlertas
};