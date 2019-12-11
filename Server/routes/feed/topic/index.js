import express from 'express'
import authToken from '../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

//无需用户ID就可以操作
router.get('/get', controller.get_topic_list);
router.get('/click', datalize_query([
    _field('id').required()
]), controller.topic_click);


module.exports = router;