const express = require("express");
const {
  verifyToken,
  createDoc,
  createMultiDocs,
  deleteImageFb,
  deleteProductFb,
} = require("../services/firebase/index");
const {
  deleteProduct,
  deleteImage,
  createDockMiddleware,
  uploadSingle,
  uploadArray,
} = require("../services/file/index");
const e = require("express");
const router = express.Router();

router.post(
  "/upload",
  uploadSingle.single("image"),
  verifyToken,
  async (req, res) => {
    try {
      const { name, text } = req.body;
      const filename = req.file.filename;

      await createDoc(name, filename, text);

      res.status(200).send("ok");
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).send("Internal Server Error");
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
      console.error("Error uploading image:", error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/download/:filename", (req, res) => {
  try {
    const id = req.query.id;
    const filePath = __dirname + `/../assets/${id}/${req.params.filename}`;
    res.download(
      filePath,
      req.params.filename, // Remember to include file extension
      (err) => {
        if (err) {
          res.send({
            error: err,
            msg: "Problem downloading the file",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error downloading image:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/deleteImage", verifyToken, async (req, res) => {
  try {
    const id = req.query.id;
    const name = req.query.name;
    const idDoc = req.query.doc;

    deleteImage(id, name);
    await deleteImageFb(id, idDoc);
    res.status(200).send("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/deleteProduct", verifyToken, async (req, res) => {
  try {
    const id = req.query.id;
    const image = req.query.image;
    deleteProduct(id, image);
    await deleteProductFb(id);
    res.status(200).send("Image deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
