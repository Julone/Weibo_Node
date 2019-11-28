import express from 'express'
import authToken from './../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

router.get('/get', authToken, controller.get_follow_feed);

module.exports = router;