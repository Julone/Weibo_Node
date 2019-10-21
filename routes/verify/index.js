import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.get('/', controller.default);
router.post('/login',controller.login);
router.post('/register',datalize([
    _field('usermail').trim().required().email(),
    _field('userpass').isAes().trim().required()
]),controller.register);
router.get('/captcha',controller.captcha);
// router.get('/checkCaptcha',controller.checkCaptcha);
router.post('/sendEmailCap',datalize.query([
    _field('usermail').trim().required().email()
]),controller.sendEmailCap);
// router.get('/checkEmail',controller.checkEmail);;
// router.get('/sms',controller.sms);

module.exports =  router