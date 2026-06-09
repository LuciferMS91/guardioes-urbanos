require("dotenv").config();

const app = require("./app");
const { runMigrations } = require("./database/migrations");

const PORT = process.env.PORT || 3000;

async function startServer() {
    if (process.env.RUN_MIGRATIONS_ON_START !== "false") {
        await runMigrations();
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`
====================================
GUARDIÕES URBANOS
Servidor iniciado com sucesso
Porta: ${PORT}
Host: 0.0.0.0
====================================
`);
    });
}

startServer().catch((erro) => {
    console.error("Erro ao iniciar servidor:");
    console.error(erro);
    process.exit(1);
});
