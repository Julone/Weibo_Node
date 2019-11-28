import express from 'express'
import authToken from './../../../middleware/token'
const router = express.Router()
const controller = require('./controller');

//get all favor list
router.get('/get',authToken,controller.get_favor);
//set favor status
router.post('/set', authToken, datalize([_field('say_id').trim().required(), ]), controller.add_favor);
router.post('/unset', authToken, datalize([_field('say_id').trim().required(), ]), controller.add_favor);

module.exports = router;