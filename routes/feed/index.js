import express from 'express'
import authToken from './../../middleware/token'
const router =  express.Router()
const controller = require('./controller');

router.get('/', controller.default);
//获取feed列表
router.get('/get',controller.get_feed);
router.get('/detail/get',controller.get_feed_by_id)
router.post('/send',authToken,controller.send_feed);
router.get('/follow/get',controller.get_follow_feed);
//repost
router.post('/repost',authToken,controller.repost_feed);
router.get('/repost/list/get',controller.get_repost_list)
//comment
router.post('/comment',authToken,controller.send_comment);
router.get('/comment/get',controller.get_comment);
//delete
router.delete('/delete',authToken,controller.delete_feed);
router.delete('/comment/delete',authToken,controller.delete_comment);
//like
router.post('/like/set',authToken,controller.say_like);
router.post('/like/unset',authToken,controller.say_like);
//setTop
router.post('/top/set',authToken,controller.set_top);
router.post('/top/unset',authToken,datalize([
    _field('id').trim().required(),
]),controller.set_top);

module.exports =  router