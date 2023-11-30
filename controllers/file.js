const express = require("express");
const { verifyToken } = require("../services/firebase/index");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/Users/filipvlk/Desktop/ExtrifitMaterialyServer/assetsss");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer(storage);

router.post("/upload", upload.single("image"), (req, res) => {
  try {
    console.log(req.file);

    res.send("ok").status(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
