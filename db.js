const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Mohana@123",
    database: "event_booking"
});


db.connect((err) => {
  if (err) {
    console.log("Database connection failed ❌");
    console.error(err);
  } else {
    console.log("MySQL Connected ✅");
  }
});

module.exports = db;
