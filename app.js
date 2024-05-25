const express = require("express");
var cors = require("cors");
require("dotenv").config();
const app = express();
const file = require("./controllers/file");
const firebaseRouter = require("./controllers/firebase");
const dafti_vouchers = require("./controllers/dafit_vouchers/index");
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(__dirname + "/assets"));

app.use("/firebase", firebaseRouter);
app.use("/file", file);
app.use("/dafit_pages", dafti_vouchers);
const port = 8080;
app.get("/", (req, res) => {
  res.status(200).send("hello");
});

app.listen(port, () => console.log("listen on port"));
