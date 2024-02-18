const express = require("express");
const router = express.Router();
const {
  verifyToken,
  createUser,
  deleteUser,
  getAllUsers,
} = require("../services/firebase/index");

router.post("/new_user", verifyToken, async (req, res) => {
  try {
    const { email, pass, name } = req.body.data;

    const createUserResult = await createUser(email, pass, name);
    if (createUserResult) {
      res.send("ok").status(200);
    } else {
      res.send("chyba").status(205);
    }
  } catch (error) {
    console.error("Error new user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete_user", verifyToken, async (req, res) => {
  const { id, email } = req.query;

  try {
    const result = await deleteUser(id, email);

    if (result) {
      res.status(200).send("ok");
    } else {
      res.status(205).send("chyba");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/get_all_users", verifyToken, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).send(users);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
