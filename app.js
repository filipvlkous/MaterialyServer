const express = require("express");
var cors = require("cors");
const app = express();
const file = require("./controllers/file");
const firebaseRouter = require("./controllers/firebase");
const port = 8080;

app.use(cors());
app.use(express.json());
app.use(express.static("/assets"));
app.use("/firebase", firebaseRouter);
app.use("/file", file);

app.get("/", (req, res) => {
  console.log(req.body);
  res.status(200).send("hello");
});

app.listen(port, () => console.log("listen on port"));
