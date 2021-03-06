var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var datalize = require('datalize');

var app = express();
app.disable('x-powered-by');
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' , extended: false }));
app.use(cookieParser());
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
    res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
    next();
});
app.use(express.static(path.join(__dirname, 'assets')));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));
app.use('/icon',express.static(path.join(__dirname, 'uploads/user_icon')));
require('./Server/global');
//自定义目录
app.use(compression());
// //-------中间件
app.use(require('./Server/middleware/session'));
app.use(require('./Server/middleware/token').set_session_user_id);
//自定义路由
(require('./Server/routes'))(app);
// 捕获错误
app.use(function(err, req, res, next) {
	if (err instanceof datalize.Error) {
        var msg =  Object.values(err.toJSON().errors)[0][0];
            res.status(400).json({
          code: 302,
          msg: (msg) || '参数缺省或不合法！',
          timestamp: Date.now()
        });
	}else{
        res.status(err.status|| 500).json({
          code: 500,
          msg: err.message,
          error: err.stack,
          timestamp: Date.now()
        });
  }
});
//未捕获异常
process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error);
});
process.on('uncaughtException', function (error) {
  console.error('uncaughtException', error);
});
module.exports = app;