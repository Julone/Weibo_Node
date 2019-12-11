import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.post('/login',controller.login);
router.post('/register',datalize([
    _field('usermail').trim().required().email(),
    _field('userpass').trim().required().isAes()
]),controller.register);

router.get('/captcha',controller.captcha);

router.post('/sendEmailCap',datalize.query([
    _field('usermail').trim().required().email()
]),controller.sendEmailCap);

router.post('/checkUserName',datalize([
    _field('user_name','用户昵称').trim().required().nickName(2,10)
]),controller.unique_username);

module.exports =  router