module.exports = (req, res, next) => {

    const {
        tipo,
        descricao,
        latitude,
        longitude
    } = req.body;

    if (!tipo) {
        return res.status(400).json({
            erro: "Tipo do alerta é obrigatório"
        });
    }

    if (!descricao || descricao.length < 5) {
        return res.status(400).json({
            erro: "Descrição deve possuir pelo menos 5 caracteres"
        });
    }

    if (
        latitude === undefined ||
        latitude < -90 ||
        latitude > 90
    ) {
        return res.status(400).json({
            erro: "Latitude inválida"
        });
    }

    if (
        longitude === undefined ||
        longitude < -180 ||
        longitude > 180
    ) {
        return res.status(400).json({
            erro: "Longitude inválida"
        });
    }

    next();
};