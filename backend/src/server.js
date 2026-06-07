require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 3000;

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