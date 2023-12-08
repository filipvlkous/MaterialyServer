const express = require("express");
const {
  verifyToken,
  createDoc,
  createMultiDocs,
  deleteImageFb,
} = require("../services/firebase/index");
const {
  deleteImage,
  createDockMiddleware,
  uploadSingle,
  uploadArray,
} = require("../services/file/index");
const router = express.Router();

router.post(
  "/upload",
  uploadSingle.single("image"),
  verifyToken,
  async (req, res) => {
    try {
      await createDoc(req.body.name, req.file.filename, req.body.name);

      res.send("ok").status(200);
    } catch (error) {
      console.log(error);
    }
  }
);

router.post(
  "/uploadImages",
  createDockMiddleware,
  verifyToken,
  uploadArray.array("images"),
  async (req, res) => {
    try {
      await createMultiDocs(req.query.key, req.files);
      res.send("ok").status(200);
    } catch (error) {
      throw error;
    }
  }
);

router.get("/download/:fileName", verifyToken, (req, res) => {
  const fileName = req.params.fileName;
  try {
    const filePath = __dirname + "/../assets/" + fileName; // Adjust the path accordingly

    res.download(filePath, fileName);
  } catch (error) {
    console.log(error);
  }
});

router.delete(
  "/deleteImage/:id/:name/:idDoc",
  verifyToken,
  async (req, res) => {
    try {
      const id = req.params.id;
      const name = req.params.name;
      const idDoc = req.params.idDoc;
      deleteImage(id, name);
      await deleteImageFb(id, idDoc);
      res.status(200).send("Image deleted successfully");
    } catch (error) {
      throw error;
    }
  }
);

module.exports = router;
