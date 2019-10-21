import express from 'express'
import datalize,{field} from 'datalize'
import authToken from './../../middleware/token'
const router =  express.Router()
const controller = require('./controller');

router.get('/get/:id',controller.getUserFeedById);
router.get('/info/get', controller.getInfo);
router.post('/head/icon/set',authToken,controller.changeUserHead)

router.post('/setInfo',authToken,datalize([
    field('user_name').trim().required(),
    field('user_icon').trim().required(),
    field('user_sex').trim().required(),
    field('user_birth').trim().required(),
]),controller.setInfo);

router.post('/follow/set',authToken,datalize([
    field('follow_id').trim().required()
]),controller.followUser)
router.post('/follow/unset',authToken,datalize([
    field('follow_id').trim().required()
]),controller.followUser)

module.exports =  router