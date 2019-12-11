import express from 'express';
const router =  express.Router();
const controller = require('./controller');
var userRoute = requirePath(ROUTE_ROOT,'user/controller');
var feedRoute = requirePath(ROUTE_ROOT,'feed','controller');
var topicRoute = requirePath(ROUTE_ROOT,'feed/topic','controller');

router.get('/hot',datalize_query([
    _field('sort','分类').required()
]),controller.get_hot);
router.get('/name',userRoute.get_user_name);
router.get('/topic',topicRoute.get_topic_list);
router.get('/search_feed',feedRoute.get_feed);
router.get('/search_user',userRoute.get_user_name);

module.exports =  router;