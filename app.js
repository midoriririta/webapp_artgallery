'use strict'
var debug = require('debug')
var express = require('express')
var path = require('path')
var ejs = require('ejs')
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var session = require('express-session')
var mainRouter = require('./routes/main')
var usersRouter = require('./routes/users')
var gallerysRouter = require('./routes/gallerys')
var photosRouter = require('./routes/photos')

var app = express()

app.use(favicon(path.join(__dirname, '/public/favicon.ico')))
app.set('views', path.join(__dirname, 'views'))
app.engine('.html', ejs.__express)
app.set('view engine', 'html')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'uploadfiles')))

app.use(session({
    secret: '98514B33AE7E4A219157E1B161BC631B',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}))

app.use('/', mainRouter)
app.use('/api/user', usersRouter)
app.use('/api/gallery', gallerysRouter)
app.use('/api/photo', photosRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found ' + req.originalUrl)
    err.status = 404
    console.log('Error:', err.message)
    next(err)
})

// error handlers
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500)
        res.render('error', {
            message: err.message,
            error: err
        })
    })
} else {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).send(err.message)
    })
}

app.set('port', process.env.PORT || 3000)
module.exports = app

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port)
})
