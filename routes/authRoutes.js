const Router = require("express")
const controller = require("../controllers/authController");
const router = new Router()
const { check } = require("express-validator")

router.post("/registration", [
  check("username", "Username is required").notEmpty(),
  check("password", "Password minimum 8 symbols").isLength({ min: 8}),
], controller.registration)
router.post("/login", controller.login)

module.exports = router

