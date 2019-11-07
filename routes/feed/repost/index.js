import express from 'express'
import authToken from './../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

//无需用户ID就可以操作
router.get('/list/get', controller.get_repost_list)
//需要UserID才可以操作
router.post('/', authToken, datalize([
    _field('repost_text','转发的内容').trim().required(),
    _field('repost_from_id','被转发的ID').trim().required(),
    _field('repost_original_id','被转发的原始ID').trim().required()
]), controller.repost_feed);//转发微博 [repost_text,repost_from_id,repost_original_id]

module.exports = router;