exports.sucesso = (res, dados) => {
    return res.status(200).json({
        sucesso: true,
        dados
    });
};

exports.erro = (res, status, mensagem) => {
    return res.status(status).json({
        sucesso: false,
        erro: mensagem
    });
};