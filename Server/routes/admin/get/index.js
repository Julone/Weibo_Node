import express from 'express'
const router =  express.Router()
const controller = require('./controller');
router.get('/weibo/get',controller.weibo_get);
router.get('/reply/get',controller.reply_get);
router.get('/report/get',controller.report_get);
router.get('/users/get',controller.user_get);
router.get('/topic/get',controller.topic_get);

module.exports =  router;