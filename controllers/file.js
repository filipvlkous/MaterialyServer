const express = require("express");
const { verifyToken } = require("../services/firebase/index");
const multer = require("multer");
const router = express.Router();

let storage = multer.diskStorage({
  destination: "./assets",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    console.log(req.file.filename);

    res.send("ok").status(200);
  } catch (error) {
    console.log(error);
  }
});

router.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  try {
    const filePath = __dirname + "/../assets/" + fileName; // Adjust the path accordingly

    res.download(filePath, fileName);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;