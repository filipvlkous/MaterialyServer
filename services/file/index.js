const multer = require("multer");
const fs = require("fs");

let storage = multer.diskStorage({
  destination: "./assets",
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

let storageArray = multer.diskStorage({
  destination: async function (req, file, callback) {
    const { key } = req.query;
    const path = "./assets/" + key;

    callback(null, path);
  },
  filename: function (req, file, callback) {
    let uploadedFileName;
    if (!fs.existsSync) {
      uploadedFileName = Date.now() + "." + file.originalname;
    } else {
      uploadedFileName = file.originalname;
    }
    callback(null, uploadedFileName);
  },
});

const uploadSingle = multer({ storage: storage });
const uploadArray = multer({ storage: storageArray });

const createDockMiddleware = async (req, res, next) => {
  try {
    const { key } = req.query;
    const productDirectory = "./assets/" + key;

    // Use fs.promises for asynchronous file system operations
    try {
      await fs.promises.access(productDirectory);
      console.log(`Directory already exists.`);
    } catch (err) {
      // Directory doesn't exist, create it
      try {
        await fs.promises.mkdir(productDirectory);
        console.log(`Directory created.`);
      } catch (mkdirErr) {
        console.error(`Error creating directory: ${mkdirErr}`);
        return res.status(500).json({ error: "Error creating directory" });
      }
    }

    next();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = (id, name) => {
  const imagePath = `./assets/${id}/${name}`;

  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    } else {
      console.log("File deleted successfully");
    }
  });
};

const deleteProduct = (id, image) => {
  const filePath = "./assets/" + image;

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file: ${err}`);
    } else {
      console.log("File deleted successfully");
    }
  });

  const dirPath = "./assets/" + id;

  fs.rm(dirPath, { recursive: true }, (err) => {
    if (err) {
      console.error(`Error deleting directory: ${err}`);
    } else {
      console.log("Directory deleted successfully");
    }
  });
};

module.exports = {
  deleteProduct,
  deleteImage,
  createDockMiddleware,
  uploadSingle,
  uploadArray,
};
