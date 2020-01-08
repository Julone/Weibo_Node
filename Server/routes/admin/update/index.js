import express from 'express'
const router =  express.Router();
const controller = require('./controller');
router.post('/weibo/recover',controller.recover_feed);
router.post('/topic/recover',controller.recover_topic);
router.post('/reply/recover',controller.recover_comment);
router.post('/report/handled',controller.handle_report);
router.post('/user/status',controller.setUserStatus);
router.post('/topic/delete',controller.topic_delete);
// const feed = requirePath(ROUTE_ROOT,'feed','controller');

// router.post('/weibo/update',feed.delete_feed); //  var say_id = req.body.say_id;
// router.get('/reply/get',controller.reply_get);
// router.get('/report/get',controller.reply_get);
// router.get('/users/get',controller.reply_get);
// router.get('/topic/get',controller.reply_get);

module.exports =  router;