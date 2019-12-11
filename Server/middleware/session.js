var session = require('express-session');
const hour = 1000 * 60 * 60;
var config = {
    secret: 'julone',
    resave: true,
    saveUninitialized: true,
    key: 'julone_sid',
    cookie: { 
        maxAge: hour * 2,
        secure: false
    }
}

module.exports = session(config)