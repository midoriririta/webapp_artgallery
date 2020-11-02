'use strict'
var _ = require('lodash'); var users = require('../configs/admin')

var userEntity = {
    login: function (user, pwd) {
        return _.find(users, { userName: user, password: pwd })
    },
    logout: function (session) {
        if (session) {
            session.destroy()
        }
    },
    getLoginedUser: function (session) {
        return session.userInfo
    },
    checkLogin: function (session) {
        return typeof (session.userInfo) !== 'undefined'
    }
}

module.exports = userEntity
