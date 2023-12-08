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

    callback(null, "./assets/" + key);
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  },
});

const uploadSingle = multer({ storage: storage });
const uploadArray = multer({ storage: storageArray });

const createDockMiddleware = (req, res, next) => {
  try {
    const { key } = req.query;
    const productDirectory = "./assets/" + key;
    fs.access(productDirectory, (err) => {
      if (err) {
        // Directory doesn't exist, create it
        fs.mkdir(productDirectory, (err) => {
          if (err) {
            console.error(`Error creating directory: ${err}`);
          } else {
            console.log(`Directory created.`);
          }
        });
      } else {
        console.log(`Directory already exists.`);
      }
    });

    next();
  } catch (e) {
    console.log(e);
  }
};

const deleteImage = (id, name) => {
  const imagePath = "./assets/" + id + "/" + name;
  fs.unlink(imagePath, (err) => {
    if (err) {
      throw ("Error deleting file:", err);
    } else {
      console.log("File deleted successfully");
    }
  });
};

module.exports = {
  deleteImage,
  createDockMiddleware,
  uploadSingle,
  uploadArray,
};
