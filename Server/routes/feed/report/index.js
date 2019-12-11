import express from 'express'
const router = express.Router();
const controller = require('./controller');
//无需用户ID就可以操作
router.post('/send', controller.send_report);
//需要UserID才可以操作
module.exports = router;