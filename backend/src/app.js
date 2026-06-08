const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const testeRoutes = require("./routes/teste.routes");
const authRoutes = require("./routes/auth.routes");
const alertaRoutes = require("./routes/alerta.routes");
const usuarioRoutes = require("./routes/usuario.routes");
const comentarioRoutes = require("./routes/comentario.routes");
const emergenciaRoutes = require("./routes/emergencia.routes");
const mapaRoutes = require("./routes/mapa.routes");

const { limiteGeral } = require("./middlewares/rate-limit.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(limiteGeral);

app.use(
    "/uploads",
    express.static(path.join(__dirname, "..", "uploads"))
);

app.use("/api", testeRoutes);
app.use("/api", authRoutes);
app.use("/api", alertaRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", comentarioRoutes);
app.use("/api", emergenciaRoutes);
app.use("/api", mapaRoutes);

app.get("/", (req, res) => {
    return res.status(200).json({
        projeto: "Guardiões Urbanos",
        versao: "1.0.0",
        status: "online"
    });
});

app.use((erro, req, res, next) => {
    if (erro?.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            erro: "Imagem deve possuir no máximo 5MB"
        });
    }

    if (erro?.message === "Apenas imagens são permitidas") {
        return res.status(400).json({
            erro: erro.message
        });
    }

    return next(erro);
});

app.use((req, res) => {
    return res.status(404).json({
        erro: "Rota não encontrada"
    });
});

app.use((erro, req, res, next) => {
    console.error(erro);

    return res.status(500).json({
        erro: "Erro interno do servidor"
    });
});

module.exports = app;
