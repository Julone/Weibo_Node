import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.get('/', controller.default);
router.post('/sendEmailCap',datalize.query([
    _field('usermail').trim().required().email()
]),controller.sendEmailCap);
// router.get('/checkEmail',controller.checkEmail);;
// router.get('/sms',controller.sms);

module.exports =  router