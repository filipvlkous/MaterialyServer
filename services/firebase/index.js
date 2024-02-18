const admin = require("firebase-admin");
const sdk = require("../../firebaseAdmin.json");
console.log(process.env.TYPE);

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_x509_cert_url: process.env.CLIENT,
    universe_domain: process.env.UNIVERSE_DOMAIN,
  }),
});
const auth = admin.auth();
const db = admin.firestore();

const verifyToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authorization.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(token);
    if (decodedToken.uid !== process.env.USER_ID)
      return res.status(402).json({ error: "Unauthorizedd" });

    req.user = decodedToken; // Attach the user information to the request object
    next();
  } catch (error) {
    return res.status(403).json(error);
  }
};

const createUser = async (email, pass, name) => {
  try {
    // Create user using auth
    await auth.createUser({
      email: email,
      password: pass,
      disabled: false,
    });

    // Add user details to the 'users' collection in the database
    const result = await db.collection("users").add({ name, email });

    return result;
  } catch (error) {
    throw error;
  }
};

const deleteUser = async (id, email) => {
  try {
    const user = await auth.getUserByEmail(email);
    const result = await auth
      .deleteUser(user.uid)
      .then(() => db.collection("users").doc(id).delete());
    return result;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    return await auth.listUsers();
  } catch (error) {
    throw error;
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

const deleteProductFb = async (id) => {
  try {
    await db.collection("materials").doc(id).delete();
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
  deleteProductFb,
};
