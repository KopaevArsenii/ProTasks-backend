const User = require("../models/User")
const Role = require("../models/Role")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { secret } = require("../config")
const { validationResult } = require("express-validator")

const generateAccessToken = (id, roles) => {
  const payload = { id, roles };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

class AuthController {
  async registration(req, res) {
    try{
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array()[0].msg });
      }
      const { username, password } = req.body
      const candidate = await User.findOne({username})
      if (candidate) return res.status(400).json({ message: "User already exists"})

      const hashPassword = bcrypt.hashSync(password, 7)
      const userRole = await Role.findOne({ value: "USER"})
      const user = new User({username, password: hashPassword, roles: [userRole.value]})
      await user.save();
      return res.json({ message: "User registered"})
    } catch (e) {
      res.status(400).json({ message: "Registration error"})
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) return res.status(400).json({ message: "User doesn't exist"})

      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) return res.status(400).json({ message: "Wrong password"})

      const token = generateAccessToken(user._id, user.roles)
      return res.json({ token })
    } catch (e) {
      res.status(400).json({ message: "Login error"})

    }

  }
}

module.exports = new AuthController();