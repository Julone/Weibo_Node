import express from 'express'
const router =  express.Router()
const controller = require('./controller');
router.post('/topic/add',controller.topic_add);

module.exports =  router;