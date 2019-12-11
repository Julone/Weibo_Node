import express from 'express'
const router =  express.Router();
const get = require('./get');
const update = require('./update');

router.use(get);
router.use(update);


module.exports =  router;