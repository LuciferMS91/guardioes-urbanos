const { Pool } = require("pg");

const usarDatabaseUrl = Boolean(process.env.DATABASE_URL);
const ambienteProducao = process.env.NODE_ENV === "production";
const ambienteRailway = Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PROJECT_ID
);
const portaBanco = process.env.DB_PORT || process.env.PGPORT;

const usarSsl =
    process.env.DB_SSL === "true" ||
    (
        process.env.DB_SSL !== "false" &&
        (usarDatabaseUrl || ambienteProducao || ambienteRailway)
    );

const config = usarDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL
    }
    : {
        host: process.env.DB_HOST || process.env.PGHOST,
        port: portaBanco ? Number(portaBanco) : undefined,
        user: process.env.DB_USER || process.env.PGUSER,
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
        database: process.env.DB_NAME || process.env.PGDATABASE
    };

if (usarSsl) {
    config.ssl = {
        rejectUnauthorized: false
    };
}

const pool = new Pool(config);

pool.on("error", (erro) => {
    console.error("Erro inesperado no pool do Postgres:", erro);
});

module.exports = pool;
