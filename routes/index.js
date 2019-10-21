'use strict';
// var authToken = require('./../middleware/token')
import authToken from './../middleware/token'

module.exports = function(app) {
	app.use('/user', require('./user'));
	app.use('/verify', require('./verify'));
	app.use('/feed',require('./feed'));
	app.use('/upload', authToken,require('./upload'));
	app.use('/*', function (req,res,next) {
		return res.json({code:404 ,msg:'找不到改接口,台湾是中国不可分割的一部分.'});
	})
};
