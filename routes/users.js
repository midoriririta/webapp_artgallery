'use strict'
var express = require('express')
var router = express.Router()
var jsonResult = require('../entity/jsonResult')
var userEntity = require('../entity/userEntity')

// GET /api/user/isUserLogined
router.get('/isUserLogined', function (req, res) {
    var loginedUser = userEntity.getLoginedUser(req.session)
    if (loginedUser) {
        res.json(jsonResult.success('OK', loginedUser.userName))
    } else {
        res.json(jsonResult.authFailed())
    }
})

// POST /api/user/login
router.post('/login', function (req, res) {
    var userName = req.body.userName
    var password = req.body.password
    if (userName === '' || password === '') {
        res.json(jsonResult.loginFailed('User name or password cannot be blank.'))
        return
    }
    var userInfo = userEntity.login(userName, password)
    if (!userInfo) {
        res.json(jsonResult.loginFailed('Login failed, user name or password error!'))
        return
    }
    req.session.userInfo = userInfo
    res.json(jsonResult.success('Login success!'))
})

// GET /api/user/logout
// Logout and redirect to home
router.get('/logout', function (req, res) {
    userEntity.logout(req.session)
    res.redirect('/')
})

module.exports = router
