const express = require('express')

const userControllers = require("../controllers/user")

const router = express.Router()

router.post("/register",userControllers.register)

router.post("/login",userControllers.login)

router.post("/logout",userControllers.logout)

router.get("/profile",userControllers.getProfile)

router.get('/people', userControllers.getAllUsers)

module.exports = router