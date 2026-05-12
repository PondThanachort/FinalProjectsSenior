import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST ?? process.env.MYSQLHOST ?? "127.0.0.1",
  port: Number(process.env.MYSQL_PORT ?? process.env.MYSQLPORT ?? 3306),
  user: process.env.MYSQL_USER ?? process.env.MYSQLUSER ?? "root",
  password: process.env.MYSQL_PASSWORD ?? process.env.MYSQLPASSWORD ?? "",
  database: process.env.MYSQL_DATABASE ?? process.env.MYSQLDATABASE ?? "66105db",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

export default pool;
