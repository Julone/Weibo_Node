import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.get('/hot',datalize_query([
    _field('sort','分类').required()
]),controller.get_hot);

router.get('/name',controller.get_user_name);
router.get('/topic',controller.get_topics);

module.exports =  router;