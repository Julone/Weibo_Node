import express from 'express'
import datalize,{field} from 'datalize'
import authToken from './../../../middleware/token'
const router =  express.Router()
const ctrl = require('./controller');


router.get('/list',ctrl.fansListGet)

module.exports =  router