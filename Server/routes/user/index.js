import express from 'express'
import datalize,{ field } from 'datalize'
import authToken from '../../middleware/token'
const router =  express.Router();
const ctrl = require('./controller');

router.get('/get',ctrl.get_user_name);
router.get('/get/:id',ctrl.getUserFeedById);
router.get('/info/get',ctrl.getInfo);
router.post('/head/icon/set',authToken,ctrl.changeUserHead);

router.post('/setInfo',authToken,datalize([
    field('user_name').trim().required(),
    field('user_sex').trim().required(),
    field('user_birth').trim().required(),
]),ctrl.setInfo);
router.post('/setPassword',authToken,datalize([
    field('old_pass').trim().isAes().required(),
    field('new_pass').trim().isAes().required()
]),ctrl.setPassword);

router.use('/follow',require('./follow'));
router.use('/fans',require('./fans'));
module.exports =  router