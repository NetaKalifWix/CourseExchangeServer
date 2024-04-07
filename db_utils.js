require("dotenv").config();

const { Client } = require("pg");

class Database {
  constructor(internal = false) {
    this.client = new Client({
      user: process.env.DB_USERNAME,
      host: internal
        ? process.env.DB_INTERNAL_HOST
        : process.env.DB_EXTERNAL_HOST,
      database: process.env.DB_DATABASE_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: true
    });
  }

  static async connect(internal = false) {
    const db = new Database(internal);
    try {
      await db.client.connect();
      await db.create_tables();
      console.log("Connected to database");
    } catch (err) {
      console.log("Connection to database failed", err);
    }
    return db;
  }

  async create_tables() {
    return await this.run_query(
      "CREATE TABLE IF NOT EXISTS exchanges (" +
        "name VARCHAR (50) NOT NULL," +
        "phone VARCHAR (40) NOT NULL," +
        "currentCourse VARCHAR (40) NOT NULL," +
        "desiredCourse VARCHAR (40) NOT NULL," +
        "PRIMARY KEY (phone, currentCourse, desiredCourse) );"
    );
  }
  async add(exchange) {
    return await this.run_query("INSERT INTO exchanges VALUES($1, $2, $3, $4);", [
      exchange.name,
      exchange.phone,
      exchange.currentcourse,
      exchange.desiredcourse
    ]);
  }
  async delete(exchange) {
    return await this.run_query("DELETE FROM exchanges WHERE phone=$1 AND currentCourse=$2 AND desiredCourse=$3 RETURNING *;", [
      exchange.phone,
      exchange.currentcourse,
      exchange.desiredcourse
    ]);
  }

  async get() {
    return (await this.run_query("SELECT * from exchanges;")).map(exchange => ({
      ...exchange,
      currentCourse: exchange.currentcourse,
      desiredCourse: exchange.desiredcourse
    }));
  }

  async run_query(query_string, values) {
    try {
      return (await this.client.query(query_string, values)).rows;
    } catch (err) {
      console.log("\n\nQuery failed\n\n", query_string, values, "\n\n", err);
    }
  }
}
module.exports = Database;