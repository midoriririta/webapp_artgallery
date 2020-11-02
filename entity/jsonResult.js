'use strict'

var jsonResult = {
    errorCodes: {
        OK: 0,
        AUTH_FAILED: -1,
        LOGIN_FAILED: -2,
        PARAM_INVALID: -3,
        LOGIC_ERROR: -4
    },
    success: function (msg, data) {
        msg = msg || 'OK'
        data = data || null
        return {
            code: jsonResult.errorCodes.OK,
            msg: msg,
            data: data
        }
    },
    failed: function (code, msg) {
        return {
            code: code,
            msg: msg
        }
    },
    authFailed: function () {
        return jsonResult.failed(
            jsonResult.errorCodes.AUTH_FAILED,
            'No Authorization'
        )
    },
    paramInvalidFailed: function (paramName) {
        return jsonResult.failed(
            jsonResult.errorCodes.PARAM_INVALID,
            `Missing ${paramName} parameter.`
        )
    },
    logicFailed: function (msg) {
        return jsonResult.failed(jsonResult.errorCodes.LOGIC_ERROR, msg)
    },
    loginFailed: function (msg) {
        return jsonResult.failed(jsonResult.errorCodes.LOGIN_FAILED, msg)
    }
}

module.exports = jsonResult
