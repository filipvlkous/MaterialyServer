const express = require("express");
var cors = require("cors");
const app = express();
const file = require("./controllers/file");
const firebaseRouter = require("./controllers/firebase");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  console.log(req.body);
  res.status(200).send("hello");
});
app.use("/firebase", firebaseRouter);
app.use("/file", file);
const port = 8080;

app.listen(port, () => console.log("listen on port"));
