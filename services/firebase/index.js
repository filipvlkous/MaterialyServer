const admin = require("firebase-admin");
const sdk = require("../../firebaseAdmin.json");
admin.initializeApp({
  credential: admin.credential.cert(sdk),
});
const auth = admin.auth();
const db = admin.firestore();

const verifyToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized3d" });
    }

    const token = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== "buIKS82mh8OCVnzZ4lbsf0zJ5PQ2")
      return res.status(402).json({ error: "Unauthorizedddd" });

    req.user = decodedToken; // Attach the user information to the request object
    next();
  } catch (error) {
    return res.status(403).json(error);
  }
};

const createUser = async (email, pass) => {
  try {
    return await auth.createUser({
      email: email,
      password: pass,
      disabled: false,
    });
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async () => {
  try {
    return await auth.listUsers();
  } catch (error) {
    console.log(error);
  }
};

const createDoc = async (name, image, text) => {
  try {
    await db
      .collection("materials")
      .add({ name, image, text })
      .then(() => console.log("ok"));
  } catch (error) {
    console.log(error);
  }
};

const createMultiDocs = async (id, images) => {
  try {
    await Promise.all(
      images.map(async (image) => {
        const name = image.filename;
        await db
          .collection("materials")
          .doc(id)
          .collection("images")
          .add({ name });
      })
    );
  } catch (error) {
    throw error;
  }
};
const deleteImageFb = async (id, idDoc) => {
  try {
    await db
      .collection("materials")
      .doc(id)
      .collection("images")
      .doc(idDoc)
      .delete();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  deleteImageFb,
  createMultiDocs,
  getAllUsers,
  verifyToken,
  createUser,
  deleteUser,
  createDoc,
};
