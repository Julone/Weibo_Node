import express from 'express'
const router =  express.Router()
const controller = require('./controller')

router.get('/get', controller.getMenu);

module.exports =  router