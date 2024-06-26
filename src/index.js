const express = require("express");
const dotenv = require("dotenv");
const sequelize =  require("./db.config");
const api = require("./api");
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    sequelize.sync();
    console.log("Database connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

app.use(express.json());
app.use("/", api);
app.get("/", (req, res) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
