import express from 'express'
const router =  express.Router()
import authToken from './../../middleware/token'
const controller = require('./controller');

router.get('/user',controller.searchByUser);


module.exports =  router