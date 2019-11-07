import express from 'express'
import authToken from './../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

//无需用户ID就可以操作
router.get('/get', datalize_query([
    _field('say_id','评论ID').trim().required()
]),controller.get_comment);

//需要UserID才可以操作
router.post('/', authToken, datalize([
    _field('say_id','微博ID').trim().required(),
    _field('to_user_id','被评论用户ID').trim().required(),
    _field('reply_text','回复文本').trim().required()
]), controller.send_comment); //评论微博 [say_id,to_user_id,reply_text]

router.delete('/delete', authToken, controller.delete_comment);

module.exports = router;