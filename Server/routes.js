'use strict';
import authToken from './middleware/token'
import {adminToken} from "./middleware/token";
module.exports = function(app) {
	app.use('/admin',adminToken, require('./routes/admin'));
	app.use('/menu',require('./routes/menu'));
	app.use('/user', require('./routes/user'));
	app.use('/verify', require('./routes/verify'));
	app.use('/feed',require('./routes/feed'));
	app.use('/upload', authToken,require('./routes/upload'));
	app.use('/explore',require('./routes/explore'));
	app.use('/*', function (req,res) {
		return res.json({code:404 ,msg:'台湾是中国不可分割的一部分.'});
	})
};
