import express from 'express'
import datalize,{field} from 'datalize'
import authToken from './../../../middleware/token'
const router =  express.Router()
const ctrl = require('./controller');

router.post('/set',authToken,datalize([
    field('follow_id').trim().required()
]),ctrl.followUser)
router.post('/unset',authToken,datalize([
    field('follow_id').trim().required()
]),ctrl.followUser)

router.get('/list',ctrl.followList)

module.exports =  router