const fs = require("fs");
const path = require("path");

const db = require("./db");

const migrationsDir = path.join(__dirname, "..", "..", "migrations");

async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
}

async function migrationWasApplied(client, filename) {
    const result = await client.query(
        "SELECT 1 FROM schema_migrations WHERE filename = $1",
        [filename]
    );

    return result.rows.length > 0;
}

async function applyMigration(client, filename) {
    const filePath = path.join(migrationsDir, filename);
    const sql = fs.readFileSync(filePath, "utf8");

    await client.query("BEGIN");

    try {
        await client.query(sql);
        await client.query(
            "INSERT INTO schema_migrations (filename) VALUES ($1)",
            [filename]
        );
        await client.query("COMMIT");
        console.log(`Applied migration: ${filename}`);
    } catch (erro) {
        await client.query("ROLLBACK");
        throw erro;
    }
}

async function runMigrations({ closePool = false } = {}) {
    const client = await db.connect();

    try {
        await ensureMigrationsTable(client);

        const files = fs
            .readdirSync(migrationsDir)
            .filter((file) => file.endsWith(".sql"))
            .sort();

        for (const file of files) {
            if (await migrationWasApplied(client, file)) {
                console.log(`Skipping already applied migration: ${file}`);
                continue;
            }

            await applyMigration(client, file);
        }
    } finally {
        client.release();

        if (closePool) {
            await db.end();
        }
    }
}

module.exports = {
    runMigrations
};
