const express = require("express");
const router = require("./router/index");
const app = express();

app.use(express.json());

router(app);

module.exports = app;
