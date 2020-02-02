const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

router.get("/", usersControllers.getUsers);
router.post(
  "/signup",
  //Looking for a request body key with name 'image'
  fileUpload.single("image"),
  [
    (check("name")
      .not()
      .isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check("password").isLength({ min: 6 }))
  ],
  usersControllers.signup
);
router.post("/login", usersControllers.login);

module.exports = router;
