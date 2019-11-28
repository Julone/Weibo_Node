import express from 'express'
import authToken from './../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

//无需用户ID就可以操作
router.get('/get', controller.get_topic_list)
//需要UserID才可以操作


module.exports = router;