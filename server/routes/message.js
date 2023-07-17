const express = require('express')

const messageControllers = require('../controllers/message')

const router = express.Router()

router.get('/messages/:userId', messageControllers.getMessages)

module.exports= router