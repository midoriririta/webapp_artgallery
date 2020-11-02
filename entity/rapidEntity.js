'use strict'
var util = require('../util')
var fs = require('fs')

var rapidEntity = {
    all: function () {
        try {
            if (!fs.existsSync(util.rapidCacheDataPath())) {
                util.writeRapidCacheData({})
                return {}
            }
            return util.readRapidCacheData()
        } catch (e) {
            console.log(`Get rapid caches failed, check the file [rapid-cache.json] access permission!`, e)
            return {}
        }
    },
    find: function (filePath) {
        var all = rapidEntity.all()
        return all[filePath]
    },
    create: function (filePath, cachedContentId) {
        if (!filePath || !cachedContentId) {
            return
        }
        var all = rapidEntity.all()
        if (all[filePath]) {
            return
        }

        all[filePath] = cachedContentId
        util.writeRapidCacheData(all)
    }
}

module.exports = rapidEntity
