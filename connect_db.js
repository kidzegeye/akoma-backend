const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const filepath = "./src/db/tables.db";

function createDbConnection() {
  if (fs.existsSync(filepath)) {
    return new sqlite3.Database(filepath);
  } else {
    const db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        return console.error(error.message);
      }
      createTable(db);
    });
    console.log("Connection with SQLite has been established");
    return db;
  }
}

function createTable(db) {
  db.exec(
    fs.readFileSync("./src/sql/create_tables.sql", {
      encoding: "utf8",
      flag: "r",
    })
  );
}

module.exports = createDbConnection();
