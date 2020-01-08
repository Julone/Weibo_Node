import express from 'express'
const router =  express.Router();
const get = require('./get');
const update = require('./update');
const add =require('./add')
router.use(get);
router.use(update);
router.use(add);


module.exports =  router;