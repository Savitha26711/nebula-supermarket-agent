const db = require("./db");

const tables = db
    .prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
        ORDER BY name
    `)
    .all();

console.log("\n📋 Database tables:");

tables.forEach((table) => {
    console.log(" -", table.name);
});

db.close();