const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../nebula.db");

const db = new Database(dbPath);

// Enable foreign-key protection
db.pragma("foreign_keys = ON");

// Read and execute schema
const schemaPath = path.join(__dirname, "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log("✅ SQLite database connected");
console.log(`📁 Database: ${dbPath}`);

module.exports = db;