const express = require("express");
const router = express.Router();
const {
  verifyToken,
  createUser,
  deleteUser,
  getAllUsers,
} = require("../services/firebase/index");

router.get("/test", verifyToken, async (req, res) => {
  res.send("ok").status(200);
});

router.post("/new_user", verifyToken, async (req, res) => {
  try {
    const { email, pass } = req.body.data;
    await createUser(email, pass);
    res.send("ok").status(200);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete_user", verifyToken, async (req, res) => {
  const uid = req.body.uid;
  try {
    await deleteUser(uid);
    res.send("ok").status(200);
  } catch (error) {
    res.send("error", error).status(400);
  }
});

router.get("/get_all_users", verifyToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.send(users).status(200);
  } catch (error) {
    res.send("error", error).status(400);
  }
});

module.exports = router;
