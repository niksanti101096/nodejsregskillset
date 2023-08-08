const express = require("express");
const path = require("path");
const env = require("dotenv");
const cookie_parser = require("cookie-parser");

const app = express();
const port = 1010;

env.config({
  path: "./.env",
});

app.set("view engine", "hbs");
// app.use(express.static(path.join(__dirname, "./public")));

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json()); // Parses JSON payload

// Define Routes imported from another file
app.use("/", require("./routes/registerRoutes"));
app.use("/auth", require("./routes/auth"));

app.use(cookie_parser());

app.listen(port, () => {
  console.log(`Serving in http://localhost:${port}`);
});
