import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.post('/img',controller.img);

module.exports =  router