var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var io = require('socket.io');
var IOController = require('./IO/IOController');
var app = express();

var AuthController = require('./routes/Auth');
var GroupController = require('./routes/Groups');
var ProductController = require('./routes/Products');
var AdminProductController = require('./routes/AdminProducts');
var AdminGroupController = require('./routes/AdminGroups');
var AdminRewardsController = require('./routes/AdminRewards');
var LocationController = require('./routes/Locations');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use('/auth', (new AuthController(app)).router);
app.use('/groups', (new GroupController(app)).router);
app.use('/products', (new ProductController(app)).router);
app.use('/admin/products', (new AdminProductController(app)).router);
app.use('/admin/groups', (new AdminGroupController(app)).router);
app.use('/admin/rewards', (new AdminRewardsController(app)).router);
app.use('/locations', (new LocationController(app)).router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Socket.IO
 */
app.io = io();
app.IOController = new IOController(app.io);

module.exports = app;