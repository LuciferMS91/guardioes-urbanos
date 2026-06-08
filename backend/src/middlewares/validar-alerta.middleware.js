module.exports = (req, res, next) => {

    const {
        tipo,
        descricao,
        latitude,
        longitude
    } = req.body;

    const tiposPermitidos = [
        "ASSALTO_ROUBO",
        "ATIVIDADE_SUSPEITA",
        "FALTA_ILUMINACAO",
        "ALAGAMENTO",
        "VIA_INTRANSITAVEL",
        "QUEDA_ENERGIA",
        "FALTA_AGUA",
        "OUTROS"
    ];

    if (!tipo) {
        return res.status(400).json({
            erro: "Tipo do alerta é obrigatório"
        });
    }

    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({
            erro: "Tipo do alerta inválido"
        });
    }

    if (!descricao || descricao.trim().length < 5) {
        return res.status(400).json({
            erro: "Descrição deve possuir pelo menos 5 caracteres"
        });
    }

    const latitudeNumero = Number(latitude);
    const longitudeNumero = Number(longitude);

    if (
        !Number.isFinite(latitudeNumero) ||
        latitudeNumero < -90 ||
        latitudeNumero > 90
    ) {
        return res.status(400).json({
            erro: "Latitude inválida"
        });
    }

    if (
        !Number.isFinite(longitudeNumero) ||
        longitudeNumero < -180 ||
        longitudeNumero > 180
    ) {
        return res.status(400).json({
            erro: "Longitude inválida"
        });
    }

    next();
};
