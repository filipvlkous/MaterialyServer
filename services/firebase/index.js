const admin = require("firebase-admin");
const sdk = require("../../firebaseAdmin.json");
const { async } = require("@firebase/util");

admin.initializeApp({
  credential: admin.credential.cert(sdk),
});
const auth = admin.auth();
var db = admin.firestore();

const verifyToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorizedddd" });
    }

    const token = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid != "buIKS82mh8OCVnzZ4lbsf0zJ5PQ2")
      return res.status(402).json({ error: "Unauthorizedddd" });

    req.user = decodedToken; // Attach the user information to the request object
    next();
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized 2" });
  }
};

const createUser = async (email, pass) => {
  try {
    const user = await auth.createUser({
      email: email,
      password: pass,
      disabled: false,
    });
    return user;
  } catch (error) {
    console.log(error);
  }
};

const deleteUser = async (uid) => {
  try {
    await auth.deleteUser(uid);
    return;
  } catch (error) {
    console.log(error);
  }
};

const getAllUsers = async () => {
  try {
    const users = await auth.listUsers();
    return users;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllUsers,
  verifyToken,
  createUser,
  deleteUser,
};
