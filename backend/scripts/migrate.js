require("dotenv").config();

const { runMigrations } = require("../src/database/migrations");

runMigrations({ closePool: true }).catch((error) => {
    console.error("Migration failed:");
    console.error(error);
    process.exit(1);
});
