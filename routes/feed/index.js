import express from 'express'
import authToken from './../../middleware/token'
const router = express.Router()
const controller = require('./controller');

router.get('/', controller.default);
//无需用户ID就可以操作
router.get('/get', controller.get_feed);
router.get('/follow/get', authToken, controller.get_follow_feed);
router.get('/detail/get', controller.get_feed_by_id)
//需要UserID才可以操作
router.post('/send', authToken, controller.send_feed); //发送微博

router.delete('/delete', authToken, controller.delete_feed);
router.post('/like/set', authToken, datalize([_field('say_id').trim().required(), ]), controller.say_like);
router.post('/like/unset', authToken, datalize([_field('say_id').trim().required(), ]), controller.say_like);
router.post('/top/set', authToken, datalize([_field('id').trim().required(), ]), controller.set_top);
router.post('/top/unset', authToken, datalize([_field('id').trim().required(), ]), controller.set_top);
router.use('/comment',require('./comment'))
router.use('/repost',require('./repost'))

module.exports = router;